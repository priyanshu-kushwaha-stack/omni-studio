"""Build the owner's review page for a Say Suppose film and gate stage (spec: The review page).

python review.py <video_dir> <stage>   -> writes <video_dir>/review/<stage>.html

Reads whatever exists and skips a section whose inputs are missing. Self-contained: inline CSS, thumbnails embedded
as small data URIs, Google Fonts the only outside fetch. Every user string is escaped.
"""

from __future__ import annotations

import base64
import html
import io
import json
import re
import sys
from pathlib import Path

import yaml

import framediff
import scriptcheck

STAGES = ("proposal", "story_script", "final_edit", "final_watch", "publish_prep")
QUALITIES = [
    "Light with a visible source",
    "Depth",
    "One clear subject per frame",
    "One world and one grade per film",
    "Characters that act",
]
W_CHECKLIST = [
    ("W1", "Shot vocabulary: the mix of shot types, never the same type twice in a row"),
    ("W2", "Acting on the beat: expressions change on the word that earns them; everyone blinks and breathes"),
    ("W3", "Camera never fully still: every shot has a move"),
    ("W4", "A populated world: reacting people are in frame, no more than about four in focus"),
    ("W5", "Every spoken number on screen as it is spoken"),
    ("W6", "The cast system: one signature item and colour each, Scarf's colour on no one else"),
    ("W7", "Light, depth and atmosphere: one key light with a visible source and its spill, rim light, atmosphere"),
]
CSS = """
:root{--bg:#faf8f3;--fg:#1d1b17;--mut:#6b665c;--card:#fff;--line:#e2ddd0;--warn:#a4560a;--bad:#a8261c}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#17150f;--fg:#f0ece0;--mut:#a39d8c;--card:#211e16;--line:#3a3629;--warn:#e0a458;--bad:#ff8a7a}}
:root[data-theme=dark]{--bg:#17150f;--fg:#f0ece0;--mut:#a39d8c;--card:#211e16;--line:#3a3629;--warn:#e0a458;--bad:#ff8a7a}
body{background:var(--bg);color:var(--fg);font:15px/1.5 'Inter',system-ui,sans-serif;margin:0;padding:1rem 1rem}
main{max-width:860px;margin:0 auto}h1{font-size:1.5rem;margin:.2rem 0}h2{font-size:1.05rem;margin:1.6rem 0 .5rem}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:.8rem 1rem;margin:.8rem 0}
.mut{color:var(--mut)}.warn{color:var(--warn)}.bad{color:var(--bad)}video{max-width:100%}
ul.todo,ul.check{list-style:none;padding:0}li{margin:.25rem 0}
.t{font-variant-numeric:tabular-nums;color:var(--mut);margin-right:.6rem}
.feed{display:flex;flex-wrap:wrap;gap:8px}.feed figure{margin:0;width:170px}.feed img{width:100%;border-radius:8px}
table{border-collapse:collapse}td,th{border:1px solid var(--line);padding:.2rem .5rem;text-align:left}
"""


def esc(x) -> str:
    return html.escape(str(x), quote=True)


def fmt_time(t: float) -> str:
    m, s = divmod(float(t), 60)
    return f"{int(m)}:{s:04.1f}"


def _yaml(p: Path):
    try:
        return yaml.safe_load(p.read_text(encoding="utf-8")) if p.is_file() else None
    except (yaml.YAMLError, OSError):
        return None


def _json(p: Path):
    try:
        return json.loads(p.read_text(encoding="utf-8")) if p.is_file() else None
    except (json.JSONDecodeError, OSError):
        return None


def _section(title: str, body: str) -> str:
    return f"<section><h2>{esc(title)}</h2>{body}</section>" if body else ""


def _list(items: list, cls: str = "") -> str:
    return f'<ul class="{cls}">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>" if items else ""


def _data_uri(p: Path, width: int = 360) -> str:
    im = framediff.load_rgb(p)
    im = im.resize((width, max(1, round(im.height * width / im.width))))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=70)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def _cut(video: Path) -> str:
    renders = sorted((video / "render").glob("*.mp4")) if (video / "render").is_dir() else []
    if not renders:
        return ""
    rel = esc(renders[-1].relative_to(video).as_posix())
    return (
        f'<video controls preload="none" src="{rel}"></video>'
        f'<p class="mut">Artifacts cannot load local files: open <code>{esc(renders[-1])}</code> on the Mac to watch.</p>'
    )


def _cue_times(video: Path) -> dict[int, float]:
    for name in ("cues_luc.json", "cues_b.json"):
        data = _json(video / "audio" / name)
        if not isinstance(data, dict):
            continue
        out = {}
        for c in data.get("cues") or []:
            m = re.match(r"(\d+)", str(c.get("line", ""))) if isinstance(c, dict) else None
            if m:
                out[int(m.group(1))] = float(c.get("start", 0))
        return out
    return {}


def _cast_rows(video: Path) -> list[str]:
    cp = _yaml(video / "cast-pass.yaml")
    times = _cue_times(video)
    rows = []
    for ln in (cp.get("lines") if isinstance(cp, dict) else None) or []:
        if not isinstance(ln, dict) or not isinstance(ln.get("n"), int):
            continue
        t = times.get(ln["n"])
        stamp = f'<span class="t">{fmt_time(t)}</span>' if t is not None else ""
        rows.append(f"{stamp}<b>{esc(ln.get('speaker', ''))}</b> {esc(ln.get('text', ''))}")
    return rows


def _script_lines(video: Path) -> str:
    rows = _cast_rows(video)
    if rows:
        return _list(rows)
    p = video / "script.md"
    return f"<p>{esc(scriptcheck.extract(p.read_text(encoding='utf-8')))}</p>" if p.is_file() else ""


def _script_metrics(video: Path) -> str:
    p = video / "script.md"
    if not p.is_file():
        return ""
    script = scriptcheck.extract(p.read_text(encoding="utf-8"))
    m = scriptcheck.metrics(script)
    fails, warns = scriptcheck.check(script)
    rows = "".join(f"<tr><th>{esc(k)}</th><td>{esc(v)}</td></tr>" for k, v in m.items())
    notes = [f'<span class="bad">FAIL {esc(f)}</span>' for f in fails] + [
        f'<span class="warn">WARN {esc(w)}</span>' for w in warns
    ]
    return f"<table>{rows}</table>" + _list(notes)


def _sheet_warns(video: Path, channel: str) -> str:
    if not (video / "shots.yaml").is_file():
        return ""
    import sheetcheck
    from library import Library

    try:
        sheet, words = sheetcheck.load_inputs(video)
        fails, warns = sheetcheck.check_all(
            sheet, Library.for_channel(channel, video), words, sheetcheck.customs_in(video)
        )
    except Exception as e:  # a half-written sheet must not stop the page
        return f'<p class="bad">shots.yaml could not be checked: {esc(" ".join(str(e).split()))}</p>'
    items = [f'<span class="bad">FAIL {esc(f)}</span>' for f in fails] + [
        f'<span class="warn">WARN {esc(w)}</span>' for w in warns
    ]
    return _list(items) or '<p class="mut">No sheet warnings.</p>'


def _qc(video: Path, stage: str) -> str:
    """`omni qc` writes {checks: [{check: "loudness", measured: {integrated_lufs, true_peak_dbtp}},
    {check: "clicks", problems: [...], in_word_bursts}]} (core/studio/checks.py, qc/loudness.py, qc/clicks.py)."""
    data = _json(video / "qc" / f"{stage}.json")
    checks = (
        {c.get("check"): c for c in (data or {}).get("checks", []) if isinstance(c, dict)}
        if isinstance(data, dict)
        else {}
    )
    measured = (checks.get("loudness") or {}).get("measured") or {}
    rows = []
    for label, key in (("Integrated loudness (LUFS)", "integrated_lufs"), ("True peak (dBTP)", "true_peak_dbtp")):
        if measured.get(key) is not None:
            rows.append(f"<tr><th>{esc(label)}</th><td>{esc(measured[key])}</td></tr>")
    clicks = checks.get("clicks")
    if clicks:
        found = clicks.get("problems") or []
        rows.append(f"<tr><th>Clicks</th><td>{esc(len(found))}</td></tr>")
        rows += [f'<tr><td colspan="2" class="bad">{esc(p)}</td></tr>' for p in found]
    return f"<table>{''.join(rows)}</table>" if rows else ""


def _checklists() -> str:
    q = _list([f'<label><input type="checkbox"> {esc(x)}</label>' for x in QUALITIES], "check")
    w = _list([f'<label><input type="checkbox"> <b>{esc(k)}</b> {esc(v)}</label>' for k, v in W_CHECKLIST], "check")
    return _section("Look: the five qualities", q) + _section("Workflow checklist W1-W7", w)


def _notes(video: Path) -> str:
    p = video / "review" / "notes.md"
    if not p.is_file():
        return ""
    items = [
        re.sub(r"^\s*(?:[-*]|\d+[.)])\s*(?:\[[ xX]\]\s*)?", "", ln).strip()
        for ln in p.read_text(encoding="utf-8").splitlines()
    ]
    return _list([f'<label><input type="checkbox"> {esc(i)}</label>' for i in items if i], "todo")


def _benchmarks(video: Path, channel: str) -> list[Path]:
    for parent in [video, *video.parents]:
        d = parent / "channels" / channel / "analytics" / "benchmark-thumbs"
        if d.is_dir():
            return sorted(d.glob("*.png")) + sorted(d.glob("*.jpg"))
    return []


def _feed(video: Path, channel: str) -> str:
    ours = sorted((video / "art").glob("thumb_*.png")) if (video / "art").is_dir() else []
    if not ours:
        return ""
    figs = [
        f'<figure><img src="{_data_uri(p)}" alt="{esc(p.stem)}"><figcaption class="mut">{esc(p.stem)}</figcaption></figure>'
        for p in ours
    ]
    figs += [
        f'<figure><img src="{_data_uri(p)}" alt="benchmark"><figcaption class="mut">benchmark</figcaption></figure>'
        for p in _benchmarks(video, channel)
    ]
    return f'<div class="feed">{"".join(figs)}</div>'


LABELS = ("TITLE", "ALT TITLES", "SYNOPSIS", "CHARACTERS", "RULE", "OUTLINE", "PLANTED", "CHOICE", "FACTS")
_LABEL = re.compile(r"^(" + "|".join(LABELS) + r"):[ \t]*(.*)$")


def parse_outline(text: str) -> dict[str, str]:
    """Split the raw answer to channels/say-suppose/prompts/outline.md on its labelled blocks."""
    blocks: dict[str, list[str]] = {}
    cur = None
    for line in text.splitlines():
        m = _LABEL.match(line)
        if m:
            cur = m.group(1)
            blocks.setdefault(cur, []).append(m.group(2))
        elif cur:
            blocks[cur].append(line)
    return {k: "\n".join(v).strip() for k, v in blocks.items() if "\n".join(v).strip()}


def _items(block: str) -> list[str]:
    return [re.sub(r"^(?:[-*]|\d+[.)])\s+", "", ln.strip()) for ln in block.splitlines() if ln.strip()]


def _characters(block: str) -> str:
    rows = []
    for ln in block.splitlines():
        if "|" in ln:
            cells = [c.strip() for c in ln.split("|")]
            cells += [""] * (4 - len(cells))
            rows.append("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in cells[:3] + [" | ".join(cells[3:])]) + "</tr>")
    head = "".join(f"<th>{h}</th>" for h in ("Role", "Id", "Signature", "Headwear"))
    return f"<table><tr>{head}</tr>{''.join(rows)}</table>" if rows else ""


def _outline_list(block: str) -> str:
    steps: list[tuple[str, list[str]]] = []
    for ln in block.splitlines():
        sub = re.match(r"\s*(\d+\.\d+)[.)]?\s+(.*)", ln)
        top = re.match(r"\s*(\d+)[.)]?\s+(.*)", ln)
        if sub and steps:
            steps[-1][1].append(f"{esc(sub.group(1))} {esc(sub.group(2))}")
        elif top:
            steps.append((f"{esc(top.group(1))} {esc(top.group(2))}", []))
        elif ln.strip() and steps:
            steps[-1] = (steps[-1][0] + " " + esc(ln.strip()), steps[-1][1])
    return _list([head + (_list(subs) if subs else "") for head, subs in steps])


def _read_outline(video: Path) -> dict[str, str]:
    p = video / "outline.md"
    return parse_outline(p.read_text(encoding="utf-8")) if p.is_file() else {}


def _packaging(video: Path) -> str:
    ob = _read_outline(video)
    parts = []
    if ob.get("TITLE"):
        parts.append(f"<p><b>{esc(ob['TITLE'])}</b></p>")
    for key, label, render in (
        ("ALT TITLES", "Alternative titles", lambda b: _list([esc(i) for i in _items(b)])),
        ("SYNOPSIS", "Synopsis", lambda b: f"<p>{esc(b)}</p>"),
        ("CHARACTERS", "Characters", _characters),
        ("RULE", "Rule", lambda b: f"<p>{esc(b)}</p>"),
        ("OUTLINE", "Outline", _outline_list),
        ("PLANTED", "Planted", lambda b: f"<p>{esc(b)}</p>"),
        ("CHOICE", "Choice", lambda b: f"<p>{esc(b)}</p>"),
        ("FACTS", "Facts", lambda b: _list([esc(i) for i in _items(b)])),
    ):
        if ob.get(key):
            parts.append(f"<h3>{esc(label)}</h3>{render(ob[key])}")
    art = _yaml(video / "art.yaml")
    if isinstance(art, dict):
        items = art.get("items") or art.get("art") or []
        parts.append(
            "<h3>Art list</h3>"
            + _list(
                [esc(i if not isinstance(i, dict) else i.get("name") or i.get("id") or json.dumps(i)) for i in items]
            )
        )
        if art.get("quote") is not None:
            parts.append(f"<p>Credit quote: <b>{esc(art['quote'])}</b></p>")
    return "".join(parts)


def _title(video: Path) -> str:
    if _read_outline(video).get("TITLE"):
        return _read_outline(video)["TITLE"].splitlines()[0]
    p = video / "script.md"
    m = re.match(r"\s*TOPIC:\s*(.+?)\s*SCRIPT:", p.read_text(encoding="utf-8")) if p.is_file() else None
    return m.group(1) if m else video.name


def channel_of(video: Path) -> str:
    """The slug in `channels/<slug>/videos/<id>`; say-suppose when the path does not say."""
    parts = Path(video).resolve().parts
    for i in range(len(parts) - 3):
        if parts[i] == "channels" and parts[i + 2] == "videos":
            return parts[i + 1]
    return "say-suppose"


RENDER_TIME = "render time per film minute: not available (studio.jobs report has no JSON output)"


def build(video: Path, stage: str) -> Path:
    video = Path(video)
    if stage not in STAGES:
        raise ValueError(f"unknown stage {stage!r}; expected one of {', '.join(STAGES)}")
    title, channel = _title(video), channel_of(video)
    parts = [_section("The cut", _cut(video)), _section("Script", _script_lines(video))]
    if stage == "proposal":
        parts += [_section("Packaging", _packaging(video)), _section("Thumbnail feed", _feed(video, channel))]
    parts += [
        _section("Script metrics", _script_metrics(video)),
        _section("Sheet warnings", _sheet_warns(video, channel)),
        _section("QC", _qc(video, stage) + f'<p class="mut">{esc(RENDER_TIME)}</p>'),
        _checklists(),
        _section("Owner notes", _notes(video)),
    ]
    page = (
        f'<!doctype html><meta charset="utf-8"><title>{esc(title)}</title>'
        '<link rel="preconnect" href="https://fonts.googleapis.com">'
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">'
        f'<style>{CSS}</style><main><p class="mut">{esc(video.name)} / {esc(stage)}</p><h1>{esc(title)}</h1>{"".join(parts)}</main>'
    )
    out = video / "review" / f"{stage}.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    return out


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: review.py <video_dir> <stage>", file=sys.stderr)
        return 2
    try:
        print(build(Path(argv[0]).resolve(), argv[1]))
    except ValueError as e:
        print(f"review: {e}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
