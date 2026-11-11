"""The topic skill's data: brief check, weighted score, ranked list, markdown and the pick page.

    python -m studio.topics pitch <model> <prompt.md> <out.json>  one cursor-agent pitcher, sandboxed, ask mode
    python -m studio.topics check <pitches.json>            brief problems per topic; exit 1 if any
    python -m studio.topics rank <scored.json> <out.md>      rank by total, write the backlog markdown (and .json)
    python -m studio.topics page <scored.json> <out.html>    the owner's pick page (publish as an artifact with db)

Spec: docs/superpowers/specs/2026-11-10-say-suppose-topics-skill-design.md. The total is computed here, never by a
model: excitement x3, content x3, views x2, engine x1, buildable x1 (out of 100), minus 10 for copying a trending twist.
"""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path
from typing import Any

WEIGHTS = {"excitement": 3, "content": 3, "views": 2, "engine": 1, "buildable": 1}
TREND_PENALTY = 10
TITLE_MAX = 50
MIN_FACTS = 12
MIN_BEATS = 8
TEXT_FIELDS = ("title", "premise", "rule", "hook", "twist", "ending", "views_case", "under_question")
LIST_FIELDS = {"beats": MIN_BEATS, "feeling_map": 4, "restarts": 2}
PAGE = Path(__file__).with_name("topics_page.html")


CURSOR_PITCHERS = {"gemini-4-argon-high": "google", "gpt-5.6-sol-high": "openai"}
PITCH_TIMEOUT_S = 1800  # GPT-5.6 Sol ran past 1200 s on an 8-topic slate (2026-11-11)


def pitch(model: str, prompt: str, runner=None, raw_path: Path | None = None) -> dict[str, Any]:
    """One cursor-agent pitcher, run like a room seat (sandbox, ask mode, clean env); its answer's JSON object."""
    from studio.room.call import build_command, cli_text, invoke

    registry = {model: {"family": CURSOR_PITCHERS.get(model, "other"), "cli": "cursor"}}
    code, stdout, _ = invoke(build_command(model, prompt, registry), runner=runner, timeout=PITCH_TIMEOUT_S)
    text = cli_text(stdout)
    if raw_path is not None:
        Path(raw_path).write_text(text, encoding="utf-8")  # kept so a bad answer can be repaired, not re-bought
    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.S)
    raw = fenced.group(1) if fenced else text[text.find("{") : text.rfind("}") + 1]
    try:
        data = json.loads(raw, strict=False)  # models leave raw newlines inside strings
    except json.JSONDecodeError as exc:
        raise ValueError(f"{model} (exit {code}) gave no JSON topics: {text[:200]!r}") from exc
    if not isinstance(data, dict) or not isinstance(data.get("topics"), list):
        raise ValueError(f"{model} gave no JSON topics list")
    return data


def brief_problems(t: dict[str, Any]) -> list[str]:
    """What a pitch brief is missing; empty when it has every field the scorer needs."""
    name = str(t.get("title") or t.get("id") or "?")
    out = [f"{name}: no {f}" for f in TEXT_FIELDS if not str(t.get(f) or "").strip()]
    if len(str(t.get("title") or "")) >= TITLE_MAX:
        out.append(f"{name}: title is {len(t['title'])} characters; keep it under {TITLE_MAX}")
    for field, least in LIST_FIELDS.items():
        if len(t.get(field) or []) < least:
            out.append(f"{name}: {field} needs at least {least}")
    mine = t.get("content_mine") or []
    if len(mine) < MIN_FACTS:
        out.append(f"{name}: content_mine has {len(mine)} facts; a 15-minute video needs at least {MIN_FACTS}")
    for fact in mine:
        if not (fact.get("source") and fact.get("beat")):
            out.append(f"{name}: fact {fact.get('fact')!r} needs a source and the beat it moves")
    if not (t.get("thumbnail") or {}).get("image"):
        out.append(f"{name}: no thumbnail image (no thumbnail, no idea)")
    if not (t.get("closest_video") or {}).get("difference"):
        out.append(f"{name}: no closest_video difference")
    if not (t.get("runtime") or {}).get("strong_minutes"):
        out.append(f"{name}: no runtime strong_minutes")
    return out


def total(scores: dict[str, Any], copies_trending: bool = False) -> int:
    points = 0
    for key, weight in WEIGHTS.items():
        value = (scores.get(key) or {}).get("score")
        if not isinstance(value, (int, float)) or not 1 <= value <= 10:
            raise ValueError(f"score {key} must be 1-10, not {value!r}")
        points += value * weight
    return round(points - (TREND_PENALTY if copies_trending else 0))


def rank(topics: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Every topic with its total, best first; ties go to more content, then excitement."""
    out = [{**t, "total": total(t["scores"], bool(t.get("copies_trending")))} for t in topics]
    return sorted(
        out, key=lambda t: (-t["total"], -t["scores"]["content"]["score"], -t["scores"]["excitement"]["score"])
    )


def markdown(ranked: list[dict[str, Any]], date: str) -> str:
    lines = [f"# Say Suppose topics, {date}", "", "Ranked by total (content first). The owner picks three.", ""]
    for i, t in enumerate(ranked, 1):
        s = t["scores"]
        parts = ", ".join(f"{k} {s[k]['score']}" for k in WEIGHTS)
        flag = " · copies a trending twist (-10)" if t.get("copies_trending") else ""
        lines += [
            f"## {i}. {t['title']} — {t['total']}/100",
            f"{t['premise']}  ",
            f"*{parts}{flag}; by {', '.join(t.get('proposers') or ['?'])}*",
            "",
            f"- **Rule:** {t['rule']}",
            f"- **Hook:** {t['hook']}",
            f"- **Under-question:** {t['under_question']}",
            f"- **Best moment:** {t.get('best_moment', '')}",
            f"- **Runtime:** {t['runtime'].get('strong_minutes')} strong minutes; cut: {t['runtime'].get('cut_to', '')}",
            "",
        ]
    return "\n".join(lines)


def page(ranked: list[dict[str, Any]], date: str) -> str:
    data = json.dumps({"date": date, "weights": WEIGHTS, "topics": ranked}).replace("</", "<\\/")
    return PAGE.read_text(encoding="utf-8").replace("{{DATA}}", data).replace("{{DATE}}", html.escape(date))


def _load(path: str) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main(argv: list[str]) -> int:
    if argv[:1] == ["pitch"] and len(argv) == 4:
        out = Path(argv[3])
        data = pitch(argv[1], Path(argv[2]).read_text(encoding="utf-8"), raw_path=out.with_suffix(".raw.txt"))
        Path(argv[3]).write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"{argv[1]}: {len(data['topics'])} topics -> {argv[3]}")
        return 0
    if len(argv) < 2 or argv[0] not in ("check", "rank", "page"):
        print(__doc__)
        return 2
    data = _load(argv[1])
    if argv[0] == "check":
        problems = [p for t in data["topics"] for p in brief_problems(t)]
        print("\n".join(problems) or f"{len(data['topics'])} briefs complete")
        return 1 if problems else 0
    ranked = rank(data["topics"])
    out = Path(argv[2])
    date = str(data.get("date") or "")
    if argv[0] == "rank":
        out.write_text(markdown(ranked, date), encoding="utf-8")
        out.with_suffix(".json").write_text(json.dumps({"date": date, "topics": ranked}, indent=2), encoding="utf-8")
    else:
        out.write_text(page(ranked, date), encoding="utf-8")
    print(f"{len(ranked)} topics -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
