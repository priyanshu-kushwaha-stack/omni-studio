import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import pou_paths  # noqa: E402


@pytest.fixture(autouse=True)
def _fresh_cache():
    pou_paths._config.cache_clear()
    yield
    pou_paths._config.cache_clear()


def test_channel_dir_defaults_to_professor_of_us(monkeypatch):
    monkeypatch.delenv("POU_CHANNEL_DIR", raising=False)
    assert pou_paths.channel_dir() == (pou_paths.STUDIO_ROOT / "channels" / "professor-of-us").resolve()


def test_paths_come_from_the_channel_engine_yaml(tmp_path, monkeypatch):
    (tmp_path / "engine.yaml").write_text(
        "font: f/hand.ttf\nmedia_python: /opt/py\nsecrets_env: ~/.config/omni-studio/x.env\n"
    )
    monkeypatch.setenv("POU_CHANNEL_DIR", str(tmp_path))
    assert pou_paths.path("font") == (tmp_path / "f" / "hand.ttf").resolve()
    assert pou_paths.path("media_python") == Path("/opt/py")
    assert pou_paths.path("secrets_env") == Path.home() / ".config" / "omni-studio" / "x.env"
    assert pou_paths.path("rigs") == (tmp_path / "rigs").resolve()  # default


def test_unknown_engine_keys_are_refused(tmp_path, monkeypatch):
    (tmp_path / "engine.yaml").write_text("fonts: oops\n")
    monkeypatch.setenv("POU_CHANNEL_DIR", str(tmp_path))
    with pytest.raises(SystemExit, match="unknown keys"):
        pou_paths.path("font")


def test_no_engine_path_points_at_faceless_channel():
    scripts = Path(pou_paths.__file__).parent
    for script in scripts.glob("*.py"):
        text = script.read_text()
        assert "faceless-channel" not in text, script.name
        assert "sandbox" + "/openmontage" not in text and '"sandbox"' not in text, script.name
        assert "parent.parent" not in text, script.name


def test_real_channel_resolves_font_and_rigs(monkeypatch):
    monkeypatch.delenv("POU_CHANNEL_DIR", raising=False)
    assert pou_paths.path("font").is_file()
    assert pou_paths.path("rigs").is_dir()


def test_a_symlinked_interpreter_keeps_its_venv_path(tmp_path, monkeypatch):
    # .venv-media/bin/python is a symlink to the base interpreter; following it drops the venv's packages.
    (tmp_path / "venv" / "bin").mkdir(parents=True)
    (tmp_path / "venv" / "bin" / "python").symlink_to(sys.executable)
    (tmp_path / "engine.yaml").write_text("media_python: venv/bin/python\n")
    monkeypatch.setenv("POU_CHANNEL_DIR", str(tmp_path))
    assert pou_paths.path("media_python") == pou_paths.channel_dir() / "venv" / "bin" / "python"
