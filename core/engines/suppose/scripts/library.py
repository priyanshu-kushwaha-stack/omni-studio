"""The Say Suppose art library: cast, sets, props and scores. Media stay out of git; manifest.yaml records each
file's sha256, Higgsfield job and prompt so a clone can fetch it again (spec: The channel library)."""

from __future__ import annotations

import hashlib
import json
import os
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
    def for_channel(cls, slug: str) -> "Library":
        return cls(REPO / "channels" / slug / "library")

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
        out.mkdir(parents=True, exist_ok=True)
        links = {d: self.root / d for d in ("cast", "sets", "props", "scores")}
        links.update({d: Path(video) / d for d in ("art", "audio") if (Path(video) / d).exists()})
        for name, target in links.items():
            link = out / name
            if link.is_symlink() or link.exists():
                link.unlink()
            os.symlink(target.resolve(), link)
        return out
