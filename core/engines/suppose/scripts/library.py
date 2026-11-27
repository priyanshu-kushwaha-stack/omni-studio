"""The Say Suppose art library: cast, sets, props and scores. Media stay out of git; manifest.yaml records each
file's sha256, Higgsfield job and prompt so a clone can fetch it again (spec: The channel library).

The JSON (cast.json, maps, set.json, manifest.yaml) is tracked and read from this checkout. The media (PNGs) are
git-ignored and live once, in the main checkout's channels/<slug>/library/ (media_root), so every worktree renders
from the same files; OMNI_MAIN points elsewhere (tests use a temp dir).
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[4]


def main_checkout() -> Path:
    """The main checkout (it holds .venv-media, the git-ignored voice files and the library media): OMNI_MAIN, else
    the first worktree `git worktree list` names (this tree, outside git)."""
    env = os.environ.get("OMNI_MAIN")
    if env:
        return Path(env)
    r = subprocess.run(["git", "-C", str(REPO), "worktree", "list", "--porcelain"], capture_output=True, text=True)
    if r.returncode != 0:  # not a git checkout: this tree is the only one
        return REPO
    return Path(r.stdout.split("\n")[0].removeprefix("worktree "))


def media_root(slug: str) -> Path:
    """Where the channel library's git-ignored media live: the main checkout's channels/<slug>/library/."""
    return main_checkout() / "channels" / slug / "library"


def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class Library:
    def __init__(self, root: Path, media: Path | None = None):
        self.root = Path(root)
        self.media = Path(media) if media is not None else self.root
        self.cast = self._json("cast/cast.json")
        self.sets = {p.parent.name: json.loads(p.read_text()) for p in sorted(self.root.glob("sets/*/set.json"))}
        self.props = self._json("props/props.json")
        self.scores = self._json("scores/scores.json")

    @classmethod
    def for_channel(cls, slug: str, video: Path | None = None) -> "Library":
        """The channel library; with `video`, the cast and sets that video made in its art/ are added (the video's
        entry wins), the same overlay `stage` gives the renderer, until G3 moves them into the library."""
        lib = cls(REPO / "channels" / slug / "library", media_root(slug))
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
            p = self.media / f["path"]
            if not p.is_file():
                problems.append(f"missing {p} (fetch Higgsfield job {f.get('job')})")
            elif _sha(p) != f["sha256"]:
                problems.append(f"sha256 changed: {f['path']}")
        return problems

    def add(self, path: Path, job: str, prompt: str) -> None:
        m = self._manifest()
        rel = str(Path(path).resolve().relative_to(self.media.resolve()))
        entry = {"path": rel, "sha256": _sha(Path(path)), "job": job, "prompt": prompt}
        m["files"] = [f for f in m["files"] if f["path"] != rel] + [entry]
        m["files"].sort(key=lambda f: f["path"])
        (self.root / "manifest.yaml").write_text(yaml.safe_dump(m, sort_keys=False))

    def stage(self, video: Path, out: Path) -> Path:
        """Link the library media and the video's art/ and audio/ into `out` for a render (--public-dir). A video's
        own `art/cast/...` and `art/sets/...` merge over the library's cast/ and sets/ (the video's file wins, the
        library is never touched), so film.json's library-relative srcs resolve before G3 moves the art in.
        Stops, naming the files, when library media are missing or a staged link dangles."""
        missing = [p for p in self.verify() if p.startswith("missing")]
        if missing:
            raise SystemExit(
                f"library media missing under {self.media} (copy them from the checkout that has them, or fetch the"
                " Higgsfield job):\n  " + "\n  ".join(missing)
            )
        for p in self.verify():
            print(f"library: {p}", file=sys.stderr)
        out.mkdir(parents=True, exist_ok=True)
        video = Path(video)
        links = {d: self.media / d for d in ("cast", "sets", "props", "scores")}
        links.update({d: video / d for d in ("art", "audio") if (video / d).exists()})
        for name, target in links.items():
            _clear(out / name)
            overlay = video / "art" / name
            if name in ("cast", "sets") and overlay.is_dir():
                _merge(out / name, *(d for d in (target, overlay) if d.is_dir()))
            elif target.exists():
                os.symlink(target.resolve(), out / name)
        if dangling := _dangling(out):
            raise SystemExit("staged links point at nothing:\n  " + "\n  ".join(map(str, dangling)))
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


def _dangling(root: Path) -> list[Path]:
    out = []
    for d, dirs, files in os.walk(root, followlinks=True):
        out += [Path(d) / n for n in dirs + files if os.path.islink(Path(d) / n) and not (Path(d) / n).exists()]
    return sorted(out)
