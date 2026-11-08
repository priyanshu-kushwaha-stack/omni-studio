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


@pytest.mark.parametrize("privacy", ["public", "unlisted", "Private", "PUBLIC"])
def test_non_private_cli_request_is_refused(video, privacy, capsys):
    _upload(video[1])
    assert cli.main(["upload", "alpha", VIDEO, "--privacy", privacy]) == 3
    assert f"--privacy {privacy!r} is refused: uploads are always private" in capsys.readouterr().err


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
    monkeypatch.setattr(youtube, "fallback_tokens", lambda: [])
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


def test_run_needs_first_auth_and_no_stray_fallback_token(video, monkeypatch, tmp_path):
    req = _ready(video, monkeypatch)
    req.token.unlink()
    with pytest.raises(youtube.UploadRefused, match="pass --first-auth"):
        youtube.run(req, "alpha/" + VIDEO, api=FakeAPI(None, {}), runner=_runner([]))
    stray = tmp_path / "request.token"
    stray.write_text("{}")
    monkeypatch.setattr(youtube, "fallback_tokens", lambda: [stray])
    with pytest.raises(youtube.UploadRefused, match="would fall back to"):
        youtube.run(req, "alpha/" + VIDEO, first_auth=True, api=FakeAPI(None, {}), runner=_runner([]))


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


# --- the thumbnail ---


def _thumb(folder, name="thumb.jpg", size=1000):
    path = folder / "renders" / name
    path.write_bytes(b"\xff\xd8" + b"\x00" * size)
    return f"renders/{name}"


def test_thumbnail_goes_to_the_uploader_and_the_dry_run(video):
    channel, folder = video
    _upload(folder, thumbnail=_thumb(folder))
    req = youtube.build_request("alpha", VIDEO)
    cmd = youtube.command(req, Path("m.json"), Path("o.json"))
    assert cmd[cmd.index("-thumbnail") + 1] == str(folder / "renders" / "thumb.jpg")
    assert "thumb.jpg" in youtube.dry_run(req)


@pytest.mark.parametrize("make,needle", [
    (lambda f: "../outside.jpg", "is not a file inside"),
    (lambda f: _thumb(f, "thumb.gif"), "a JPG or PNG"),
    (lambda f: _thumb(f, "big.jpg", size=youtube.MAX_THUMBNAIL), "at most 2 MB"),
])
def test_bad_thumbnail_is_refused(video, make, needle):
    channel, folder = video
    _upload(folder, thumbnail=make(folder))
    assert needle in _refused("alpha", VIDEO)


class FakeThumbAPI(FakeAPI):
    def __init__(self, channel_id):
        super().__init__(channel_id, {})
        self.sent = []

    def set_thumbnail(self, video_id, image):
        self.sent.append((video_id, Path(image).name))
        return {"default": {"url": "https://i.ytimg.com/vi/vid123/default.jpg"}}


def test_thumbnail_only_sets_it_on_the_uploaded_video(video, monkeypatch):
    channel, folder = video
    _ready(video, monkeypatch)
    _upload(folder, thumbnail=_thumb(folder))
    req = youtube.build_request("alpha", VIDEO)
    (folder / "upload_log.json").write_text(json.dumps({"youtube_video_id": "vid123"}))
    api = FakeThumbAPI(req.youtube_channel_id)
    log = youtube.set_thumbnail(req, "alpha/" + VIDEO, api=api)
    assert api.sent == [("vid123", "thumb.jpg")]
    assert json.loads((folder / "upload_log.json").read_text())["thumbnail"]["file"] == "renders/thumb.jpg"
    assert log["youtube_video_id"] == "vid123"


def test_thumbnail_only_refuses_without_confirm_upload_or_the_right_token(video, monkeypatch):
    channel, folder = video
    _ready(video, monkeypatch)
    _upload(folder, thumbnail=_thumb(folder))
    req = youtube.build_request("alpha", VIDEO)
    with pytest.raises(youtube.UploadRefused, match="--confirm must be exactly"):
        youtube.set_thumbnail(req, "alpha/other", api=FakeThumbAPI(req.youtube_channel_id))
    with pytest.raises(youtube.UploadRefused, match="no uploaded video"):
        youtube.set_thumbnail(req, "alpha/" + VIDEO, api=FakeThumbAPI(req.youtube_channel_id))
    (folder / "upload_log.json").write_text(json.dumps({"youtube_video_id": "vid123"}))
    with pytest.raises(youtube.UploadRefused, match="token belongs to channel"):
        youtube.set_thumbnail(req, "alpha/" + VIDEO, api=FakeThumbAPI("UCsomeoneelse"))


def test_api_posts_the_thumbnail_bytes(tmp_path):
    secret, token, image = tmp_path / "s.json", tmp_path / "t.token", tmp_path / "t.jpg"
    secret.write_text(json.dumps({"installed": {"client_id": "id", "client_secret": "sec"}}))
    token.write_text(json.dumps({"refresh_token": "r"}))
    image.write_bytes(b"\xff\xd8jpeg")
    sent = []

    class Resp(io.BytesIO):
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    def opener(request, timeout):
        if "oauth2" in request.full_url:
            return Resp(json.dumps({"access_token": "fresh"}).encode())
        sent.append((request.full_url, request.get_method(), request.data, request.headers["Content-type"]))
        return Resp(json.dumps({"items": [{"default": {"url": "u"}}]}).encode())

    served = youtube_api.YouTubeAPI(secret, token, opener=opener).set_thumbnail("v1", image)
    assert served == {"default": {"url": "u"}}
    url, method, data, mime = sent[0]
    assert "upload/youtube/v3/thumbnails/set" in url and "videoId=v1" in url
    assert method == "POST" and data == b"\xff\xd8jpeg" and mime == "image/jpeg"
