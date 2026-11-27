import hashlib
import json
import re
import sys
from pathlib import Path

import pytest
import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import library  # noqa: E402

REPO = Path(__file__).resolve().parents[4]
LIB = REPO / "channels" / "say-suppose" / "library"
CAST_V4 = REPO / "channels" / "say-suppose" / "pilot" / "only-100" / "remotion" / "src" / "castV4.ts"
PILOT_IDS = {
    "SCARF": "scarf-faded",
    "SCARFC": "scarf",
    "SALARY": "salary",
    "OFFICE": "office",
    "STUDENT": "student",
    "GENT": "gent",
    "GRAN": "gran",
    "PACKER": "packer",
    "WORKER": "worker",
}
SEEDED = pytest.mark.skipif(not (LIB / "cast/cast.json").is_file(), reason="library not seeded")
MEDIA = pytest.mark.skipif(not (LIB / "cast/pieces/s5_0.png").is_file(), reason="library media not here (git-ignored)")


def make_lib(root: Path) -> Path:
    for d in ["cast", "sets/station", "props", "scores"]:
        (root / d).mkdir(parents=True)
    (root / "cast" / "cast.json").write_text(json.dumps({"scarf": {"roles": ["hero"]}}))
    (root / "sets" / "station" / "set.json").write_text(json.dumps({"id": "station", "angles": {"wide": {}}}))
    (root / "props" / "props.json").write_text("{}")
    (root / "scores" / "scores.json").write_text("{}")
    (root / "sets" / "station" / "wide.png").write_bytes(b"png")
    (root / "manifest.yaml").write_text(yaml.safe_dump({"files": []}))
    return root


def test_loads_cast_sets_props(tmp_path):
    lib = library.Library(make_lib(tmp_path / "lib"))
    assert "scarf" in lib.cast and "wide" in lib.sets["station"]["angles"]


def test_add_then_verify_catches_a_changed_file(tmp_path):
    root = make_lib(tmp_path / "lib")
    lib = library.Library(root)
    lib.add(root / "sets" / "station" / "wide.png", job="2ecb2081", prompt="set-plate.md")
    entry = yaml.safe_load((root / "manifest.yaml").read_text())["files"][0]
    assert entry == {
        "path": "sets/station/wide.png",
        "sha256": hashlib.sha256(b"png").hexdigest(),
        "job": "2ecb2081",
        "prompt": "set-plate.md",
    }
    assert lib.verify() == []
    (root / "sets" / "station" / "wide.png").write_bytes(b"changed")
    assert any("sha256" in p for p in lib.verify())


def test_stage_links_library_and_video_media(tmp_path):
    root = make_lib(tmp_path / "lib")
    video = tmp_path / "v"
    (video / "art").mkdir(parents=True)
    (video / "audio").mkdir()
    out = library.Library(root).stage(video, tmp_path / "public")
    assert (out / "sets" / "station" / "wide.png").read_bytes() == b"png"
    assert (out / "art").is_symlink() and (out / "audio").is_symlink()


def _pilot_cast() -> dict:
    out = {}
    for name, body in re.findall(r"export const (\w+): Parts = \{(.*?)\n\};", CAST_V4.read_text(), re.S):
        parts = {p: (int(w), int(h)) for p, w, h in re.findall(r"(\w+): \{src: '[^']+', w: (\d+), h: (\d+)\}", body)}
        m = re.search(r"hip: ([\d.]+), sh: (\[.*?\]), face: (\[.*?\])", body)
        out[name] = {"parts": parts, "hip": float(m[1]), "sh": json.loads(m[2]), "face": json.loads(m[3])}
    return out


@SEEDED
def test_seeded_cast_matches_the_pilot():
    cast = json.loads((LIB / "cast" / "cast.json").read_text())
    pilot = _pilot_cast()
    assert set(pilot) == set(PILOT_IDS)
    for name, want in pilot.items():
        got = cast[PILOT_IDS[name]]
        assert {p: (got[p]["w"], got[p]["h"]) for p in want["parts"]} == want["parts"], name
        assert (got["hip"], got["sh"], got["face"]) == (want["hip"], want["sh"], want["face"]), name


@MEDIA
def test_seeded_library_verifies():
    assert library.Library(LIB).verify() == []


def test_stage_overlays_video_cast_and_sets_over_the_library(tmp_path):
    """Pieces made in <video>/art/cast and sets in <video>/art/sets resolve at the library-relative srcs film.json uses."""
    root = make_lib(tmp_path / "lib")
    (root / "cast" / "pieces").mkdir()
    (root / "cast" / "pieces" / "old.png").write_bytes(b"lib-old")
    (root / "cast" / "pieces" / "same.png").write_bytes(b"lib-same")
    video = tmp_path / "v"
    (video / "art" / "cast" / "pieces").mkdir(parents=True)
    (video / "art" / "cast" / "pieces" / "new.png").write_bytes(b"new")
    (video / "art" / "cast" / "pieces" / "same.png").write_bytes(b"video-same")
    (video / "art" / "sets" / "cellar").mkdir(parents=True)
    (video / "art" / "sets" / "cellar" / "wide.png").write_bytes(b"cellar")
    out = library.Library(root).stage(video, tmp_path / "public")
    assert (out / "cast" / "pieces" / "old.png").read_bytes() == b"lib-old"
    assert (out / "cast" / "pieces" / "new.png").read_bytes() == b"new"
    assert (out / "cast" / "pieces" / "same.png").read_bytes() == b"video-same"  # the video's file wins
    assert (out / "sets" / "cellar" / "wide.png").read_bytes() == b"cellar"
    assert (out / "sets" / "station" / "wide.png").read_bytes() == b"png"
    assert (out / "props").is_symlink() and not (out / "cast").is_symlink()
    assert (root / "cast" / "pieces" / "same.png").read_bytes() == b"lib-same"  # the library is untouched
    library.Library(root).stage(video, out)  # re-staging is safe
    assert (out / "cast" / "pieces" / "new.png").read_bytes() == b"new"


def test_for_channel_with_a_video_adds_its_local_cast_and_sets(tmp_path, monkeypatch):
    root = make_lib(tmp_path / "lib")
    monkeypatch.setattr(library, "REPO", tmp_path / "repo")
    lib_dir = tmp_path / "repo" / "channels" / "x" / "library"
    lib_dir.parent.mkdir(parents=True)
    root.rename(lib_dir)
    video = tmp_path / "v"
    (video / "art" / "cast").mkdir(parents=True)
    (video / "art" / "cast" / "cast.json").write_text(
        json.dumps({"mentor": {"roles": ["guide"]}, "scarf": {"roles": ["new"]}})
    )
    (video / "art" / "sets" / "cellar").mkdir(parents=True)
    (video / "art" / "sets" / "cellar" / "set.json").write_text(json.dumps({"id": "cellar", "angles": {"wide": {}}}))
    plain = library.Library.for_channel("x")
    lib = library.Library.for_channel("x", video)
    assert set(plain.cast) == {"scarf"} and "cellar" not in plain.sets
    assert set(lib.cast) == {"scarf", "mentor"} and lib.cast["scarf"]["roles"] == ["new"]  # the video's entry wins
    assert set(lib.sets) == {"station", "cellar"}
    assert library.Library.for_channel("x", tmp_path / "none").cast == plain.cast
