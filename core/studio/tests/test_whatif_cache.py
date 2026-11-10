"""Manifests and sidecars behind the what-if previews (G4/G5 speed-ups plan, Task 4)."""

from __future__ import annotations

import functools
import json
from pathlib import Path

import pytest

from tools.studio import studio_whatif_cache as C


def _write(path: Path, text: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
    return path


@pytest.fixture
def video(tmp_path):
    """A channel video with scenes, an engine with a kit, and assets with one image and one sound."""
    engine = tmp_path / "engine"
    _write(engine / "src" / "kit" / "theme.ts", "export const FPS = 30;\n")
    _write(engine / "remotion.config.ts", "// config\n")
    _write(engine / "pnpm-lock.yaml", "lock: 1\n")
    channel = tmp_path / "channels" / "say-suppose"
    _write(channel / "brand" / "IdentC.tsx", "// brand\n")
    folder = channel / "videos" / "2026-11-10_x"
    scenes = folder / "scenes"
    for rel in ("index.ts", "Film.tsx", "shared.ts", "beats/A.tsx", "beats/B.tsx"):
        _write(scenes / rel, f"// {rel}\n")
    timeline = {"totalFrames": 90, "clips": [{"file": "n/1.wav", "from": 0, "frames": 30}], "cues": {}}
    _write(folder / "assets" / "narration" / "props.json", json.dumps({"timeline": timeline}))
    _write(folder / "assets" / "images" / "sky.png", "png")
    _write(folder / "assets" / "sfx" / "pop.wav", "wav")
    return {
        "engine": engine,
        "folder": folder,
        "scenes": scenes,
        "public": folder / "assets",
        "props": folder / "assets" / "narration" / "props.json",
        "brand": channel / "brand",
    }


def test_code_roots_cover_scenes_kit_config_lock_and_the_channels_brand(video):
    roots = C.code_roots(video["scenes"] / "index.ts", video["engine"])
    assert roots["scenes"] == video["scenes"] and roots["brand"] == video["brand"]
    assert {"kit", "config", "lock"} <= set(roots)


def test_an_engine_example_has_no_brand_root(tmp_path):
    roots = C.code_roots(tmp_path / "engine" / "examples" / "pause-sample" / "index.ts", tmp_path / "engine")
    assert "brand" not in roots


def test_a_sidecar_round_trips_and_names_the_files_that_changed(video, tmp_path):
    media = tmp_path / "pic.mp4"
    media.write_bytes(b"x")
    write = functools.partial(
        C.write_sidecar, props=video["props"], entry=video["scenes"] / "index.ts", engine=video["engine"], frames="all"
    )
    first = write(media, mode="picture")
    assert C.read_sidecar(media) == first
    _write(video["scenes"] / "beats" / "B.tsx", "// louder pop\n")
    second = write(tmp_path / "a.wav", mode="audio")
    assert first["props_sha256"] == second["props_sha256"]
    assert C.changed_files(first, second) == ["scenes/beats/B.tsx"]


def test_an_entry_outside_scenes_is_refused(video):
    with pytest.raises(ValueError, match="scenes"):
        C.code_roots(video["folder"] / "index.ts", video["engine"])


def test_a_kit_or_brand_change_shows_in_the_manifest(video):
    entry = video["scenes"] / "index.ts"
    before = C.manifest(C.code_roots(entry, video["engine"]))
    _write(video["brand"] / "IdentC.tsx", "// new card\n")
    _write(video["engine"] / "src" / "kit" / "theme.ts", "export const FPS = 25;\n")
    after = C.manifest(C.code_roots(entry, video["engine"]))
    assert C.changed_files({"files": before}, {"files": after}) == ["brand/IdentC.tsx", "kit/theme.ts"]


def test_a_missing_or_foreign_sidecar_reads_as_none(tmp_path):
    media = tmp_path / "x.mp4"
    assert C.read_sidecar(media) is None
    C.sidecar_path(media).write_text(json.dumps({"schema": 99}))
    assert C.read_sidecar(media) is None
