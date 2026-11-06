"""`omni youtube-auth <slug>`: Google consent for one channel, checked BEFORE any token is saved or any upload.

youtubeuploader 1.25.5 has no consent-only mode (main.go requires -filename before OAuth, and oauth.go runs the
consent inside the upload), so on its own the first upload could land on whatever channel was picked at the
consent screen. This helper does the same three-legged OAuth with the same client, redirect URI and scopes,
asks channels.list(mine=true) which channel the new token belongs to, and only if it is the channel.yaml
youtube_channel_id writes the token to the channel's cache file, in the JSON youtubeuploader's CacheFile reads
(golang.org/x/oauth2 Token: access_token, token_type, refresh_token, expiry). A wrong channel is refused and
nothing is written. Token values are never printed.
"""

from __future__ import annotations

import http.server
import json
import os
import secrets as pysecrets
import tempfile
import threading
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable, Optional

from studio import channels
from studio.publish import youtube

# The scopes youtubeuploader asks for (run.go): upload, partner, and youtube (channels.list / videos.list).
SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtubepartner",
          "https://www.googleapis.com/auth/youtube"]
DEFAULT_REDIRECT = "http://localhost:8080/oauth2callback"
AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
TOKEN_URI = "https://oauth2.googleapis.com/token"
API = "https://www.googleapis.com/youtube/v3"


class AuthRefused(Exception):
    pass


def client_config(path: Path) -> dict:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    client = data.get("web") or data.get("installed")
    if not client or not client.get("client_id") or not client.get("client_secret"):
        raise AuthRefused(f"{youtube._home(path)} is not a Google OAuth client file (no web/installed client)")
    return client


def wait_for_code(redirect: str, state: str, timeout: float = 300) -> str:
    """Serve the redirect URI once and return the authorization code (state checked)."""
    parsed = urllib.parse.urlparse(redirect)
    result: dict[str, str] = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            if urllib.parse.urlparse(self.path).path != parsed.path:
                self.send_response(404)
                self.end_headers()
                return
            result.update({k: v[0] for k, v in query.items()})
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"omni-studio: consent received, you can close this tab.")

        def log_message(self, *args):
            pass

    server = http.server.HTTPServer((parsed.hostname or "localhost", parsed.port or 80), Handler)
    server.timeout = timeout
    thread = threading.Thread(target=server.handle_request)
    thread.start()
    thread.join(timeout + 5)
    server.server_close()
    if result.get("state") != state:
        raise AuthRefused("consent callback state mismatch (or no callback); nothing written")
    if "code" not in result:
        raise AuthRefused(f"consent refused: {result.get('error', 'no code returned')}; nothing written")
    return result["code"]


def authorize(slug: str, *, replace: bool = False,
              open_url: Callable[[str], object] = webbrowser.open,
              get_code: Callable[[str, str], str] = wait_for_code,
              opener=urllib.request.urlopen, say: Callable[[str], None] = print) -> Path:
    channel = channels.load_channel(slug)
    expected = channel.config.youtube_channel_id
    if not expected:
        raise AuthRefused(f"channel {slug!r} has no youtube_channel_id to check the token against")
    token_file = youtube.token_path(channel)
    if token_file.exists() and not replace:
        raise AuthRefused(f"{youtube._home(token_file)} already exists; pass --replace to redo consent")
    client = client_config(youtube.client_secret_path())
    redirect = (client.get("redirect_uris") or [DEFAULT_REDIRECT])[0]
    state = pysecrets.token_urlsafe(24)
    url = (client.get("auth_uri") or AUTH_URI) + "?" + urllib.parse.urlencode({
        "client_id": client["client_id"], "redirect_uri": redirect, "response_type": "code",
        "scope": " ".join(SCOPES), "access_type": "offline", "prompt": "consent", "state": state})
    say(f"Opening Google consent for {slug}. Pick the channel {expected} (the brand account, not a personal "
        f"channel). If no browser opens, visit:\n{url}")
    open_url(url)
    code = get_code(redirect, state)

    body = urllib.parse.urlencode({"code": code, "client_id": client["client_id"],
                                   "client_secret": client["client_secret"], "redirect_uri": redirect,
                                   "grant_type": "authorization_code"}).encode()
    with opener(urllib.request.Request(client.get("token_uri") or TOKEN_URI, data=body), timeout=30) as resp:
        grant = json.loads(resp.read())
    if not grant.get("refresh_token"):
        raise AuthRefused("Google returned no refresh token; nothing written")

    request = urllib.request.Request(f"{API}/channels?part=id&mine=true",
                                     headers={"Authorization": f"Bearer {grant['access_token']}"})
    with opener(request, timeout=30) as resp:
        items = json.loads(resp.read()).get("items", [])
    mine = items[0]["id"] if items else None
    if mine != expected:
        raise AuthRefused(f"consent was given for channel {mine}, not {expected}; refused, no token written. "
                          "Run again and pick the right channel.")

    expiry = datetime.now(timezone.utc) + timedelta(seconds=int(grant.get("expires_in", 0)))
    token = {"access_token": grant["access_token"], "token_type": grant.get("token_type", "Bearer"),
             "refresh_token": grant["refresh_token"], "expiry": expiry.isoformat()}
    token_file.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, tmp = tempfile.mkstemp(dir=token_file.parent, prefix=".token-")
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        json.dump(token, handle)
    os.chmod(tmp, 0o600)
    os.replace(tmp, token_file)
    say(f"token for {expected} saved to {youtube._home(token_file)} (mode 600); contents not shown")
    return token_file
