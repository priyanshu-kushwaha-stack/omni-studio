"""`omni upload`: a guarded wrapper around the pinned porjo/youtubeuploader binary (core/lock.yaml).

Hard rules, checked before the binary runs:
- privacy is ALWAYS private. A request for anything else (public, unlisted), a schedule (publishAt and friends),
  or any metadata key that could carry a status override is refused. The metaJSON this module writes is re-read
  and re-checked just before exec.
- made_for_kids (status.selfDeclaredMadeForKids) and contains_synthetic_media (status.containsSyntheticMedia,
  the altered or synthetic content disclosure) must both be answered with true or false. Defaults come from
  channel.yaml (`made_for_kids`, `upload.contains_synthetic_media`); a video's upload.yaml can answer them.
- the binary is the pinned build, re-hashed against core/lock.yaml before every run.
- secrets are only read from ~/.config/omni-studio/ and never printed: the OAuth client secret is
  youtube/client_secret.json and the token is the channel's upload_token_path (youtube/<slug>.token).

youtubeuploader 1.25.5 (files.go, LoadVideoMeta) sets both status fields from metaJSON only ("madeForKids",
"containsSyntheticMedia") and force-sends them, so `false` reaches the API instead of being dropped.

Dry run is the default. A real upload needs `run(..., confirm="<slug>/<video>")` and is never made by an agent
without the owner asking for that upload.
"""

from __future__ import annotations

import hashlib
import io
import json
import os
import platform
import re
import shlex
import subprocess
import tarfile
import tempfile
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Optional

import yaml

from studio import channels

ROOT = Path(__file__).resolve().parents[3]
LOCK = ROOT / "core" / "lock.yaml"

UPLOAD_KEYS = {"file", "title", "description", "tags", "category_id", "language", "made_for_kids",
               "contains_synthetic_media", "privacy", "thumbnail", "captions"}
# Normalised (lowercase, no _ - or spaces) keys that mean scheduling or a status override, at any depth.
SCHEDULE_KEYS = {"publishat", "publishtime", "publishdate", "schedule", "scheduled", "scheduledat",
                 "scheduledpublishtime", "scheduledstarttime", "releaseat", "premiere"}
PRIVACY_KEYS = {"privacy", "privacystatus", "visibility", "status"}
MAX_TITLE = 100
MAX_DESCRIPTION = 5000
MAX_THUMBNAIL = 2 * 1024 * 1024   # YouTube's limit for a custom thumbnail
THUMBNAIL_TYPES = (".jpg", ".jpeg", ".png")
CAPTION_TYPES = (".srt", ".vtt")


class UploadRefused(Exception):
    """The request breaks an upload rule. The message lists every problem."""


def config_dir() -> Path:
    """~/.config/omni-studio, or OMNI_STUDIO_CONFIG_DIR (tests only)."""
    return Path(os.environ.get("OMNI_STUDIO_CONFIG_DIR", Path.home() / ".config" / "omni-studio"))


def client_secret_path() -> Path:
    return config_dir() / "youtube" / "client_secret.json"


def token_path(channel: channels.Channel) -> Path:
    if not channel.config.upload_token_path:
        raise UploadRefused(f"channel {channel.slug!r} has no upload_token_path in channel.yaml")
    raw = channel.config.upload_token_path
    rel = raw.split("omni-studio/", 1)[1]
    return config_dir() / rel


def _home(path: Path | str) -> str:
    text = str(path)
    home = str(Path.home())
    return "~" + text[len(home):] if text.startswith(home + os.sep) else text


# --- the request ---


@dataclass
class UploadRequest:
    channel: str
    video: str
    file: Path
    metadata: dict[str, Any]
    youtube_channel_id: Optional[str]
    token: Path
    thumbnail: Optional[Path] = None
    captions: dict[str, Path] = field(default_factory=dict)
    notes: list[str] = field(default_factory=list)


def _norm(key: Any) -> str:
    return re.sub(r"[\s_\-]", "", str(key)).lower()


def forbidden(obj: Any, where: str = "upload.yaml") -> list[str]:
    """Every scheduling key and every non-private privacy value, at any depth."""
    problems = []
    if isinstance(obj, dict):
        for key, value in obj.items():
            name = _norm(key)
            here = f"{where}.{key}"
            if name in SCHEDULE_KEYS:
                problems.append(f"{here}: scheduled publishing is refused (uploads are private, never scheduled)")
            elif name in PRIVACY_KEYS and not (isinstance(value, str) and value == "private"):
                problems.append(f"{here}: privacy must be 'private'; {value!r} is refused")
            problems += forbidden(value, here)
    elif isinstance(obj, list):
        for i, value in enumerate(obj):
            problems += forbidden(value, f"{where}[{i}]")
    return problems


def assert_private(meta: dict[str, Any]) -> None:
    """The last check on the exact metaJSON the binary will read."""
    problems = []
    if meta.get("privacyStatus") != "private":
        problems.append(f"metaJSON privacyStatus is {meta.get('privacyStatus')!r}, not 'private'")
    problems += [p for p in forbidden({k: v for k, v in meta.items() if k != "privacyStatus"}, "metaJSON")]
    for key in ("madeForKids", "containsSyntheticMedia"):
        if not isinstance(meta.get(key), bool):
            problems.append(f"metaJSON {key} must be true or false, got {meta.get(key)!r}")
    if problems:
        raise UploadRefused("refused before the uploader ran:\n  " + "\n  ".join(problems))


def build_request(slug: str, video_id: str, privacy: Optional[str] = None,
                  upload_yaml: Optional[Path] = None) -> UploadRequest:
    channel = channels.load_channel(slug)
    folder = channels.video_dir(channel, video_id)
    path = upload_yaml or folder / "upload.yaml"
    problems: list[str] = []
    if privacy is not None and privacy != "private":
        problems.append(f"--privacy {privacy!r} is refused: uploads are always private")
    if not path.is_file():
        raise UploadRefused(f"no upload metadata: {path} is missing (see skills/studio/studio-short-publish.md)")
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(data, dict):
        raise UploadRefused(f"{path} must be a mapping")
    problems += forbidden(data, path.name)
    unknown = sorted(set(data) - UPLOAD_KEYS)
    for key in unknown:
        if _norm(key) not in SCHEDULE_KEYS | PRIVACY_KEYS:
            problems.append(f"{path.name}.{key}: unknown field (allowed: {sorted(UPLOAD_KEYS)})")

    title = str(data.get("title") or "").strip()
    if not title:
        problems.append(f"{path.name}.title: required")
    elif len(title) > MAX_TITLE or re.search(r"[<>]", title):
        problems.append(f"{path.name}.title: at most {MAX_TITLE} characters and no < or >")
    description = str(data.get("description") or "")
    if len(description.encode("utf-8")) > MAX_DESCRIPTION or re.search(r"[<>]", description):
        problems.append(f"{path.name}.description: at most {MAX_DESCRIPTION} bytes and no < or >")
    tags = data.get("tags") or []
    if not (isinstance(tags, list) and all(isinstance(t, str) and t.strip() for t in tags)):
        problems.append(f"{path.name}.tags: a list of words")

    media = folder / str(data.get("file") or "")
    if not data.get("file"):
        problems.append(f"{path.name}.file: required (the render, relative to the video folder)")
    elif not media.resolve().is_relative_to(folder.resolve()) or not media.is_file():
        problems.append(f"{path.name}.file: {data['file']!r} is not a file inside {folder.name}/")
    thumbnail = folder / str(data["thumbnail"]) if data.get("thumbnail") else None
    if thumbnail is not None:
        if not thumbnail.resolve().is_relative_to(folder.resolve()) or not thumbnail.is_file():
            problems.append(f"{path.name}.thumbnail: {data['thumbnail']!r} is not a file inside {folder.name}/")
        elif thumbnail.suffix.lower() not in THUMBNAIL_TYPES or thumbnail.stat().st_size > MAX_THUMBNAIL:
            problems.append(f"{path.name}.thumbnail: a JPG or PNG of at most 2 MB")
    captions = {}
    if data.get("captions") is not None:
        if not isinstance(data["captions"], dict):
            problems.append(f"{path.name}.captions: a mapping of language code to subtitle file, e.g. en: subtitles/en.srt")
        else:
            for lang, rel in data["captions"].items():
                track = folder / str(rel)
                if not re.fullmatch(r"[a-z]{2,3}(-[A-Za-z]{2,4})?", str(lang)):
                    problems.append(f"{path.name}.captions: {lang!r} is not a language code like en or hi")
                elif not track.resolve().is_relative_to(folder.resolve()) or not track.is_file() \
                        or track.suffix.lower() not in CAPTION_TYPES:
                    problems.append(f"{path.name}.captions.{lang}: {rel!r} is not an .srt or .vtt file inside {folder.name}/")
                else:
                    captions[str(lang)] = track

    kids = data["made_for_kids"] if "made_for_kids" in data else channel.config.made_for_kids
    if not isinstance(kids, bool):
        problems.append("made_for_kids is missing: answer true or false in upload.yaml or channel.yaml "
                        "(YouTube status.selfDeclaredMadeForKids); the upload is refused without it")
    elif kids != channel.config.made_for_kids:
        problems.append(f"made_for_kids {kids} disagrees with channel.yaml made_for_kids "
                        f"{channel.config.made_for_kids}; change channel.yaml if the audience changed")
    defaults = channel.config.upload
    ai = (data["contains_synthetic_media"] if "contains_synthetic_media" in data
          else defaults.contains_synthetic_media)
    if not isinstance(ai, bool):
        problems.append("contains_synthetic_media is missing: answer the altered or synthetic content disclosure "
                        "with true or false in upload.yaml or channel.yaml upload.contains_synthetic_media "
                        "(YouTube status.containsSyntheticMedia); the upload is refused without it")
    try:
        token = token_path(channel)
    except UploadRefused as exc:
        problems.append(str(exc))
        token = Path("/nonexistent")
    if problems:
        raise UploadRefused(f"upload of {slug}/{video_id} refused:\n  " + "\n  ".join(problems))

    meta = {
        "title": title,
        "description": description,
        "tags": tags,
        "categoryId": str(data.get("category_id") or defaults.category_id),
        "language": str(data.get("language") or defaults.language),
        "privacyStatus": "private",
        "madeForKids": kids,
        "containsSyntheticMedia": ai,
    }
    assert_private(meta)
    return UploadRequest(slug, video_id, media, meta, channel.config.youtube_channel_id, token, thumbnail, captions)


# --- the binary ---


def lock() -> dict[str, Any]:
    return yaml.safe_load(LOCK.read_text(encoding="utf-8"))["youtubeuploader"]


def platform_key() -> str:
    machine = {"x86_64": "amd64", "aarch64": "arm64"}.get(platform.machine(), platform.machine())
    return f"{platform.system()}_{machine}"


def binary_path() -> Path:
    return ROOT / lock()["install_dir"] / "youtubeuploader"


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def verify_binary() -> list[str]:
    pins = lock()["platforms"].get(platform_key())
    path = binary_path()
    if pins is None:
        return [f"no youtubeuploader pin for {platform_key()} in core/lock.yaml"]
    if not path.is_file():
        return [f"youtubeuploader is not installed at {path.relative_to(ROOT)}: run omni upload --install"]
    actual = _sha256(path.read_bytes())
    if actual != pins["binary_sha256"]:
        return [f"{path.relative_to(ROOT)} sha256 {actual} does not match the lock {pins['binary_sha256']}"]
    return []


def install(fetch: Callable[[str], bytes] | None = None) -> Path:
    """Download the pinned release tarball, check both hashes, and put the binary in install_dir."""
    pin = lock()
    plat = pin["platforms"].get(platform_key())
    if plat is None:
        raise UploadRefused(f"no youtubeuploader pin for {platform_key()} in core/lock.yaml")
    url = f"{pin['repo']}/releases/download/{pin['tag']}/{plat['asset']}"
    fetch = fetch or (lambda u: urllib.request.urlopen(u, timeout=120).read())
    blob = fetch(url)
    if _sha256(blob) != plat["tarball_sha256"]:
        raise UploadRefused(f"{plat['asset']} sha256 {_sha256(blob)} does not match the lock")
    with tarfile.open(fileobj=io.BytesIO(blob), mode="r:gz") as tar:
        binary = tar.extractfile("youtubeuploader").read()
    if _sha256(binary) != plat["binary_sha256"]:
        raise UploadRefused(f"youtubeuploader binary sha256 {_sha256(binary)} does not match the lock")
    path = binary_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(binary)
    path.chmod(0o755)
    return path


def command(req: UploadRequest, meta_path: Path, out_path: Path) -> list[str]:
    return [str(binary_path()), "-filename", str(req.file), "-metaJSON", str(meta_path),
            "-metaJSONout", str(out_path), "-privacy", "private", "-secrets", str(client_secret_path()),
            "-cache", str(req.token), "-sendFilename=false", "-quiet",
            *(["-thumbnail", str(req.thumbnail)] if req.thumbnail else [])]


def printable(cmd: list[str]) -> str:
    """The command, one flag per line, home folded to ~. It names the secret files; it never reads them."""
    def word(part: str) -> str:
        home = str(Path.home())
        return f'"$HOME{part[len(home):]}"' if part.startswith(home + os.sep) else shlex.quote(part)

    lines, i = [word(cmd[0])], 1
    while i < len(cmd):
        flag = cmd[i]
        if i + 1 < len(cmd) and not cmd[i + 1].startswith("-"):
            lines.append(f"{flag} {word(cmd[i + 1])}")
            i += 2
        else:
            lines.append(flag)
            i += 1
    return " \\\n    ".join(lines)


def fallback_tokens() -> list[Path]:
    """Where youtubeuploader looks when -cache/-secrets do not exist (oauth.go: os.UserConfigDir())."""
    bases = [Path.home() / "Library" / "Application Support", Path.home() / ".config"]
    return [b / "youtubeuploader" / n for b in bases for n in ("request.token", "client_secrets.json")]


def preflight(req: UploadRequest, first_auth: bool = False) -> list[str]:
    problems = verify_binary()
    if not client_secret_path().is_file():
        problems.append(f"OAuth client secret missing: {_home(client_secret_path())}")
    if not req.token.is_file():
        stray = [p for p in fallback_tokens() if p.exists()]
        if stray:
            problems.append("no channel token yet, and youtubeuploader would fall back to "
                            + ", ".join(_home(p) for p in stray) + " (another account?); move it away first")
        if not first_auth:
            problems.append(f"no token at {_home(req.token)}: the first run opens a browser for Google consent; "
                            "pass --first-auth with the owner at the keyboard")
    if not req.youtube_channel_id:
        problems.append(f"channel {req.channel!r} has no youtube_channel_id to check the upload against")
    return problems


def dry_run(req: UploadRequest) -> str:
    meta_path = Path("<tmp>/meta.json")
    out_path = Path("<tmp>/uploaded.json")
    cmd = command(req, meta_path, out_path)
    lines = [
        f"DRY RUN: nothing uploaded. {req.channel}/{req.video}",
        f"file      {req.file.relative_to(ROOT) if req.file.is_relative_to(ROOT) else req.file}",
        f"privacy   {req.metadata['privacyStatus']}  (always; public, unlisted and schedules are refused)",
        f"kids      madeForKids={json.dumps(req.metadata['madeForKids'])}  -> status.selfDeclaredMadeForKids",
        f"AI        containsSyntheticMedia={json.dumps(req.metadata['containsSyntheticMedia'])}  "
        "-> status.containsSyntheticMedia (altered or synthetic content)",
        f"channel   {req.youtube_channel_id} (checked against the token's channel before and after upload)",
        f"thumbnail {req.thumbnail.relative_to(ROOT) if req.thumbnail and req.thumbnail.is_relative_to(ROOT) else req.thumbnail or 'none: set it in Studio, or add thumbnail: to upload.yaml'}",
        "metaJSON  " + json.dumps(req.metadata, indent=2, ensure_ascii=False).replace("\n", "\n          "),
        "command   " + printable(cmd),
        "secrets   -secrets and -cache name files in ~/.config/omni-studio/youtube/; their contents are never "
        "read or printed here",
    ]
    problems = preflight(req)
    lines.append("preflight " + ("ok" if not problems else "a real run would stop here:\n  - "
                                 + "\n  - ".join(problems)))
    return "\n".join(lines)


# --- the real run (never by an agent without the owner asking) ---


def run(req: UploadRequest, confirm: str, first_auth: bool = False, api=None,
        runner: Callable[..., subprocess.CompletedProcess] = subprocess.run) -> dict[str, Any]:
    from studio.publish import youtube_api

    if confirm != f"{req.channel}/{req.video}":
        raise UploadRefused(f"--confirm must be exactly {req.channel}/{req.video}")
    problems = preflight(req, first_auth)
    if problems:
        raise UploadRefused("preflight failed:\n  " + "\n  ".join(problems))
    api = api or youtube_api.YouTubeAPI(client_secret_path(), req.token)
    if req.token.is_file():
        mine = api.mine_channel_id()
        if mine != req.youtube_channel_id:
            raise UploadRefused(f"the token belongs to channel {mine}, not {req.youtube_channel_id}; refused")
    with tempfile.TemporaryDirectory(prefix="omni-upload-") as tmp:
        meta_path, out_path = Path(tmp) / "meta.json", Path(tmp) / "uploaded.json"
        meta_path.write_text(json.dumps(req.metadata, ensure_ascii=False), encoding="utf-8")
        assert_private(json.loads(meta_path.read_text(encoding="utf-8")))
        proc = runner(command(req, meta_path, out_path), capture_output=True, text=True)
        if proc.returncode != 0 or not out_path.is_file():
            raise UploadRefused(f"youtubeuploader failed (exit {proc.returncode}): {proc.stderr.strip()[-400:]}")
        uploaded = json.loads(out_path.read_text(encoding="utf-8"))
    video_id = uploaded.get("id")
    readback = api.video_status(video_id)
    checks = youtube_api.verify_readback(readback, req.metadata, req.youtube_channel_id)
    log = {"channel": req.channel, "video": req.video, "youtube_video_id": video_id,
           "requested": req.metadata, "readback": readback, "readback_problems": checks}
    (_folder(req) / "upload_log.json").write_text(json.dumps(log, indent=2), encoding="utf-8")
    if checks:
        raise UploadRefused(f"uploaded {video_id} but the read-back disagrees; fix it in YouTube Studio now:\n  "
                            + "\n  ".join(checks))
    if req.captions:   # the uploader takes one caption file without a language, so tracks go through the API
        return set_captions(req, confirm, api)
    return log


def _folder(req: UploadRequest) -> Path:
    return req.file.parent if req.file.parent.name != "renders" else req.file.parent.parent


def _uploaded(req: UploadRequest, confirm: str, api=None):
    """The guards for changing a video `run` already uploaded (its id is in upload_log.json): the owner's --confirm,
    the client secret and the channel's own token. Returns (api, log, log path, video id)."""
    from studio.publish import youtube_api

    if confirm != f"{req.channel}/{req.video}":
        raise UploadRefused(f"--confirm must be exactly {req.channel}/{req.video}")
    log_path = _folder(req) / "upload_log.json"
    log = json.loads(log_path.read_text(encoding="utf-8")) if log_path.is_file() else {}
    video_id = log.get("youtube_video_id")
    if not video_id:
        raise UploadRefused(f"no uploaded video in {log_path.name}: upload first (omni upload --run)")
    problems = [p for p in preflight(req) if "youtubeuploader" not in p]
    if problems:
        raise UploadRefused("preflight failed:\n  " + "\n  ".join(problems))
    api = api or youtube_api.YouTubeAPI(client_secret_path(), req.token)
    mine = api.mine_channel_id()
    if mine != req.youtube_channel_id:
        raise UploadRefused(f"the token belongs to channel {mine}, not {req.youtube_channel_id}; refused")
    return api, log, log_path, video_id


def set_thumbnail(req: UploadRequest, confirm: str, api=None) -> dict[str, Any]:
    """Set upload.yaml's thumbnail on the uploaded video; nothing else about the video changes."""
    if req.thumbnail is None:
        raise UploadRefused("upload.yaml has no thumbnail: add thumbnail: <image inside the video folder>")
    api, log, log_path, video_id = _uploaded(req, confirm, api)
    served = api.set_thumbnail(video_id, req.thumbnail)
    if not served:
        raise UploadRefused(f"thumbnails.set returned nothing for {video_id}; check the thumbnail in Studio")
    log["thumbnail"] = {"file": str(req.thumbnail.relative_to(_folder(req))), "served": served}
    log_path.write_text(json.dumps(log, indent=2), encoding="utf-8")
    return log


def set_captions(req: UploadRequest, confirm: str, api=None) -> dict[str, Any]:
    """Add upload.yaml's subtitle tracks to the uploaded video, one published track per language."""
    if not req.captions:
        raise UploadRefused("upload.yaml has no captions: add captions: {en: subtitles/en.srt}")
    api, log, log_path, video_id = _uploaded(req, confirm, api)
    added = []
    for lang, track in req.captions.items():
        caption = api.insert_caption(video_id, lang, "", track)
        if not caption.get("id"):
            raise UploadRefused(f"captions.insert returned no id for {lang}; check Subtitles in Studio")
        added.append({"language": lang, "file": str(track.relative_to(_folder(req))), "id": caption["id"]})
    log["captions"] = added
    log_path.write_text(json.dumps(log, indent=2), encoding="utf-8")
    return log
