import csv
import json
import sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import clips  # noqa: E402


class FakeClient:
    """Answers like fal's queue API: submit -> request_id, status -> COMPLETED, result -> video url, download."""
    def __init__(self):
        self.calls = []

    def post(self, url, json=None, headers=None):
        self.calls.append(("POST", url, json))
        return {"request_id": "req1", "status_url": "https://q/status", "response_url": "https://q/result"}

    def get(self, url, headers=None):
        self.calls.append(("GET", url, None))
        if url.endswith("status"):
            return {"status": "COMPLETED"}
        return {"video": {"url": "https://cdn/x.mp4"}}

    def download(self, url, dest: Path):
        self.calls.append(("DL", url, None))
        dest.write_bytes(b"\x00\x00\x00\x18ftypmp42")
        return dest


def test_run_requests_each_scene_and_logs_dollars(tmp_path):
    vd = tmp_path / "v"; (vd / "assets" / "stills").mkdir(parents=True)
    for s in ("s002", "s018"):
        Image.new("RGB", (64, 36), (246, 241, 231)).save(vd / "assets" / "stills" / f"{s}.png")
    (vd / "scene_plan.json").write_text(json.dumps({"scenes": [
        {"id": "s002", "description": "a ring of figures around one fire"},
        {"id": "s018", "description": "a wrist monitor trace drawing across the frame"}]}))
    (vd / "assets" / "provenance.csv").write_text("file,kind,source,model,license,credits,usd,note\n")
    fake = FakeClient()
    out = clips.run(vd, ["s002", "s018"], provider="fal:wan/v2.2-5b/image-to-video", client=fake, api_key="k")
    assert [p.name for p in out] == ["s002.mp4", "s018.mp4"]
    posts = [c for c in fake.calls if c[0] == "POST"]
    assert len(posts) == 2 and "fire" in posts[0][2]["prompt"] and "crisp" in posts[0][2]["prompt"]
    assert posts[0][2]["image_url"].startswith("data:image/png;base64,")
    rows = list(csv.DictReader((vd / "assets" / "provenance.csv").open()))
    assert [r["file"] for r in rows] == ["clips/s002.mp4", "clips/s018.mp4"]
    assert rows[0]["usd"] == "0.15" and rows[0]["credits"] == "0" and rows[0]["source"] == "fal"


def test_motion_prompt_keeps_the_drawing_flat():
    p = clips.motion_prompt("a figure walks in with a torch")
    assert p.startswith("a figure walks in with a torch")
    assert "no camera move" in p and "cream paper" in p
