#!/usr/bin/env python3
"""Stills from the scene plan with FLUX.2 klein 4B + the pous_ink style LoRA, through mflux on the Mac.
One PNG per base scene (continuations reuse their parent), rendered at 1024x576 and upscaled to 1920x1080.
FLUX.2 takes no negative prompt: the look is carried by the LoRA and the positive prompt."""
from __future__ import annotations
import argparse
import csv
import json
import re
import subprocess
import time
from pathlib import Path
from typing import Callable

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MFLUX = ROOT / ".venv-media" / "bin" / "mflux-generate-flux2"
LORA = ROOT / "channel" / "lora" / "pous_ink.safetensors"
MODEL = "flux2-klein-4b"
STYLE_TRIGGER, FIGURE_TRIGGER = "pous_ink", "pous_you"
FIGURE_WORDS = re.compile(r"\"you\"|\byou figure\b|satchel", re.I)
BASE = ("hand-drawn stickman illustration, black marker on cream paper, loose confident lines, slight paper grain, "
        "minimal shading, lots of negative space, no text, no letters, no watermark, flat cream background")

Backend = Callable[[str, int, int, int, Path], Path]


def prompt(scene: dict, accent: str) -> str:
    desc = re.sub(r"\(.*?\)", "", scene.get("description", "")).strip().rstrip(";").replace('"', "")
    desc = re.sub(r"\s+", " ", desc)
    parts = [STYLE_TRIGGER]
    if FIGURE_WORDS.search(scene.get("description", "")):
        parts.append(FIGURE_TRIGGER)
    parts += [BASE, f"one accent colour ({accent})", f"Scene: {desc}"]
    return ", ".join(parts)


def mflux_backend(p: str, seed: int, w: int, h: int, out: Path, steps: int = 4, lora: Path = LORA) -> Path:
    cmd = [str(MFLUX), "--model", MODEL, "--prompt", p, "--seed", str(seed), "--width", str(w), "--height", str(h),
           "--steps", str(steps), "-q", "8", "--output", str(out)]
    if lora.exists():
        cmd += ["--lora-paths", str(lora)]
    subprocess.run(cmd, check=True)
    return out


def generate(video_dir: Path, scenes: list[str] | None, backend: Backend | None = None, accent: str = "ochre",
             seed: int = 7, out_dir: Path | None = None, lora: Path = LORA) -> list[Path]:
    """Render the base scenes into <video>/assets/stills with a provenance row each. With OUT_DIR (a bake-off or
    checkpoint comparison) the files go there instead and no provenance is written: those are not assets."""
    if backend is None:
        backend = lambda p, seed, w, h, out: mflux_backend(p, seed, w, h, out, lora=lora)  # noqa: E731
    plan = json.loads((video_dir / "scene_plan.json").read_text())
    base = [s for s in plan["scenes"] if re.fullmatch(r"s\d{3}", s["id"])]
    wanted = [s for s in base if scenes is None or s["id"] in scenes]
    scratch = out_dir is not None
    out_dir = out_dir or video_dir / "assets" / "stills"
    out_dir.mkdir(parents=True, exist_ok=True)
    prov = video_dir / "assets" / "provenance.csv"
    if not scratch and not prov.exists():
        prov.write_text("file,kind,source,model,license,credits,usd,note\n")
    outs = []
    for i, s in enumerate(wanted):
        dest = out_dir / f"{s['id']}.png"
        t0 = time.time()
        backend(prompt(s, accent), seed + i, 1024, 576, dest)
        Image.open(dest).convert("RGB").resize((1920, 1080), Image.LANCZOS).save(dest)
        if not scratch:
            with prov.open("a", newline="") as f:
                csv.writer(f).writerow([f"stills/{s['id']}.png", "image", "local", f"{MODEL}+pous_ink", "generated", 0, 0,
                                        f"mflux on the Mac, {time.time() - t0:.0f} s, {time.strftime('%Y-%m-%d')}"])
        outs.append(dest)
    return outs


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("video_dir", type=Path)
    p.add_argument("--scenes", nargs="*", default=None, help="scene ids; default all base scenes")
    p.add_argument("--accent", default="ochre")
    p.add_argument("--seed", type=int, default=7)
    p.add_argument("--out-dir", type=Path, help="write here instead of <video>/assets/stills (no provenance rows)")
    p.add_argument("--lora", type=Path, default=LORA, help="LoRA adapter to load (default channel/lora/pous_ink.safetensors)")
    a = p.parse_args()
    outs = generate(a.video_dir, a.scenes, accent=a.accent, seed=a.seed, out_dir=a.out_dir, lora=a.lora)
    print(json.dumps({"stills": [str(o) for o in outs]}))


if __name__ == "__main__":
    main()
