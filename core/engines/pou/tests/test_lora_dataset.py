import json
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import lora_dataset as ld  # noqa: E402


def _png(p: Path, size=(1600, 900)):
    Image.new("RGB", size, (246, 241, 231)).save(p)
    return p


def test_build_copies_images_resizes_and_writes_captions(tmp_path):
    refs = tmp_path / "refs"
    refs.mkdir()
    _png(refs / "ref-01.png")
    _png(refs / "model-sheet-you.png")
    stills = tmp_path / "stills"
    stills.mkdir()
    _png(stills / "s001.png")
    _png(stills / "s002.png")
    plan = tmp_path / "scene_plan.json"
    plan.write_text(
        json.dumps(
            {
                "scenes": [
                    {"id": "s001", "description": "a ring of twenty tiny figures around one fire draws in"},
                    {"id": "s002", "description": 'the "you" figure in bed; an alarm clock face'},
                ]
            }
        )
    )
    out = tmp_path / "ds"
    pairs = ld.build(refs, stills, plan, out, accent="ochre")
    assert len(pairs) == 4
    for img, cap in pairs:
        assert img.exists() and img.with_suffix(".txt").read_text() == cap
        assert cap.startswith("pous_ink, ")
        assert cap.count("ochre") == 1
        assert max(Image.open(img).size) == 1024
    caps = {img.stem: cap for img, cap in pairs}
    assert "pous_you" in [c for c in caps.values() if "alarm clock" in c][0]
    assert "pous_you" in [c for c in caps.values() if "model sheet" in c][0]
    assert "pous_you" not in [c for c in caps.values() if "ring of twenty" in c][0]
