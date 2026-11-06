"""Phase 4: `omni upload` is private-only, needs kids and AI answers, and runs only the pinned binary."""

from __future__ import annotations

import hashlib
import io
import json
import subprocess
import tarfile
from datetime import date
from pathlib import Path

import pytest
import yaml

from studio import channels, cli
from studio.publish import youtube, youtube_api

REAL_ROOT = Path(__file__).resolve().parents[3]
TAILS = REAL_ROOT / "channels" / "professor-of-us" / "videos" / "2026-10-31_tails"
VIDEO = "2026-11-06_test-short"
BASE = {"file": "renders/final.mp4", "title": "A Test Short", "description": "Sources: https://example.org",
        "tags": ["science"]}


@pytest.fixture()
def video(studio_root):
    channel = studio_root("alpha")
    folder = channels.new_video(channel, "Test Short", "short", on=date(2026, 11, 6))
    (folder / "renders" / "final.mp4").write_bytes(b"\x00" * 64)
    return channel, folder


def _upload(folder, **fields):
    data = {**BASE, **fields}
    (folder / "upload.yaml").write_text(yaml.safe_dump({k: v for k, v in data.items() if v is not ...}))


def _refused(*args, **kwargs):
    with pytest.raises(youtube.UploadRefused) as exc:
        youtube.build_request(*args, **kwargs)
    return str(exc.value)


# --- the happy path ---


def test_request_is_private_with_kids_and_ai_from_channel_yaml(video):
    channel, folder = video
    _upload(folder)
    req = youtube.build_request("alpha", VIDEO)
    assert req.metadata["privacyStatus"] == "private"
    assert req.metadata["madeForKids"] is False and req.metadata["containsSyntheticMedia"] is False
    assert req.token.name == "alpha.token" and "omni-studio/youtube" in str(req.token)
    cmd = youtube.command(req, Path("m.json"), Path("o.json"))
    assert cmd[cmd.index("-privacy") + 1] == "private"
    assert "-metaJSON" in cmd and str(youtube.client_secret_path()) in cmd


def test_dry_run_prints_the_command_and_never_reads_secrets(video, capsys, tmp_path):
    channel, folder = video
    _upload(folder)
    secret = youtube.client_secret_path()
    secret.parent.mkdir(parents=True)
    secret.write_text('{"installed": {"client_secret": "NOT-PRINTED"}}')
    assert cli.main(["upload", "alpha", VIDEO]) == 0
    out = capsys.readouterr().out
    assert "DRY RUN: nothing uploaded" in out and '"privacyStatus": "private"' in out
    assert "madeForKids=false" in out and "containsSyntheticMedia=false" in out
    assert "NOT-PRINTED" not in out and "-privacy private" in out


@pytest.mark.skipif(not (TAILS / "renders" / "rerender_noboil.mp4").is_file(), reason="tails media is local only")
def test_tails_short_dry_run_is_private_with_both_fields(capsys):
    assert cli.main(["upload", "professor-of-us", "2026-10-31_tails", "--dry-run"]) == 0
    out = capsys.readouterr().out
    assert "renders/rerender_noboil.mp4" in out and "privacy   private" in out
    assert "madeForKids=false" in out and "containsSyntheticMedia=false" in out


# --- planted faults: privacy and scheduling ---


@pytest.mark.parametrize("privacy", ["public", "unlisted", "private"])
def test_there_is_no_privacy_flag_at_all(video, privacy, capsys):
    _upload(video[1])
    with pytest.raises(SystemExit) as exc:
        cli.main(["upload", "alpha", VIDEO, "--privacy", privacy])
    assert exc.value.code == 2 and "unrecognized arguments: --privacy" in capsys.readouterr().err


@pytest.mark.parametrize("fields,needle", [
    ({"privacy": "public"}, "upload.yaml.privacy: privacy must be 'private'; 'public' is refused"),
    ({"privacy": "unlisted"}, "upload.yaml.privacy: privacy must be 'private'; 'unlisted' is refused"),
    ({"privacyStatus": "public"}, "privacy must be 'private'"),
    ({"visibility": "public"}, "privacy must be 'private'"),
    ({"status": {"privacyStatus": "public"}}, "privacy must be 'private'"),
    ({"publishAt": "2026-12-01T10:00:00Z"}, "upload.yaml.publishAt: scheduled publishing is refused"),
    ({"publish_at": "2026-12-01"}, "scheduled publishing is refused"),
    ({"schedule": {"at": "tomorrow"}}, "scheduled publishing is refused"),
    ({"tags": [{"publishAt": "x"}]}, "scheduled publishing is refused"),
    ({"thumbnail_override": "x"}, "unknown field"),
])
def test_non_private_or_scheduled_metadata_is_refused(video, fields, needle):
    _upload(video[1], **fields)
    assert needle in _refused("alpha", VIDEO)


def test_private_privacy_field_is_allowed(video):
    _upload(video[1], privacy="private")
    assert youtube.build_request("alpha", VIDEO).metadata["privacyStatus"] == "private"


def test_tampered_metajson_is_caught_before_exec():
    meta = {"privacyStatus": "private", "madeForKids": False, "containsSyntheticMedia": False}
    youtube.assert_private(meta)
    for bad in ({**meta, "privacyStatus": "public"}, {**meta, "publishAt": "2026-12-01T00:00:00Z"},
                {**meta, "madeForKids": None}, {k: v for k, v in meta.items() if k != "containsSyntheticMedia"}):
        with pytest.raises(youtube.UploadRefused, match="refused before the uploader ran"):
            youtube.assert_private(bad)


# --- planted faults: kids and AI disclosure ---


def test_missing_kids_field_is_refused(video):
    _upload(video[1], made_for_kids=None)
    assert "made_for_kids is missing" in _refused("alpha", VIDEO)


def test_kids_answer_must_match_the_channel(video):
    _upload(video[1], made_for_kids=True)
    assert "disagrees with channel.yaml made_for_kids" in _refused("alpha", VIDEO)


def test_missing_ai_field_is_refused(studio_root):
    channel = studio_root("beta", upload={"contains_synthetic_media": None})
    folder = channels.new_video(channel, "Test Short", "short", on=date(2026, 11, 6))
    (folder / "renders" / "final.mp4").write_bytes(b"\x00")
    _upload(folder)
    assert "contains_synthetic_media is missing" in _refused("beta", VIDEO)
    _upload(folder, contains_synthetic_media=True)
    assert youtube.build_request("beta", VIDEO).metadata["containsSyntheticMedia"] is True


def test_channel_without_an_upload_block_does_not_load(studio_root):
    from studio.channels import ChannelError

    with pytest.raises(ChannelError, match=r"upload: Input should be a valid dictionary"):
        studio_root("gamma", upload=None)


def test_ai_field_set_to_null_in_upload_yaml_is_refused(video):
    _upload(video[1], contains_synthetic_media=None)
    assert "contains_synthetic_media is missing" in _refused("alpha", VIDEO)


def test_bad_file_title_and_missing_metadata_are_refused(video):
    _upload(video[1], file="../../../etc/passwd", title="")
    text = _refused("alpha", VIDEO)
    assert "title: required" in text and "is not a file inside" in text
    (video[1] / "upload.yaml").unlink()
    assert "no upload metadata" in _refused("alpha", VIDEO)


def test_token_must_be_the_channels_own(studio_root):
    from studio.channels import ChannelError

    with pytest.raises(ChannelError, match="one token per channel"):
        studio_root("delta", upload_token_path="~/.config/omni-studio/youtube/alpha.token")


# --- the pinned binary ---


def test_lock_pins_the_release_and_both_hashes():
    pin = youtube.lock()
    assert pin["version"] == "1.25.5" and pin["tag"] == "v1.25.5"
    plat = pin["platforms"]["Darwin_arm64"]
    assert len(plat["tarball_sha256"]) == 64 and len(plat["binary_sha256"]) == 64
    assert pin["install_dir"].startswith(".tools/")
    ignored = subprocess.run(["git", "-C", str(REAL_ROOT), "check-ignore", "-q", pin["install_dir"] + "/x"])
    assert ignored.returncode == 0


def test_install_checks_both_hashes(monkeypatch, tmp_path):
    monkeypatch.setattr(youtube, "ROOT", tmp_path)
    monkeypatch.setattr(youtube, "platform_key", lambda: "Darwin_arm64")
    binary = b"fake youtubeuploader"
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        info = tarfile.TarInfo("youtubeuploader")
        info.size = len(binary)
        tar.addfile(info, io.BytesIO(binary))
    blob = buf.getvalue()
    with pytest.raises(youtube.UploadRefused, match="does not match the lock"):
        youtube.install(fetch=lambda url: blob)
    pin = {"repo": "r", "tag": "t", "install_dir": "bin", "platforms": {"Darwin_arm64": {
        "asset": "a.tgz", "tarball_sha256": hashlib.sha256(blob).hexdigest(),
        "binary_sha256": hashlib.sha256(binary).hexdigest()}}}
    monkeypatch.setattr(youtube, "lock", lambda: pin)
    assert youtube.install(fetch=lambda url: blob).read_bytes() == binary
    assert youtube.verify_binary() == []
    (tmp_path / "bin" / "youtubeuploader").write_bytes(b"swapped")
    assert "does not match the lock" in youtube.verify_binary()[0]


# --- the real run, with a fake binary and a fake API ---


class FakeAPI:
    def __init__(self, channel_id, status):
        self.channel_id, self.status = channel_id, status

    def mine_channel_id(self):
        return self.channel_id

    def video_status(self, video_id):
        return {"found": True, "id": video_id, **self.status}


def _ready(video, monkeypatch):
    channel, folder = video
    _upload(folder)
    req = youtube.build_request("alpha", VIDEO)
    monkeypatch.setattr(youtube, "verify_binary", lambda: [])
    # The file-binding rule has its own end-to-end tests (test_studio_short.py); here it is satisfied.
    monkeypatch.setattr(youtube, "approved_media_problems", lambda req: [])
    youtube.client_secret_path().parent.mkdir(parents=True, exist_ok=True)
    youtube.client_secret_path().write_text("{}")
    req.token.write_text("{}")
    return req


def _runner(seen):
    def run(cmd, **kwargs):
        seen.append(json.loads(Path(cmd[cmd.index("-metaJSON") + 1]).read_text()))
        Path(cmd[cmd.index("-metaJSONout") + 1]).write_text(json.dumps({"id": "vid123"}))
        return subprocess.CompletedProcess(cmd, 0, "Upload successful! Video ID: vid123", "")
    return run


GOOD_STATUS = {"privacyStatus": "private", "publishAt": None, "selfDeclaredMadeForKids": False,
               "containsSyntheticMedia": False}


def test_run_uploads_private_and_verifies_the_readback(video, monkeypatch):
    req = _ready(video, monkeypatch)
    seen = []
    api = FakeAPI(req.youtube_channel_id, {**GOOD_STATUS, "channelId": req.youtube_channel_id})
    log = youtube.run(req, "alpha/" + VIDEO, api=api, runner=_runner(seen))
    assert log["youtube_video_id"] == "vid123" and log["readback_problems"] == []
    assert seen[0]["privacyStatus"] == "private" and "publishAt" not in seen[0]
    assert (video[1] / "upload_log.json").is_file()


def test_run_refuses_without_confirm_or_with_the_wrong_token(video, monkeypatch):
    req = _ready(video, monkeypatch)
    with pytest.raises(youtube.UploadRefused, match="--confirm must be exactly"):
        youtube.run(req, "alpha/other", api=FakeAPI(None, {}), runner=_runner([]))
    with pytest.raises(youtube.UploadRefused, match="token belongs to channel"):
        youtube.run(req, "alpha/" + VIDEO, api=FakeAPI("UCsomeoneelse", {}), runner=_runner([]))


def test_run_needs_the_channel_token_made_by_youtube_auth(video, monkeypatch):
    req = _ready(video, monkeypatch)
    req.token.unlink()
    with pytest.raises(youtube.UploadRefused, match="omni youtube-auth alpha"):
        youtube.run(req, "alpha/" + VIDEO, api=FakeAPI(None, {}), runner=_runner([]))


def test_run_refuses_a_pipeline_video_whose_g7_is_not_approved(video, monkeypatch):
    channel, folder = video
    _upload(folder)
    req = youtube.build_request("alpha", VIDEO)
    problems = youtube.approved_media_problems(req)
    assert any("publish_prep (G7)" in p and "is not approved" in p for p in problems)
    monkeypatch.setattr(youtube, "verify_binary", lambda: [])
    youtube.client_secret_path().parent.mkdir(parents=True, exist_ok=True)
    youtube.client_secret_path().write_text("{}")
    req.token.write_text("{}")
    with pytest.raises(youtube.UploadRefused, match="is not approved"):
        youtube.run(req, "alpha/" + VIDEO, api=FakeAPI(req.youtube_channel_id, {}), runner=_runner([]))


@pytest.mark.parametrize("change,needle", [
    ({"privacyStatus": "public"}, "not private"),
    ({"publishAt": "2026-12-01T00:00:00Z"}, "remove the schedule"),
    ({"containsSyntheticMedia": None}, "containsSyntheticMedia reads back"),
    ({"selfDeclaredMadeForKids": True}, "made for kids reads back"),
    ({"channelId": "UCwrong"}, "landed on channel"),
])
def test_readback_mismatch_is_loud(video, monkeypatch, change, needle):
    req = _ready(video, monkeypatch)
    status = {**GOOD_STATUS, "channelId": req.youtube_channel_id, **change}
    with pytest.raises(youtube.UploadRefused, match=needle):
        youtube.run(req, "alpha/" + VIDEO, api=FakeAPI(req.youtube_channel_id, status), runner=_runner([]))


def test_api_refreshes_in_memory_and_reads_status(tmp_path):
    secret, token = tmp_path / "s.json", tmp_path / "t.token"
    secret.write_text(json.dumps({"installed": {"client_id": "id", "client_secret": "sec"}}))
    token.write_text(json.dumps({"access_token": "old", "refresh_token": "r"}))
    before = token.read_text()
    calls = []

    class Resp(io.BytesIO):
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    def opener(request, timeout):
        calls.append(request.full_url)
        if "oauth2" in request.full_url:
            return Resp(json.dumps({"access_token": "fresh"}).encode())
        assert request.headers["Authorization"] == "Bearer fresh"
        return Resp(json.dumps({"items": [{"status": {"privacyStatus": "private", "containsSyntheticMedia": False,
                                                       "selfDeclaredMadeForKids": False},
                                           "snippet": {"channelId": "UCx"}}]}).encode())

    api = youtube_api.YouTubeAPI(secret, token, opener=opener)
    status = api.video_status("v1")
    assert status["privacyStatus"] == "private" and status["channelId"] == "UCx"
    assert youtube_api.verify_readback(status, {"madeForKids": False, "containsSyntheticMedia": False}, "UCx") == []
    assert token.read_text() == before and len(calls) == 2


# --- omni youtube-auth: consent, channel check, then the token ---

from studio.publish import youtube_auth  # noqa: E402


class _Resp(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def _auth_opener(channel_id, refresh="r1"):
    calls = []

    def opener(request, timeout):
        calls.append(request.full_url)
        if "oauth2" in request.full_url:
            grant = {"access_token": "a1", "expires_in": 3599, "token_type": "Bearer"}
            if refresh:
                grant["refresh_token"] = refresh
            return _Resp(json.dumps(grant).encode())
        assert "channels?part=id&mine=true" in request.full_url
        return _Resp(json.dumps({"items": [{"id": channel_id}] if channel_id else []}).encode())

    return opener, calls


def _client(studio_root):
    channel = studio_root("alpha")
    path = youtube.client_secret_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"web": {"client_id": "cid", "client_secret": "csec",
                                        "redirect_uris": ["http://localhost:8080/oauth2callback"]}}))
    return channel


def test_youtube_auth_saves_the_token_only_for_the_right_channel(studio_root):
    channel = _client(studio_root)
    opener, calls = _auth_opener(channel.config.youtube_channel_id)
    urls, said = [], []
    path = youtube_auth.authorize("alpha", open_url=urls.append, get_code=lambda r, s: "code1",
                                  opener=opener, say=said.append)
    token = json.loads(path.read_text())
    assert set(token) == {"access_token", "token_type", "refresh_token", "expiry"}
    assert oct(path.stat().st_mode & 0o777) == "0o600" and path == youtube.token_path(channel)
    assert "access_type=offline" in urls[0] and "youtube.upload" in urls[0] and "state=" in urls[0]
    assert len(calls) == 2 and not any("a1" in line or "r1" in line for line in said)


def test_youtube_auth_for_the_wrong_channel_writes_nothing(studio_root):
    channel = _client(studio_root)
    opener, _ = _auth_opener("UCsomeoneelse0000000000")
    with pytest.raises(youtube_auth.AuthRefused, match="consent was given for channel UCsomeoneelse"):
        youtube_auth.authorize("alpha", open_url=lambda u: None, get_code=lambda r, s: "c", opener=opener,
                               say=lambda m: None)
    assert not youtube.token_path(channel).exists()
    assert not list(youtube.token_path(channel).parent.glob(".token-*"))


def test_youtube_auth_refuses_an_existing_token_and_a_grant_without_refresh(studio_root):
    channel = _client(studio_root)
    token = youtube.token_path(channel)
    token.write_text("{}")
    opener, _ = _auth_opener(channel.config.youtube_channel_id)
    kwargs = dict(open_url=lambda u: None, get_code=lambda r, s: "c", say=lambda m: None)
    with pytest.raises(youtube_auth.AuthRefused, match="already exists"):
        youtube_auth.authorize("alpha", opener=opener, **kwargs)
    opener, _ = _auth_opener(channel.config.youtube_channel_id, refresh=None)
    with pytest.raises(youtube_auth.AuthRefused, match="no refresh token"):
        youtube_auth.authorize("alpha", replace=True, opener=opener, **kwargs)
    assert token.read_text() == "{}"


def test_consent_callback_checks_state(tmp_path):
    import socket
    import threading
    import urllib.request

    def free_port():
        with socket.socket() as sock:
            sock.bind(("localhost", 0))
            return sock.getsockname()[1]

    for sent, expect in (("good", "code9"), ("bad", None)):
        port = free_port()
        redirect = f"http://localhost:{port}/oauth2callback"
        out = {}

        def serve():
            try:
                out["code"] = youtube_auth.wait_for_code(redirect, "good", timeout=10)
            except youtube_auth.AuthRefused as exc:
                out["error"] = str(exc)

        thread = threading.Thread(target=serve)
        thread.start()
        for _ in range(50):
            try:
                urllib.request.urlopen(f"{redirect}?state={sent}&code=code9", timeout=2).read()
                break
            except OSError:
                import time

                time.sleep(0.05)
        thread.join(15)
        assert out.get("code") == expect, out
        if expect is None:
            assert "state mismatch" in out["error"]
