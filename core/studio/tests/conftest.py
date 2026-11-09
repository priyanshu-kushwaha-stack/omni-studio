import pytest


@pytest.fixture(autouse=True)
def _approval_key_in_tmp(tmp_path, monkeypatch):
    """omni approve makes its HMAC key on first use. Tests never touch ~/.config/omni-studio/."""
    monkeypatch.setenv("OMNI_STUDIO_APPROVAL_KEY", str(tmp_path / "approval-key" / "approval.key"))


@pytest.fixture(autouse=True)
def _timings_and_ledger_in_tmp(tmp_path, monkeypatch):
    """Timing rows and review-room calls go to tmp, never to ~/.local/state/omni-studio/."""
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "timings.jsonl"))
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))


# --- synthetic media for the Phase 4 checks (no real channel media is touched) ---

import json
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 48000


def speech_like(seconds_per_word=0.45, gap=0.05, n_words=40, tail=2.6, lead=0.3, seed=1):
    """A mono track of tone 'words' with 20 ms ramps, a quiet bed that fades out over the tail, and words.json."""
    rng = np.random.default_rng(seed)
    words, t = [], lead
    total = lead + n_words * (seconds_per_word + gap) + tail
    x = np.zeros(int(total * SR))
    ramp = int(0.02 * SR)
    for k in range(n_words):
        a, b = int(t * SR), int((t + seconds_per_word) * SR)
        n = b - a
        tt = np.arange(n) / SR
        f = 180 + 40 * rng.random()
        tone = sum(np.sin(2 * np.pi * f * h * tt) / h for h in (1, 2, 3, 4))
        env = np.ones(n)
        env[:ramp] = np.linspace(0, 1, ramp)
        env[-ramp:] = np.linspace(1, 0, ramp)
        x[a:b] += 0.3 * tone * env
        words.append({"word": f"w{k}", "start": round(t, 3), "end": round(t + seconds_per_word, 3)})
        t += seconds_per_word + gap
    tt = np.arange(len(x)) / SR
    bed = 0.003 * np.sin(2 * np.pi * 110 * tt)
    last = words[-1]["end"]
    fade = np.clip(1 - (tt - last) / (tail - 0.4), 0, 1)
    x += bed * fade
    return x, words


def write_wav(path: Path, x: np.ndarray) -> Path:
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        handle.writeframes(pcm.tobytes())
    return path


def to_target(x: np.ndarray, lufs: float, tmp: Path) -> np.ndarray:
    """Scale x so its integrated loudness is `lufs` (loudness moves dB for dB with gain)."""
    from studio.qc import loudness

    probe = write_wav(tmp / "_probe.wav", x)
    gain_db = lufs - loudness.measure(probe)["integrated_lufs"]
    probe.unlink()
    return x * 10 ** (gain_db / 20)


def mux(path: Path, audio: Path, pattern: str = "testsrc2", size: str = "270x480") -> Path:
    """A 9:16 mp4 from a lavfi picture source and the wav; audio is AAC like the engine's renders."""
    src = f"{pattern}=s={size}:r=10" if pattern != "color" else f"color=c=0xF6F1E7:s={size}:r=10"
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            "-f",
            "lavfi",
            "-i",
            src,
            "-i",
            str(audio),
            "-shortest",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            str(path),
        ],
        check=True,
    )
    return path


# 16 tone-words (about 11 s with the 2.6 s tail): long enough for the 3 s windows of the loudness range and for
# several 2 s similarity frames; the full 40-word track only made every ffmpeg check take twice as long.
MEDIA_WORDS = 16


def _build_media(kind: str, container: str, pattern: str, folder: Path) -> tuple[Path, Path]:
    folder.mkdir(parents=True, exist_ok=True)
    x, words = speech_like(n_words=MEDIA_WORDS, tail=0.3 if kind == "abrupt" else 2.6)
    x = to_target(x, -6.0 if kind == "loud" else -14.0, folder)
    if kind == "click":
        gap = int(0.15 * SR)  # in the lead-in silence, well clear of any word
        x[gap : gap + 96] += 0.8 * np.hanning(96) * np.sign(np.sin(np.arange(96)))
    wav = write_wav(folder / f"{kind}.wav", x)
    words_path = folder / f"{kind}.words.json"
    words_path.write_text(json.dumps(words))
    if container == "mp4":
        return mux(folder / f"{kind}.mp4", wav, pattern), words_path
    return wav, words_path


@pytest.fixture(scope="session")
def _media_cache(tmp_path_factory):
    """Each (kind, container, pattern) is built once per session; the inputs are fixed (seed=1), so every build of
    one key is the same file. Tests get copies, never the cached files."""
    built: dict[tuple[str, str, str], tuple[Path, Path]] = {}
    root = tmp_path_factory.mktemp("media-cache")

    def get(kind: str, container: str, pattern: str) -> tuple[Path, Path]:
        key = (kind, container, pattern)
        if key not in built:
            built[key] = _build_media(kind, container, pattern, root / "-".join(key))
        return built[key]

    return get


def copying_media(cache, default_folder: Path):
    """The media(kind, ...) factory over a session cache: same files as building them in `folder` would leave
    ({kind}.wav, {kind}.words.json and, for mp4, {kind}.mp4), each copied with a fresh mtime so "newest render"
    ordering is what the test's calls make it."""
    import shutil

    def make(kind="good", container="wav", pattern="testsrc2", folder=None):
        folder = Path(folder or default_folder)
        folder.mkdir(parents=True, exist_ok=True)
        src, src_words = cache(kind, container, pattern)
        wav = folder / f"{kind}.wav"
        shutil.copyfile(src.with_suffix(".wav"), wav)
        words_path = folder / f"{kind}.words.json"
        shutil.copyfile(src_words, words_path)
        if container == "mp4":
            out = folder / f"{kind}.mp4"
            shutil.copyfile(src, out)
            return out, words_path
        return wav, words_path

    return make


@pytest.fixture()
def media(tmp_path, _media_cache):
    """Factory: media(kind) -> (path, words.json). kinds: good, loud, click, abrupt (Short ends with no tail)."""
    return copying_media(_media_cache, tmp_path)


def studio_root_at(base: Path, monkeypatch) -> "callable":
    """A throwaway omni-studio root at base/root (channels from the template) and base/config/omni-studio as
    ~/.config/omni-studio. Returns make_channel(slug, **overrides)."""
    import shutil

    import yaml

    import styles.playbook_loader as playbook_loader
    from studio import channels

    real = Path(__file__).resolve().parents[3]
    root = base / "root"
    shutil.copytree(real / "channels" / "_template", root / "channels" / "_template")
    styles = root / "core" / "openmontage" / "styles"
    styles.mkdir(parents=True)
    point_at_root(base, monkeypatch)

    def make_channel(slug, **overrides):
        channel = channels.create_channel(slug)
        path = channel.dir / "channel.yaml"
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        data.update(
            formats={"short": "studio-short", "dialogue": "studio-dialogue"},
            youtube_channel_id="UC" + (slug.replace("-", "") * 22)[:22],
            upload_token_path=f"~/.config/omni-studio/youtube/{slug}.token",
            loudness={
                "short": {"integrated_lufs": -14, "tolerance_lu": 1, "true_peak_dbtp_max": -1, "lra_lu_max": 8},
                "dialogue": {"integrated_lufs": -14, "tolerance_lu": 1, "true_peak_dbtp_max": -1, "lra_lu_max": 11},
            },
            upload={"contains_synthetic_media": False, "category_id": "27", "language": "en"},
        )
        data.update(overrides)
        path.write_text(yaml.safe_dump(data), encoding="utf-8")
        return channels.load_channel(slug)

    return make_channel


def point_at_root(base: Path, monkeypatch) -> None:
    """Point the studio and OpenMontage at the throwaway root made under `base` by studio_root_at."""
    import styles.playbook_loader as playbook_loader
    from studio import channels

    monkeypatch.setattr(channels, "ROOT", base / "root")
    monkeypatch.setattr(playbook_loader, "STYLES_DIR", base / "root" / "core" / "openmontage" / "styles")
    monkeypatch.setenv("OMNI_STUDIO_CONFIG_DIR", str(base / "config" / "omni-studio"))


@pytest.fixture()
def studio_root(tmp_path, monkeypatch):
    """A throwaway omni-studio root (channels from the template) plus a throwaway ~/.config/omni-studio."""
    return studio_root_at(tmp_path, monkeypatch)


@pytest.fixture(scope="session")
def studio_helpers():
    """The root and media helpers above, for module-scoped fixtures (test modules cannot import conftest under
    --import-mode=importlib)."""
    from types import SimpleNamespace

    return SimpleNamespace(studio_root_at=studio_root_at, point_at_root=point_at_root, copying_media=copying_media)
