import csv
import json
import sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import stills  # noqa: E402


def test_prompt_has_triggers_accent_once_and_no_negative():
    p = stills.prompt({"id": "s004", "description": "the \"you\" figure draws in at the edge, yawning"}, accent="ochre")
    assert p.startswith("pous_ink, pous_you, ")
    assert p.count("ochre") == 1 and "negative:" not in p.lower()   # FLUX.2 has no negative prompt
    assert "no text" in p


def test_generate_writes_1080p_for_requested_scenes_and_logs(tmp_path):
    vd = tmp_path / "v"; (vd / "assets").mkdir(parents=True)
    (vd / "scene_plan.json").write_text(json.dumps({"scenes": [
        {"id": "s001", "description": "a fire"}, {"id": "s001c1", "description": "continue"},
        {"id": "s002", "description": "a bed"}]}))
    calls = []

    def fake(prompt: str, seed: int, w: int, h: int, out: Path) -> Path:
        calls.append((prompt, seed, w, h))
        Image.new("RGB", (w, h), (246, 241, 231)).save(out)
        return out
    outs = stills.generate(vd, scenes=["s002"], backend=fake, accent="ochre")
    assert [o.name for o in outs] == ["s002.png"] and Image.open(outs[0]).size == (1920, 1080)
    assert calls[0][2:] == (1024, 576) and "a bed" in calls[0][0]
    rows = list(csv.DictReader((vd / "assets" / "provenance.csv").open()))
    assert rows[-1]["file"] == "stills/s002.png" and rows[-1]["usd"] == "0" and rows[-1]["model"].startswith("flux2-klein")
