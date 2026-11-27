"""The Say Suppose art library: cast, sets, props and scores. Media stay out of git; manifest.yaml records each
file's sha256, Higgsfield job and prompt so a clone can fetch it again (spec: The channel library)."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[4]


def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class Library:
    def __init__(self, root: Path):
        self.root = Path(root)
        self.cast = self._json("cast/cast.json")
        self.sets = {p.parent.name: json.loads(p.read_text()) for p in sorted(self.root.glob("sets/*/set.json"))}
        self.props = self._json("props/props.json")
        self.scores = self._json("scores/scores.json")

    @classmethod
    def for_channel(cls, slug: str, video: Path | None = None) -> "Library":
        """The channel library; with `video`, the cast and sets that video made in its art/ are added (the video's
        entry wins), the same overlay `stage` gives the renderer, until G3 moves them into the library."""
        lib = cls(REPO / "channels" / slug / "library")
        if video is not None:
            art = Path(video) / "art"
            lib.cast.update(lib._json_at(art / "cast" / "cast.json"))
            lib.sets.update({p.parent.name: json.loads(p.read_text()) for p in sorted(art.glob("sets/*/set.json"))})
        return lib

    @staticmethod
    def _json_at(p: Path) -> dict:
        return json.loads(p.read_text()) if p.is_file() else {}

    def _json(self, rel: str) -> dict:
        p = self.root / rel
        return json.loads(p.read_text()) if p.is_file() else {}

    def _manifest(self) -> dict:
        p = self.root / "manifest.yaml"
        return yaml.safe_load(p.read_text()) or {"files": []} if p.is_file() else {"files": []}

    def verify(self) -> list[str]:
        problems = []
        for f in self._manifest()["files"]:
            p = self.root / f["path"]
            if not p.is_file():
                problems.append(f"missing {f['path']} (fetch Higgsfield job {f.get('job')})")
            elif _sha(p) != f["sha256"]:
                problems.append(f"sha256 changed: {f['path']}")
        return problems

    def add(self, path: Path, job: str, prompt: str) -> None:
        m = self._manifest()
        rel = str(Path(path).resolve().relative_to(self.root.resolve()))
        entry = {"path": rel, "sha256": _sha(Path(path)), "job": job, "prompt": prompt}
        m["files"] = [f for f in m["files"] if f["path"] != rel] + [entry]
        m["files"].sort(key=lambda f: f["path"])
        (self.root / "manifest.yaml").write_text(yaml.safe_dump(m, sort_keys=False))

    def stage(self, video: Path, out: Path) -> Path:
        """Link the library and the video's art/ and audio/ into `out` for a render (--public-dir). A video's own
        `art/cast/...` and `art/sets/...` merge over the library's cast/ and sets/ (the video's file wins, the
        library is never touched), so film.json's library-relative srcs resolve before G3 moves the art in."""
        out.mkdir(parents=True, exist_ok=True)
        video = Path(video)
        links = {d: self.root / d for d in ("cast", "sets", "props", "scores")}
        links.update({d: video / d for d in ("art", "audio") if (video / d).exists()})
        for name, target in links.items():
            _clear(out / name)
            overlay = video / "art" / name
            if name in ("cast", "sets") and overlay.is_dir():
                _merge(out / name, target, overlay)
            else:
                os.symlink(target.resolve(), out / name)
        return out


def _clear(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink()
    elif path.is_dir():
        shutil.rmtree(path)


def _merge(dst: Path, *sources: Path) -> None:
    """A real directory tree at `dst` with one symlink per file; later sources override earlier ones."""
    for src in sources:
        for f in sorted(p for p in src.resolve().rglob("*") if p.is_file()):
            link = dst / f.relative_to(src.resolve())
            link.parent.mkdir(parents=True, exist_ok=True)
            if link.is_symlink():
                link.unlink()
            os.symlink(f, link)
