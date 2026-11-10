"""omni-studio: what the what-if previews are made of (G4/G5 speed-ups, pipeline v2 optimisation 5).

File manifests and digests, and the sidecar each preview pass writes beside its media (`<file>.render.json`), so
`whatif_mux` can refuse to join a picture and an audio pass made from different timing or code. Pure functions:
nothing here renders. Plan: docs/superpowers/plans/2026-11-10-say-suppose-g4-g5-speedups.md.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Optional

SCHEMA = 1
AUDIO_SUFFIXES = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg"}
SKIP = {"node_modules", "__pycache__", ".DS_Store"}


def file_sha(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _is_audio(path: Path) -> bool:
    return path.suffix.lower() in AUDIO_SUFFIXES or path.name.endswith(".words.json")


def manifest(roots: dict[str, Path], *, skip_audio: bool = False) -> dict[str, str]:
    """`label/relative path` -> sha256 for every file under each root; a root that is a file is keyed by its label."""
    out: dict[str, str] = {}
    for label, root in roots.items():
        if root.is_file():
            out[label] = file_sha(root)
            continue
        for p in sorted(root.rglob("*")) if root.is_dir() else []:
            if p.is_file() and not SKIP & set(p.parts) and not (skip_audio and _is_audio(p)):
                out[f"{label}/{p.relative_to(root).as_posix()}"] = file_sha(p)
    return out


def digest(m: dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps(m, sort_keys=True).encode("utf-8")).hexdigest()


def code_roots(entry: Path, engine: Path) -> dict[str, Path]:
    """What a render is made from besides props and assets: the scenes folder, the kit, the engine's config and lock,
    and the channel's brand kit when the entry is a channel video (video 1's Film imports ../../../brand)."""
    scenes = entry.parent
    roots = {
        "scenes": scenes,
        "kit": engine / "src" / "kit",
        "config": engine / "remotion.config.ts",
        "lock": engine / "pnpm-lock.yaml",
    }
    parts = scenes.parts
    if "channels" in parts and len(parts) > parts.index("channels") + 1:
        roots["brand"] = Path(*parts[: parts.index("channels") + 2]) / "brand"
    return roots


def sidecar_path(media: Path) -> Path:
    return media.with_name(media.name + ".render.json")


def write_sidecar(
    media: Path, *, mode: str, quality: str, props: Path, entry: Path, engine: Path, frames: str
) -> dict[str, Any]:
    files = manifest(code_roots(entry, engine))
    data = {
        "schema": SCHEMA,
        "mode": mode,
        "quality": quality,
        "props_sha256": file_sha(props),
        "scenes_sha256": digest(files),
        "frames": frames,
        "files": files,
    }
    sidecar_path(media).write_text(json.dumps(data, indent=1, sort_keys=True), encoding="utf-8")
    return data


def read_sidecar(media: Path) -> Optional[dict[str, Any]]:
    path = sidecar_path(media)
    if not path.is_file():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    return data if isinstance(data, dict) and data.get("schema") == SCHEMA else None


def changed_files(a: dict[str, Any], b: dict[str, Any]) -> list[str]:
    fa, fb = a.get("files", {}), b.get("files", {})
    return sorted(k for k in fa.keys() | fb.keys() if fa.get(k) != fb.get(k))
