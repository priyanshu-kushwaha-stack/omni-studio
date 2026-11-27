import sys
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import framediff  # noqa: E402


def test_identical_frames_differ_by_zero_and_shifted_ones_do_not(tmp_path):
    a = np.zeros((10, 10, 3), np.uint8)
    b = a.copy()
    b[:5] = 40
    Image.fromarray(a).save(tmp_path / "a.png")
    Image.fromarray(b).save(tmp_path / "b.png")
    assert framediff.mean_abs_diff(tmp_path / "a.png", tmp_path / "a.png") == 0
    assert framediff.mean_abs_diff(tmp_path / "a.png", tmp_path / "b.png") == 20


def _dirs(tmp_path, shape_b=(10, 10, 3), fill_b=40):
    (tmp_path / "A").mkdir()
    (tmp_path / "B").mkdir()
    Image.fromarray(np.zeros((10, 10, 3), np.uint8)).save(tmp_path / "A" / "f1.png")
    Image.fromarray(np.full(shape_b, fill_b, np.uint8)).save(tmp_path / "B" / "f1.png")
    return str(tmp_path / "A"), str(tmp_path / "B")


def test_cli_exits_1_above_threshold_and_prints_the_frame(tmp_path, capsys):
    a, b = _dirs(tmp_path)
    assert framediff.main([a, b, "10"]) == 1
    assert "f1.png" in capsys.readouterr().out
    assert framediff.main([a, b, "50"]) == 0


def test_cli_refuses_mismatched_sizes(tmp_path, capsys):
    a, b = _dirs(tmp_path, shape_b=(12, 10, 3))
    assert framediff.main([a, b, "10"]) == 2
    assert "10x10" in capsys.readouterr().err
    with pytest.raises(framediff.SizeMismatch):
        framediff.mean_abs_diff(Path(a) / "f1.png", Path(b) / "f1.png")
