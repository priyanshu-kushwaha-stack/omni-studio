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


def test_generate_out_dir_is_scratch_without_provenance(tmp_path):
    vd = tmp_path / "v"; (vd / "assets").mkdir(parents=True)
    (vd / "scene_plan.json").write_text(json.dumps({"scenes": [{"id": "s001", "description": "a fire"}]}))

    def fake(prompt: str, seed: int, w: int, h: int, out: Path) -> Path:
        Image.new("RGB", (w, h)).save(out)
        return out
    outs = stills.generate(vd, scenes=None, backend=fake, out_dir=tmp_path / "cmp" / "ckpt150")
    assert outs == [tmp_path / "cmp" / "ckpt150" / "s001.png"]
    assert not (vd / "assets" / "provenance.csv").exists() and not (vd / "assets" / "stills").exists()


def test_literal_strips_stage_directions():
    beat = '(custom-made frames; change every 2-4 s here) a ring of twenty tiny figures around one fire draws in; a wrist monitor draws onto one arm, then every arm'
    out = stills.literal(beat)
    assert "draws" not in out and "custom-made" not in out and "then every arm" not in out
    assert out.startswith("a ring of twenty tiny figures around one fire")
    assert "a wrist monitor" in out


def test_prompt_uses_override_from_prompts_json(tmp_path):
    vd = tmp_path / "v"; (vd / "assets").mkdir(parents=True)
    (vd / "scene_plan.json").write_text(json.dumps({"scenes": [{"id": "s040", "description": "a G/wi camp at night"}]}))
    (vd / "assets" / "prompts.json").write_text(json.dumps({"s040": "a hunter-gatherer camp at night, no tents"}))
    seen = []

    def fake(prompt: str, seed: int, w: int, h: int, out: Path) -> Path:
        seen.append(prompt); Image.new("RGB", (w, h)).save(out); return out
    stills.generate(vd, scenes=None, backend=fake, out_dir=tmp_path / "o")
    assert "no tents" in seen[0] and "G/wi" not in seen[0]


def test_mflux_backend_overwrites_existing_still(tmp_path, monkeypatch):
    # mflux never overwrites: with dest present it writes dest_1.png and the old drawing survives a re-roll.
    import stills
    dest = tmp_path / "s001.png"
    dest.write_bytes(b"old")
    seen = {}
    monkeypatch.setattr(stills.subprocess, "run", lambda cmd, check: seen.setdefault("exists", dest.exists()))
    stills.mflux_backend("p", 1, 64, 36, dest)
    assert seen["exists"] is False
