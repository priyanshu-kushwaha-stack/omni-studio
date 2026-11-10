#!/usr/bin/env python3
"""Hero clips from a hosted open-weight image-to-video model (Wan 2.2, Apache 2.0), paid per call.
Each requested scene's still is sent with a motion prompt that keeps the drawing flat; the mp4 lands in
assets/clips/<scene>.mp4 with a provenance row that records the dollar price of the call."""

from __future__ import annotations
import argparse
import base64
import csv
import json
import os
import time
from pathlib import Path

PRICES = {  # listed per-clip prices, last verified 2026-10-28; the ledger row records the number used
    "fal:wan/v2.2-5b/image-to-video": 0.15,
    "fal:wan/v2.2-a14b/image-to-video": 0.40,
    "wavespeed:wan-2.2/i2v-5b-720p": 0.05,
}
FAL_QUEUE = "https://queue.fal.run/fal-ai/"
WAVESPEED = "https://api.wavespeed.ai/api/v3/wavespeed-ai/"
STYLE_TAIL = (
    "; subtle motion only, the drawing stays a flat black marker drawing on cream paper, lines stay black "
    "and crisp, no new objects, no texture, no camera move"
)


def motion_prompt(description: str) -> str:
    return description.strip().rstrip(".") + STYLE_TAIL


class HttpClient:
    """Thin requests wrapper so tests can inject a fake."""

    def __init__(self):
        import requests

        self.s = requests.Session()

    def post(self, url, json=None, headers=None):
        r = self.s.post(url, json=json, headers=headers, timeout=120)
        r.raise_for_status()
        return r.json()

    def get(self, url, headers=None):
        r = self.s.get(url, headers=headers, timeout=120)
        r.raise_for_status()
        return r.json()

    def download(self, url, dest: Path):
        with self.s.get(url, stream=True, timeout=600) as r:
            r.raise_for_status()
            with open(dest, "wb") as f:
                for chunk in r.iter_content(1 << 16):
                    f.write(chunk)
        return dest


def _data_url(png: Path) -> str:
    return "data:image/png;base64," + base64.b64encode(png.read_bytes()).decode()


def request(
    still: Path,
    prompt: str,
    provider: str,
    client,
    api_key: str,
    seconds: int = 5,
    poll: float = 5.0,
    timeout: float = 1200.0,
) -> str:
    """Submit one clip and return the result video URL."""
    vendor, model = provider.split(":", 1)
    if vendor == "fal":
        headers = {"Authorization": f"Key {api_key}"}
        sub = client.post(
            FAL_QUEUE + model,
            json={
                "prompt": prompt,
                "image_url": _data_url(still),
                "num_frames": 81 if seconds <= 5 else 121,
                "resolution": "720p",
            },
            headers=headers,
        )
        t0 = time.time()
        while True:
            st = client.get(sub["status_url"], headers=headers)
            if st.get("status") == "COMPLETED":
                break
            if st.get("status") in ("FAILED", "ERROR") or time.time() - t0 > timeout:
                raise SystemExit(f"{still.name}: job {st.get('status')}")
            time.sleep(poll)
        res = client.get(sub["response_url"], headers=headers)
        return res["video"]["url"]
    if vendor == "wavespeed":
        headers = {"Authorization": f"Bearer {api_key}"}
        sub = client.post(
            WAVESPEED + model, json={"prompt": prompt, "image": _data_url(still), "duration": seconds}, headers=headers
        )
        rid = sub["data"]["id"] if "data" in sub else sub["id"]
        t0 = time.time()
        while True:
            st = client.get(f"https://api.wavespeed.ai/api/v3/predictions/{rid}/result", headers=headers)
            d = st.get("data", st)
            if d.get("status") == "completed":
                return d["outputs"][0]
            if d.get("status") == "failed" or time.time() - t0 > timeout:
                raise SystemExit(f"{still.name}: job {d.get('status')}")
            time.sleep(poll)
    raise SystemExit(f"unknown provider {provider}")


def run(
    video_dir: Path, scenes: list[str], provider: str, client=None, api_key: str | None = None, seconds: int = 5
) -> list[Path]:
    client = client or HttpClient()
    vendor = provider.split(":", 1)[0]
    api_key = api_key or os.environ.get({"fal": "FAL_KEY", "wavespeed": "WAVESPEED_API_KEY"}[vendor], "")
    if not api_key:
        raise SystemExit(f"no API key for {vendor} in the environment (.env.local)")
    plan = json.loads((video_dir / "scene_plan.json").read_text())
    descs = {s["id"]: s.get("description", "") for s in plan["scenes"]}
    out_dir = video_dir / "assets" / "clips"
    out_dir.mkdir(parents=True, exist_ok=True)
    prov = video_dir / "assets" / "provenance.csv"
    price = PRICES[provider]
    outs = []
    for sid in scenes:
        still = video_dir / "assets" / "stills" / f"{sid}.png"
        url = request(still, motion_prompt(descs[sid]), provider, client, api_key, seconds)
        dest = client.download(url, out_dir / f"{sid}.mp4")
        with prov.open("a", newline="") as f:
            csv.writer(f).writerow(
                [
                    f"clips/{sid}.mp4",
                    "video",
                    vendor,
                    provider.split(":", 1)[1],
                    "generated",
                    0,
                    price,
                    f"hosted image-to-video, {seconds} s, {time.strftime('%Y-%m-%d')}",
                ]
            )
        outs.append(dest)
    return outs


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("video_dir", type=Path)
    p.add_argument("scenes", nargs="+")
    p.add_argument("--provider", default="fal:wan/v2.2-5b/image-to-video", choices=sorted(PRICES))
    p.add_argument("--seconds", type=int, default=5)
    a = p.parse_args()
    outs = run(a.video_dir, a.scenes, a.provider, seconds=a.seconds)
    print(json.dumps({"clips": [str(o) for o in outs], "usd": round(PRICES[a.provider] * len(outs), 2)}))


if __name__ == "__main__":
    main()
