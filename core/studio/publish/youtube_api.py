"""Read-only YouTube Data API calls for `omni upload`: whose channel a token is, and a video's status after upload.

Uses the same OAuth client and token youtubeuploader uses (its scopes include `youtube`, which allows
channels.list and videos.list). The access token is refreshed in memory and never written or printed; the token
file is not modified. Standard library only.
"""

from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Optional

API = "https://www.googleapis.com/youtube/v3"
TOKEN_URI = "https://oauth2.googleapis.com/token"


class YouTubeAPI:
    def __init__(self, client_secret: Path, token: Path, opener=urllib.request.urlopen):
        self._client_secret = Path(client_secret)
        self._token = Path(token)
        self._open = opener
        self._access: Optional[str] = None

    def _access_token(self) -> str:
        if self._access:
            return self._access
        secret = json.loads(self._client_secret.read_text(encoding="utf-8"))
        client = secret.get("installed") or secret.get("web") or {}
        token = json.loads(self._token.read_text(encoding="utf-8"))
        body = urllib.parse.urlencode({
            "client_id": client["client_id"], "client_secret": client["client_secret"],
            "refresh_token": token["refresh_token"], "grant_type": "refresh_token",
        }).encode()
        with self._open(urllib.request.Request(client.get("token_uri", TOKEN_URI), data=body), timeout=30) as resp:
            self._access = json.loads(resp.read())["access_token"]
        return self._access

    def _get(self, path: str, **params: str) -> dict[str, Any]:
        url = f"{API}/{path}?{urllib.parse.urlencode(params)}"
        request = urllib.request.Request(url, headers={"Authorization": f"Bearer {self._access_token()}"})
        with self._open(request, timeout=30) as resp:
            return json.loads(resp.read())

    def mine_channel_id(self) -> Optional[str]:
        items = self._get("channels", part="id", mine="true").get("items", [])
        return items[0]["id"] if items else None

    def video_status(self, video_id: str) -> dict[str, Any]:
        items = self._get("videos", part="status,snippet", id=video_id).get("items", [])
        if not items:
            return {"found": False, "id": video_id}
        status, snippet = items[0].get("status", {}), items[0].get("snippet", {})
        return {"found": True, "id": video_id, "channelId": snippet.get("channelId"),
                "privacyStatus": status.get("privacyStatus"), "publishAt": status.get("publishAt"),
                "selfDeclaredMadeForKids": status.get("selfDeclaredMadeForKids"),
                "madeForKids": status.get("madeForKids"),
                "containsSyntheticMedia": status.get("containsSyntheticMedia")}


def verify_readback(readback: dict[str, Any], requested: dict[str, Any], channel_id: Optional[str]) -> list[str]:
    """What the API says against what was asked for. Empty means it landed private with both fields set."""
    if not readback.get("found"):
        return [f"video {readback.get('id')} not found by videos.list"]
    problems = []
    if readback["privacyStatus"] != "private":
        problems.append(f"privacyStatus is {readback['privacyStatus']!r}, not private: set it to Private now")
    if readback.get("publishAt"):
        problems.append(f"publishAt is set ({readback['publishAt']}): remove the schedule now")
    if channel_id and readback.get("channelId") != channel_id:
        problems.append(f"landed on channel {readback.get('channelId')}, not {channel_id}")
    kids = readback.get("selfDeclaredMadeForKids", readback.get("madeForKids"))
    if kids is not requested["madeForKids"]:
        problems.append(f"made for kids reads back {kids!r}, asked {requested['madeForKids']}")
    if readback.get("containsSyntheticMedia") is not requested["containsSyntheticMedia"]:
        problems.append(f"containsSyntheticMedia reads back {readback.get('containsSyntheticMedia')!r}, "
                        f"asked {requested['containsSyntheticMedia']}")
    return problems
