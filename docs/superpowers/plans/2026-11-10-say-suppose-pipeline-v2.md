# Say Suppose pipeline v2, phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build phase 1 of the pipeline v2 design (`docs/superpowers/specs/2026-11-10-say-suppose-pipeline-v2-design.md`):
the room tools enforce owner first, one room round, per-seat caps and an optional viewer; the report shows the author's
cut and what review cost the voice; gates are timed; the meaning layer (`> UNDER:`) is linted; channel rules and
skills carry the new rooms, hooks, audition and look test.

**Architecture:** All tool changes are in `core/studio/room/` and are opt-in per channel through new `room.yaml` keys
(`limits`, `viewer_required`, `owner_first`), so Professor of Us keeps today's behaviour. Two new pure modules
(`spine.py`, `times.py`) keep `report.py` and `__main__.py` inside the size budget. The meaning layer is one more check
in the what-if `story_lint.py`, required only for videos dated on or after its adoption. Everything else is text in
`channels/say-suppose/` and the `studio-*` skills.

**Tech Stack:** Python 3.12, pytest (xdist), ruff 0.17.2, PyYAML, SQLite (room ledger). No new dependencies.

## Owner decisions taken (2026-11-10, "Looks fine")

The owner accepted the spec as written. Where section 7 offered a choice, the plan takes the spec's default:

| # | Decision | Taken as |
|---|---|---|
| 1 | `> UNDER:` line | Yes; lint requires it for videos dated 2026-11-10 or later |
| 2 | Review limits | Yes: `rounds: 1`, three blockers, three suggestions, three keep lines per seat |
| 3 | Author's cut | Yes: the report shows round 1's draft and what review cost the voice |
| 4 | Owner first, enforced | Yes: `owner_first: true`; round-1 seats refuse until the draft is presented |
| 5 | Viewer seat | Off the critical path now (`viewer_required: false`); the model stays Grok until the viewer trial (PR #27) reports |
| 6 | Director model | Keep Opus 5.5 (no change); measure on films 2 and 3 |
| 7 | The dreamer | Yes: Fable pitches from craft alone, no web |
| 8 | New hooks | Shelf (suggestions) for two films, not must-pass yet |
| 9 | Audition and look test | Yes, as skill steps |
| 10 | Spend approvals a sitting early | Yes, as skill steps |
| 11 | Build order | This plan is items 1, 2, 3, 4, 6, 11 and the text half of 8. Items 5 (G4/G5 speed-ups), 7 (slide detector and frame-pack room), 9 (reading room) and 10 (per-gate seats) are larger and get their own plans |

## Global Constraints

- Seven gates G1-G7, fixed; only the owner approves; never run `omni approve` or touch `~/.config/omni-studio/`.
- No paid provider calls; no real room seat calls in tests (fake runner only).
- Fact blockers are never trimmed, dropped or made optional.
- Story and fact are always required roles; only the viewer may be optional, and only by `viewer_required: false`.
- New keys default to today's behaviour: Professor of Us `room.yaml` is untouched.
- Size budgets: no module over 500 lines; no function over 60 lines unless in `core/studio/config/size_baseline.yaml`,
  whose numbers may only shrink (`__main__.py::cmd_seat` 67, `call.py::run_seat` 82, `evidence.py::_verify` 159;
  `test_room_cli.py` 609 and `test_room_evidence.py` 511 lines). New tests go in new files.
- Tests over 2 s fail unless `@pytest.mark.slow`.
- Inside `core/openmontage/` edit only files with `studio` in the name.
- Never write under `videos/*/room/` by hand.
- Run Python from the worktree root with
  `export PYTHONPATH="$PWD/core/openmontage:$PWD/core" PYTHONDONTWRITEBYTECODE=1` and
  `PY=~/Exploration/projects/omni-studio/.venv/bin/python`.

---

### Task 1: Per-seat caps on blockers, suggestions and keep lines

**Files:**
- Modify: `core/studio/room/verdict.py` (Verdict gets `trimmed`; `parse_verdict` takes `limits`)
- Modify: `core/studio/room/config.py` (`limits` key; `SeatConfig.limits`)
- Modify: `core/studio/room/call.py` (`seat_prompt` states the caps; `run_seat` passes `seat.limits`)
- Test: `core/studio/tests/test_room_limits.py`

**Interfaces:**
- Produces: `RoomConfig.limits: dict[str, int]` (keys `blockers`, `suggestions`, `keep`), `SeatConfig.limits`
  (same dict), `parse_verdict(..., limits: Optional[dict[str, int]] = None)`, `Verdict.trimmed: dict[str, int]`,
  `seat_prompt(brief, role, inputs, limits=None)`.

- [ ] **Step 1: Write the failing tests** in `core/studio/tests/test_room_limits.py`:

```python
"""Per-seat caps (pipeline v2, section 4): at most N blockers, suggestions and keep lines; fact blockers are never cut."""

from __future__ import annotations

import json

import pytest

from studio.room import call
from studio.room import config as C
from studio.room.verdict import parse_verdict

LIMITS = {"blockers": 3, "suggestions": 3, "keep": 3}


def _b(i, domain="story"):
    return {"line": i, "quote": f"line {i}", "why": "flat", "fix": f"fix {i}", "domain": domain}


def _parse(role, data, limits=LIMITS):
    return parse_verdict(json.dumps(data), call_id="c", seat="s", role=role, model="m", family="f", limits=limits)


def test_a_seat_keeps_its_first_three_blockers_and_records_the_rest():
    v = _parse("story", {"blockers": [_b(i) for i in range(5)], "suggestions": [], "keep": []})
    assert [b.line for b in v.blockers] == [0, 1, 2]
    assert v.trimmed == {"blockers": 2}


def test_fact_blockers_are_never_trimmed():
    v = _parse("fact", {"blockers": [_b(i, "fact") for i in range(5)]})
    assert len(v.blockers) == 5 and v.trimmed == {}


def test_suggestions_and_keep_lines_are_capped():
    items = [{"quote": f"q{i}", "fix": "x"} for i in range(6)]
    v = _parse("craft", {"blockers": [], "suggestions": items, "keep": [f"k{i}" for i in range(4)]})
    assert len(v.suggestions) == 3 and len(v.keep) == 3
    assert v.trimmed == {"suggestions": 3, "keep": 1}


def test_no_limits_means_no_cap():
    v = _parse("story", {"blockers": [_b(i) for i in range(5)]}, limits=None)
    assert len(v.blockers) == 5 and v.trimmed == {}


def test_the_prompt_states_the_caps():
    text = call.seat_prompt("brief", "story", {"draft": "a"}, LIMITS)
    assert "at most 3 blockers" in text and "worst first" in text
    assert "at most 3 blockers" not in call.seat_prompt("brief", "story", {"draft": "a"})


BASE = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 1
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
"""


def test_room_yaml_limits_reach_every_seat(tmp_path):
    (tmp_path / "room.yaml").write_text(BASE + "limits: {blockers: 3, suggestions: 3, keep: 3}\n")
    cfg = C.load_room(tmp_path / "room.yaml")
    assert cfg.limits == LIMITS and all(s.limits == LIMITS for s in cfg.seats)


@pytest.mark.parametrize("bad", ["limits: 3", "limits: {blockers: 0}", "limits: {vetoes: 2}", "limits: {keep: x}"])
def test_bad_limits_are_config_errors(tmp_path, bad):
    (tmp_path / "room.yaml").write_text(BASE + bad + "\n")
    with pytest.raises(C.RoomConfigError):
        C.load_room(tmp_path / "room.yaml")
```

- [ ] **Step 2: Run to verify they fail**

Run: `$PY -m pytest core/studio/tests/test_room_limits.py -q -p no:xdist`
Expected: FAIL (`parse_verdict() got an unexpected keyword argument 'limits'`).

- [ ] **Step 3: Implement.** In `verdict.py` add `trimmed: dict[str, int] = field(default_factory=dict)` to `Verdict`
after `error`, and a helper used at the end of `parse_verdict` (new keyword `limits: Optional[dict[str, int]] = None`):

```python
def _cap(items: list, limit: Optional[int], name: str, trimmed: dict[str, int]) -> list:
    """The first `limit` items (a seat lists its worst first); how many were cut goes into `trimmed`."""
    if limit is None or len(items) <= limit:
        return items
    trimmed[name] = len(items) - limit
    return items[:limit]
```

```python
    limits = limits or {}
    trimmed: dict[str, int] = {}
    if role != "fact":  # a fact blocker is never cut
        blockers = _cap(blockers, limits.get("blockers"), "blockers", trimmed)
    suggestions = _cap(suggestions, limits.get("suggestions"), "suggestions", trimmed)
    keep = _cap(keep, limits.get("keep"), "keep", trimmed)
    return Verdict(call_id, seat, role, model, family, "ok", scores, blockers, suggestions, keep, trimmed=trimmed)
```

In `config.py`: `LIMIT_KEYS = ("blockers", "suggestions", "keep")`; `SeatConfig.limits: dict[str, int] =
field(default_factory=dict)`; `RoomConfig.limits: dict[str, int] = field(default_factory=dict)`; a parser:

```python
def _limits(raw: Any, path: Path) -> dict[str, int]:
    if raw is None:
        return {}
    if not isinstance(raw, dict) or not set(raw) <= set(LIMIT_KEYS):
        raise RoomConfigError(f"{path}: limits must be a mapping with keys from {LIMIT_KEYS}, not {raw!r}")
    out = {}
    for key, value in raw.items():
        if isinstance(value, bool) or not isinstance(value, int) or value < 1:
            raise RoomConfigError(f"{path}: limits.{key} must be a whole number of 1 or more, not {value!r}")
        out[key] = value
    return out
```

`load_room` computes `limits = _limits(data.get("limits"), path)` before building seats, passes `limits` into every
`SeatConfig(...)` and into `RoomConfig(limits=limits)`.

In `call.py`, `seat_prompt(brief, role, inputs, limits=None)` appends after `VERDICT_SPEC` when limits is non-empty:

```python
def _caps_line(limits: Optional[dict[str, int]]) -> str:
    if not limits:
        return ""
    parts = [f"at most {limits[k]} {k if k != 'keep' else 'keep lines'}" for k in ("blockers", "suggestions", "keep") if k in limits]
    return "Give " + ", ".join(parts) + ", worst first. A fact seat lists every fact blocker; nothing else is cut."
```

and `run_seat` builds the prompt with `seat_prompt(..., seat.limits)` and calls `parse_verdict(..., limits=seat.limits)`.
`run_seat` must stay at 82 lines or fewer (size baseline).

- [ ] **Step 4: Run the tests**: `$PY -m pytest core/studio/tests/test_room_limits.py core/studio/tests/test_room_verdict.py core/studio/tests/test_room_call.py -q -p no:xdist` → PASS.

- [ ] **Step 5: Commit** `feat(room): per-seat caps on blockers, suggestions and keep lines`.

---

### Task 2: The viewer off the critical path (`viewer_required: false`)

**Files:**
- Modify: `core/studio/room/config.py` (`viewer_required`, `required_roles()`, family spread, `derived_cap`)
- Modify: `core/studio/room/report.py` (`required` through `is_candidate`, `_best`, `best_before`, `shipped`,
  `build_report`; md wording)
- Modify: `core/studio/room/evidence.py` (`required_roles` from the report; story and fact always)
- Modify: `core/studio/room/__main__.py` (`cmd_judge`, `cmd_report` pass `required_roles(cfg)`)
- Modify: `core/studio/tests/test_room_config.py` (the derived-cap number)
- Test: `core/studio/tests/test_room_viewer_optional.py`

**Interfaces:**
- Produces: `config.ALWAYS_REQUIRED = ("story", "fact")`, `config.required_roles(cfg) -> tuple[str, ...]`,
  `report.is_candidate(rnd, required=MANDATORY)`, `report.best_before(rounds, n, required=MANDATORY)`,
  `report.shipped(rounds, required=MANDATORY)`, `build_report(..., required=MANDATORY)` writing `"required_roles"`.
- Derived cap: `rounds*(seats+2) + rounds*seats + len(required) + 2 + OWNER_ROUNDS*len(required seats)` with
  `OWNER_ROUNDS = 3`, so a one-round room still has calls for owner-notes rounds.

- [ ] **Step 1: Failing tests** in `core/studio/tests/test_room_viewer_optional.py`:

```python
"""viewer_required: false (pipeline v2, section 2): a round ships on story and fact; a late viewer never holds it."""

from __future__ import annotations

import json

from studio.room import config as C
from studio.room import evidence as E
from studio.room import report as R
from studio.room import snapshot as S
from studio.room.ledger import Ledger
from studio.room.verdict import verdict_digest

ROOM = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 1
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
"""
MODEL = {"xai": "grok-4.7-high", "openai": "gpt-5.6-sol-high", "google": "gemini-3.7-flash-high"}


def _cfg(tmp_path, extra=""):
    (tmp_path / "room.yaml").write_text(ROOM + extra)
    return C.load_room(tmp_path / "room.yaml")


def test_required_roles_default_and_optional_viewer(tmp_path):
    assert C.required_roles(_cfg(tmp_path)) == ("viewer", "story", "fact")
    assert C.required_roles(_cfg(tmp_path, "viewer_required: false\n")) == ("story", "fact")


def test_viewer_required_must_be_a_boolean(tmp_path):
    import pytest

    with pytest.raises(C.RoomConfigError):
        _cfg(tmp_path, "viewer_required: maybe\n")


def test_the_cap_leaves_room_for_owner_notes_rounds(tmp_path):
    cfg = _cfg(tmp_path, "viewer_required: false\n")
    assert C.derived_cap(cfg) == 1 * (3 + 2) + 1 * 3 + 2 + 2 + 3 * 2  # 18


def _setup(tmp_path, seats, required):
    video = tmp_path / "2026-11-10_x"
    video.mkdir()
    script = video / "script.md"
    script.write_text("You stop.\n")
    sha = S.save_draft(video, script)
    db = Ledger(tmp_path / "l.sqlite")
    R.write_meta(video, "g2", 1, sha, {"ok": True, "problems": [], "warnings": []})
    for seat, role, fam in seats:
        cid = db.reserve(channel="ss", video=video.name, gate="g2", round=1, seat=seat, model=MODEL[fam], family=fam,
                         prompt_sha256="p", daily_cap=99, script_cap=99)
        rec = {"draft_sha256": sha, "call_id": cid, "seat": seat, "role": role, "model": MODEL[fam], "family": fam,
               "status": "ok", "scores": {}, "blockers": [], "suggestions": [], "keep": [], "error": "",
               "output_sha256": "o-" + seat}
        db.finish(cid, status="ok", output_sha256="o-" + seat, duration_s=1, verdict_sha256=verdict_digest(rec))
        (R.round_dir(video, "g2", 1) / f"{seat}.json").write_text(json.dumps(rec))
    rep = R.build_report(video, gate="g2", stage="story_script", channel="ss", writer_family="anthropic", ledger=db,
                         cap=18, required=required)
    return video, script, rep, db


STORY_FACT = (("story", "story", "openai"), ("fact", "fact", "google"))


def test_a_round_without_the_viewer_ships_when_the_viewer_is_optional(tmp_path):
    video, script, rep, db = _setup(tmp_path, STORY_FACT, ("story", "fact"))
    assert rep["shipped"]["round"] == 1 and rep["required_roles"] == ["story", "fact"]
    assert E.verify(video, rep, script, db) == []


def test_without_the_option_a_missing_viewer_still_ships_nothing(tmp_path):
    _, _, rep, _ = _setup(tmp_path, STORY_FACT, C.MANDATORY)
    assert rep["shipped"] is None


def test_a_report_that_drops_story_or_fact_fails_verify(tmp_path):
    video, script, rep, db = _setup(tmp_path, STORY_FACT, ("story", "fact"))
    rep["required_roles"] = ["story"]
    assert any("required roles" in p for p in E.verify(video, rep, script, db))
```

(`C.MANDATORY` is re-exported by `config.py`, which already imports it from `verdict.py`.)

- [ ] **Step 2: Run to verify they fail**: `$PY -m pytest core/studio/tests/test_room_viewer_optional.py -q -p no:xdist`
→ FAIL (`required_roles` missing).

- [ ] **Step 3: Implement.**

`config.py`:

```python
ALWAYS_REQUIRED = ("story", "fact")  # only the viewer may be made optional
OWNER_ROUNDS = 3  # calls kept for owner-notes rounds past `rounds` (required seats only)


def required_roles(cfg: "RoomConfig") -> tuple[str, ...]:
    """The roles a round needs an ok verdict from to ship: MANDATORY, or story and fact when the viewer is optional."""
    return MANDATORY if cfg.viewer_required else ALWAYS_REQUIRED


def derived_cap(cfg: RoomConfig) -> int:
    seats = len(cfg.seats)
    required = required_roles(cfg)
    needed = sum(1 for s in cfg.seats if s.role in required)
    return cfg.rounds * (seats + 2) + cfg.rounds * seats + len(required) + 2 + OWNER_ROUNDS * needed
```

`RoomConfig.viewer_required: bool = True`; `load_room` reads it and raises `RoomConfigError` unless it is a bool.
`validate` keeps the "missing mandatory role" check over `MANDATORY` (a viewer seat must still exist and read) and
computes the two-family spread over seats whose role is in `required_roles(cfg)`. The existing test
`test_derived_cap` changes to `3 * (3 + 2) + 3 * 3 + 3 + 2 + 3 * 3  # 38`.

`report.py`: add `required: tuple[str, ...] = MANDATORY` to `is_candidate`, `_best`, `best_before`, `shipped`,
`build_report`; `is_candidate` loops `for role in required` and its failed-verdict test uses `in required`;
`build_report` adds `"required_roles": list(required)`; the md "Shipped: none" text names the required roles from the
report.

`evidence.py`: new helper, and `_verify` uses `required` wherever it used `MANDATORY`, including
`R.shipped(R.load_rounds(...), required)`. Keep `_verify` at 159 lines or fewer: move the closing cap check into a
helper `_cap_problems(report, ledger, video, gate)`.

```python
def _required(report: dict[str, Any], problems: list[str]) -> tuple[str, ...]:
    """The report's required roles: story and fact always, nothing outside MANDATORY. Old reports mean MANDATORY."""
    raw = report.get("required_roles", list(MANDATORY))
    roles = tuple(r for r in raw if isinstance(r, str)) if isinstance(raw, list) else ()
    if not set(ALWAYS_REQUIRED) <= set(roles) or not set(roles) <= set(MANDATORY):
        problems.append(f"the report's required roles {raw!r} must include story and fact and stay within {MANDATORY}")
        return MANDATORY
    return roles
```

`__main__.py`: `cmd_judge` uses `R.best_before(rounds, args.round, required_roles(cfg))` and
`R.is_candidate(current, required_roles(cfg))`; `cmd_report` passes `required=required_roles(cfg)`.

- [ ] **Step 4: Run** `$PY -m pytest core/studio/tests/test_room_viewer_optional.py core/studio/tests/test_room_config.py core/studio/tests/test_room_report.py core/studio/tests/test_room_evidence.py core/studio/tests/test_room_cli.py -q` → PASS.

- [ ] **Step 5: Commit** `feat(room): viewer_required: false takes the viewer off the critical path`.

---

### Task 3: Owner first, enforced (`owner_first: true`, `present`)

**Files:**
- Modify: `core/studio/room/report.py` (`write_meta` records `linted_at`; `presented_path`, `read_presented`)
- Modify: `core/studio/room/config.py` (`owner_first: bool = False`)
- Modify: `core/studio/room/__main__.py` (`present` subcommand; `cmd_seat` refuses round 1 until presented)
- Test: `core/studio/tests/test_room_owner_first.py`

**Interfaces:**
- Produces: `meta.json["linted_at"]` (ISO 8601 UTC); `room/<gate>/presented.json` =
  `{"draft_sha256": str, "at": str}`; `report.presented_path(video, gate) -> Path`;
  `report.read_presented(video, gate) -> Optional[dict]`; CLI `python -m studio.room present <video> <gate> --config <room.yaml>`.

- [ ] **Step 1: Failing tests** in `core/studio/tests/test_room_owner_first.py` (fake runner as in
`test_room_cli.py`):

```python
"""owner_first (pipeline v2, section 4 limit 2): the owner reads round 1's draft before any seat runs."""

from __future__ import annotations

import json
import subprocess

from studio.room import __main__ as cli
from studio.room import call
from studio.room import report as R

ROOM = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 1
owner_first: true
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
format: {wpm: 155}
"""
CLEAN = {"scores": {}, "blockers": [], "suggestions": [], "keep": []}


def _fake(monkeypatch, answers):
    def run(cmd, **kw):
        if cmd[0] == "git":
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        return subprocess.CompletedProcess(cmd, 0, stdout=json.dumps({"result": json.dumps(answers.pop(0))}), stderr="")

    monkeypatch.setattr(call.subprocess, "run", run)


def _video(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))
    channel = tmp_path / "say-suppose"
    video = channel / "videos" / "2026-11-10_x"
    video.mkdir(parents=True)
    (channel / "room.yaml").write_text(ROOM)
    script = video / "script.md"
    script.write_text("## [00:00] Hook\nYou stop.\n")
    return video, script, str(channel / "room.yaml")


def _seat(video, cfg, seat="story editor", rnd="1"):
    return cli.main(["seat", str(video), "g2", "--round", rnd, "--seat", seat, "--config", cfg])


def test_lint_records_when_it_ran(tmp_path, monkeypatch):
    video, script, cfg = _video(tmp_path, monkeypatch)
    assert cli.main(["lint", str(video), "g2", "--round", "1", "--draft", str(script), "--config", cfg]) == 0
    assert R.read_meta(video, "g2", 1)["linted_at"].endswith("+00:00")


def test_a_round_one_seat_waits_for_the_owner(tmp_path, monkeypatch, capsys):
    video, script, cfg = _video(tmp_path, monkeypatch)
    cli.main(["lint", str(video), "g2", "--round", "1", "--draft", str(script), "--config", cfg])
    assert _seat(video, cfg) == 2
    assert "owner first" in capsys.readouterr().err
    assert cli.main(["present", str(video), "g2", "--config", cfg]) == 0
    assert R.read_presented(video, "g2")["draft_sha256"] == R.read_meta(video, "g2", 1)["draft_sha256"]
    _fake(monkeypatch, [CLEAN])
    assert _seat(video, cfg) == 0


def test_present_needs_a_clean_round_one(tmp_path, monkeypatch, capsys):
    video, script, cfg = _video(tmp_path, monkeypatch)
    assert cli.main(["present", str(video), "g2", "--config", cfg]) == 2
    assert "lint round 1" in capsys.readouterr().err


def test_a_relinted_draft_must_be_presented_again(tmp_path, monkeypatch, capsys):
    video, script, cfg = _video(tmp_path, monkeypatch)
    cli.main(["lint", str(video), "g2", "--round", "1", "--draft", str(script), "--config", cfg])
    cli.main(["present", str(video), "g2", "--config", cfg])
    script.write_text("## [00:00] Hook\nYou stop, then go.\n")
    cli.main(["lint", str(video), "g2", "--round", "1", "--draft", str(script), "--config", cfg])
    assert _seat(video, cfg) == 2
    assert "owner first" in capsys.readouterr().err


def test_owner_notes_rounds_need_no_presentation(tmp_path, monkeypatch):
    video, script, cfg = _video(tmp_path, monkeypatch)
    cli.main(["lint", str(video), "g2", "--round", "2", "--draft", str(script), "--config", cfg, "--owner-notes"])
    _fake(monkeypatch, [CLEAN])
    assert _seat(video, cfg, rnd="2") == 0
```

- [ ] **Step 2: Run** → FAIL (no `linted_at`, no `present`).

- [ ] **Step 3: Implement.**

`report.py`: `write_meta` adds `"linted_at": datetime.now(timezone.utc).isoformat(timespec="seconds")`; and

```python
def presented_path(video_dir: Path, gate: str) -> Path:
    return gate_dir(video_dir, gate) / "presented.json"


def read_presented(video_dir: Path, gate: str) -> Optional[dict[str, Any]]:
    return _json(presented_path(video_dir, gate))
```

`config.py`: `RoomConfig.owner_first: bool = False`, read in `load_room` (bool only, else `RoomConfigError`).

`__main__.py`: replace the `meta = _meta(...)` + "run lint first" block at the top of `cmd_seat` with one call to a new
helper (keeps `cmd_seat` at 67 lines or fewer):

```python
def _round_ready(args, cfg, video: Path) -> Optional[dict]:
    """The round's meta when a seat may run: linted, and under owner_first round 1's draft already shown to the owner."""
    meta = _meta(video, args.gate, args.round)
    if meta is None:
        print(f"run lint for round {args.round} first", file=sys.stderr)
        return None
    presented = R.read_presented(video, args.gate) or {}
    if cfg.owner_first and args.round == 1 and presented.get("draft_sha256") != meta["draft_sha256"]:
        print(
            "owner first: show round 1's draft to the owner, then run `python -m studio.room present "
            f"{args.video_dir} {args.gate} --config {args.config}` before any seat",
            file=sys.stderr,
        )
        return None
    return meta


def cmd_present(args) -> int:
    cfg = load_room(Path(args.config))
    video = _video_in(args, cfg)
    if video is None:
        return 2
    meta = _meta(video, args.gate, 1)
    if meta is None or not (meta.get("lint") or {}).get("ok"):
        print("lint round 1 clean first; the owner reads a draft that passed lint and qc", file=sys.stderr)
        return 2
    at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    R.presented_path(video, args.gate).write_text(
        json.dumps({"draft_sha256": meta["draft_sha256"], "at": at}, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps({"presented": meta["draft_sha256"], "at": at}))
    return 0
```

and a `present` subparser using `common(s)`. Move parser construction out of `main` into `_parser()` if `main` would
pass 60 lines.

- [ ] **Step 4: Run** `$PY -m pytest core/studio/tests/test_room_owner_first.py core/studio/tests/test_room_cli.py -q` → PASS.

- [ ] **Step 5: Commit** `feat(room): owner first - round-1 seats wait until the draft is presented`.

---

### Task 4: The author's cut and what review cost the voice

**Files:**
- Create: `core/studio/room/spine.py`
- Modify: `core/studio/room/report.py` (`build_report` adds `author_cut` and `presented`; `write_report` adds a section)
- Test: `core/studio/tests/test_room_spine.py`

**Interfaces:**
- Produces: `spine.header_lines(text) -> list[tuple[str, str]]`, `spine.voice_cost(first: str, shipped: str,
  keeps: list[str]) -> dict` with keys `lines_changed: int`, `header_changed: list[str]`, `keep_lost: list[str]`;
  report JSON keys `author_cut` (`{"round", "draft_sha256", "cost"}` or None) and `presented` (or None).

- [ ] **Step 1: Failing tests** in `core/studio/tests/test_room_spine.py`:

```python
"""The author's cut (pipeline v2, section 4 limits 5-7): round 1's draft beside the shipped one, and what review cost."""

from __future__ import annotations

import json

from studio.room import report as R
from studio.room import snapshot as S
from studio.room import spine
from studio.room.ledger import Ledger

FIRST = """> SITUATION: You see the counter.
> UNDER: Would you still forgive if you couldn't forget?
> DARLING: Mumma calls. You let it ring. Once.
## [00:00] Hook
Mumma calls. You let it ring. Once.
The chai goes cold.
"""
SHIPPED = """> SITUATION: You see the counter.
> UNDER: What would you forgive?
## [00:00] Hook
Mumma calls and you let it ring once.
The chai goes cold.
"""


def test_header_lines_reads_the_spine():
    assert ("UNDER", "Would you still forgive if you couldn't forget?") in spine.header_lines(FIRST)


def test_voice_cost_names_changed_spine_and_lost_keep_lines():
    cost = spine.voice_cost(FIRST, SHIPPED, ["The chai goes cold.", "Mumma calls. You let it ring. Once."])
    assert cost["header_changed"] == ["UNDER", "DARLING"]
    assert cost["keep_lost"] == ["Mumma calls. You let it ring. Once."]
    assert cost["lines_changed"] == 3


def test_the_report_shows_the_author_cut(tmp_path):
    video = tmp_path / "2026-11-10_x"
    video.mkdir()
    draft = video / "script.md"
    keep = {"call_id": "k", "seat": "story", "role": "story", "model": "m", "family": "openai", "status": "ok",
            "blockers": [], "keep": [{"quote": "Mumma calls. You let it ring. Once."}]}
    for n, text in ((1, FIRST), (2, SHIPPED)):
        draft.write_text(text)
        sha = S.save_draft(video, draft)
        R.write_meta(video, "g2", n, sha, {"ok": True}, owner_notes=n == 2)
        for seat, role, fam in (("viewer", "viewer", "xai"), ("story", "story", "openai"), ("fact", "fact", "google")):
            rec = {**keep, "call_id": f"{seat}{n}", "seat": seat, "role": role, "family": fam}
            (R.round_dir(video, "g2", n) / f"{seat}.json").write_text(json.dumps(rec))
    rep = R.build_report(video, gate="g2", stage="story_script", channel="ss", writer_family="anthropic",
                         ledger=Ledger(tmp_path / "l.sqlite"), cap=20)
    assert rep["shipped"]["round"] == 2 and rep["author_cut"]["round"] == 1
    assert rep["author_cut"]["cost"]["keep_lost"] == ["Mumma calls. You let it ring. Once."]
    _, md = R.write_report(video, rep)
    text = md.read_text()
    assert "## Author's cut" in text and "room/drafts/" in text and "keep lines lost: 1" in text
```

- [ ] **Step 2: Run** → FAIL (no module `spine`).

- [ ] **Step 3: Implement** `core/studio/room/spine.py`:

```python
"""The protected spine and the author's cut (pipeline v2, section 4): what the room changed in the writer's draft.

The spine's mechanical part is the header lines (the five lines, `> UNDER:` and the writer's `> DARLING:` lines) and
the seats' keep lines. The rest of what review costs (fragments, jokes, images) is the writer's three-line report.
"""

from __future__ import annotations

import difflib
import re

HEADER = re.compile(r"^>\s*(SITUATION|DESIRE|CONFLICT|CHANGE|RESULT|UNDER|DARLING)\s*:\s*(.*)$")


def header_lines(text: str) -> list[tuple[str, str]]:
    return [(m.group(1), m.group(2).strip()) for m in map(HEADER.match, (ln.strip() for ln in text.splitlines())) if m]


def _norm(text: str) -> str:
    return " ".join(text.split()).casefold()


def voice_cost(first: str, shipped: str, keeps: list[str]) -> dict:
    kept_headers = set(header_lines(shipped))
    body = _norm(shipped)
    diff = difflib.ndiff(first.splitlines(), shipped.splitlines())
    return {
        "lines_changed": sum(1 for d in diff if d[:1] in "+-"),
        "header_changed": list(dict.fromkeys(n for n, b in header_lines(first) if (n, b) not in kept_headers)),
        "keep_lost": list(dict.fromkeys(q for q in keeps if q.strip() and _norm(q) not in body)),
    }
```

Note: `lines_changed` counts `+` and `-` lines. In the test, 2 removed (`> UNDER`, `> DARLING`, and the "Mumma calls"
line: 3 removed) and 2 added: adjust the expected number in the test to what `ndiff` gives for these fixtures before
committing (count once by hand, then pin it).

`report.py`: in `build_report`, after `summary`, add `"author_cut": _author_cut(video_dir, rounds, ship)` (ship = `shipped(rounds, required)`) and
`"presented": read_presented(video_dir, gate)`:

```python
def _author_cut(video_dir: Path, rounds: list[dict[str, Any]], ship: Optional[dict[str, Any]]) -> Optional[dict]:
    """Round 1's draft and what the rounds after it cost the voice, when a later round ships."""
    if not rounds or not ship:
        return None
    first = rounds[0]
    keeps = [k.get("quote", "") if isinstance(k, dict) else str(k) for r in rounds for v in r["verdicts"]
             if v.get("status") == "ok" for k in v.get("keep") or []]
    try:
        cost = spine.voice_cost(load_draft(video_dir, first["draft_sha256"]),
                                load_draft(video_dir, ship["artifact_sha256"]), keeps)
    except (OSError, ValueError):
        cost = None
    return {"round": first["round"], "draft_sha256": first["draft_sha256"], "cost": cost}
```

`write_report` adds, after the Shipped/Calls lines:

```python
    cut = report.get("author_cut")
    if cut:
        cost = cut.get("cost") or {}
        lines += ["", "## Author's cut", "",
                  f"Round {cut['round']}'s draft: room/drafts/{cut['draft_sha256']}.md",
                  f"What review cost the voice: {cost.get('lines_changed', '?')} lines changed; "
                  f"spine lines changed: {', '.join(cost.get('header_changed') or []) or 'none'}; "
                  f"keep lines lost: {len(cost.get('keep_lost') or [])}"]
        lines += [f'- lost keep line: "{q}"' for q in cost.get("keep_lost") or []]
    pres = report.get("presented")
    if pres:
        lines += ["", f"Owner first: round 1's draft was presented at {pres.get('at')}"]
```

- [ ] **Step 4: Run** `$PY -m pytest core/studio/tests/test_room_spine.py core/studio/tests/test_room_report.py core/studio/tests/test_room_evidence.py -q` → PASS.

- [ ] **Step 5: Commit** `feat(room): the report shows the author's cut and what review cost the voice`.

---

### Task 5: Gate times and the seat scorecard

**Files:**
- Create: `core/studio/room/times.py`
- Modify: `core/studio/room/ledger.py` (`rows(...)`)
- Modify: `core/studio/room/__main__.py` (`times` and `scorecard` subcommands)
- Test: `core/studio/tests/test_room_times.py`

**Interfaces:**
- Produces: `Ledger.rows(*, channel=None, video=None, gate=None) -> list[CallRow]` (ordered by `at`);
  `times.gate_times(video_dir: Path, ledger: Ledger, channel: str) -> list[dict]` (one dict per gate g1, g2 with keys
  `gate, linted_at, presented_at, minutes_to_owner, first_call, last_call_done, room_rounds, owner_rounds, calls,
  checkpoint`); `times.render_times(rows) -> str` (markdown table); `times.scorecard(channel_dir: Path) -> list[dict]`
  (per seat: `seat, films, agreed, unsure, disagreed, share, flag`); `times.render_scorecard(rows) -> str`.
- Marks file the session writes from the owner's words (not under `room/`):
  `videos/<id>/review-<gate>-marks.yaml`, a list of `{seat: <name>, line: <n>, mark: agreed|unsure|disagreed}`.
- CLI: `python -m studio.room times <video> --config <room.yaml>`; `python -m studio.room scorecard --config <room.yaml>`.

- [ ] **Step 1: Failing tests** in `core/studio/tests/test_room_times.py`:

```python
"""Measure every gate (pipeline v2, optimisation 6) and let seats earn their place (section 4 limit 10)."""

from __future__ import annotations

import json

from studio.room import report as R
from studio.room import times as T
from studio.room.ledger import Ledger


def _video(tmp_path):
    video = tmp_path / "say-suppose" / "videos" / "2026-11-10_x"
    video.mkdir(parents=True)
    return video


def test_gate_times_reads_meta_presented_ledger_and_checkpoint(tmp_path):
    video = _video(tmp_path)
    R.write_meta(video, "g2", 1, "a" * 64, {"ok": True})
    R.write_meta(video, "g2", 2, "b" * 64, {"ok": True}, owner_notes=True)
    meta = R.round_dir(video, "g2", 1) / "meta.json"
    meta.write_text(json.dumps({**json.loads(meta.read_text()), "linted_at": "2026-11-10T10:00:00+00:00"}))
    R.presented_path(video, "g2").write_text(json.dumps({"draft_sha256": "a" * 64, "at": "2026-11-10T10:12:00+00:00"}))
    (video / "checkpoint_story_script.json").write_text(
        json.dumps({"status": "awaiting_human", "timestamp": "2026-11-10T11:00:00+00:00"}))
    db = Ledger(tmp_path / "l.sqlite")
    cid = db.reserve(channel="say-suppose", video=video.name, gate="g2", round=1, seat="story editor", model="m",
                     family="openai", prompt_sha256="p", daily_cap=99, script_cap=99)
    db.finish(cid, status="ok", output_sha256="o", duration_s=60)
    rows = {r["gate"]: r for r in T.gate_times(video, db, "say-suppose")}
    g2 = rows["g2"]
    assert g2["minutes_to_owner"] == 12 and g2["room_rounds"] == 1 and g2["owner_rounds"] == 1
    assert g2["calls"] == 1 and g2["checkpoint"] == "awaiting_human 2026-11-10T11:00:00+00:00"
    assert rows["g1"]["room_rounds"] == 0
    assert "| g2 |" in T.render_times(list(rows.values()))


def test_the_scorecard_flags_a_seat_under_one_in_three_over_three_films(tmp_path):
    channel = tmp_path / "say-suppose"
    for i in range(3):
        v = channel / "videos" / f"2026-11-1{i}_v"
        v.mkdir(parents=True)
        (v / "review-g2-marks.yaml").write_text(
            "- {seat: director, line: 3, mark: agreed}\n"
            "- {seat: first-time viewer, line: 4, mark: disagreed}\n"
            "- {seat: first-time viewer, line: 9, mark: unsure}\n")
    rows = {r["seat"]: r for r in T.scorecard(channel)}
    assert rows["director"]["share"] == 1.0 and rows["director"]["flag"] == ""
    assert rows["first-time viewer"]["films"] == 3 and rows["first-time viewer"]["flag"].startswith("under one in three")
    assert "first-time viewer" in T.render_scorecard(list(rows.values()))


def test_a_malformed_marks_file_is_skipped_not_a_crash(tmp_path):
    v = tmp_path / "say-suppose" / "videos" / "2026-11-10_v"
    v.mkdir(parents=True)
    (v / "review-g2-marks.yaml").write_text("not: [a list\n")
    assert T.scorecard(tmp_path / "say-suppose") == []
```

- [ ] **Step 2: Run** → FAIL (no module `times`).

- [ ] **Step 3: Implement.** `ledger.py`:

```python
    def rows(self, *, channel: Optional[str] = None, video: Optional[str] = None, gate: Optional[str] = None) -> list[CallRow]:
        where = [(c, v) for c, v in (("channel", channel), ("video", video), ("gate", gate)) if v is not None]
        sql = "SELECT * FROM calls" + (" WHERE " + " AND ".join(f"{c} = ?" for c, _ in where) if where else "")
        with closing(self._connect()) as db:
            return [CallRow(**dict(r)) for r in db.execute(sql + " ORDER BY at", [v for _, v in where])]
```

`core/studio/room/times.py`:

```python
"""Gate times and the seat scorecard (pipeline v2, optimisation 6 and section 4 limit 10). Read-only."""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional

import yaml

from studio.room import report as R
from studio.room.ledger import Ledger

CHECKPOINTS = {"g1": "checkpoint_proposal.json", "g2": "checkpoint_story_script.json"}
MARKS = ("agreed", "unsure", "disagreed")


def _when(text: Any) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(str(text))
    except ValueError:
        return None


def _checkpoint(video: Path, gate: str) -> str:
    try:
        data = json.loads((video / CHECKPOINTS[gate]).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return "-"
    return f"{data.get('status', '?')} {data.get('timestamp', '?')}" if isinstance(data, dict) else "-"


def _gate(video: Path, gate: str, ledger: Ledger, channel: str) -> dict[str, Any]:
    rounds = R.load_rounds(video, gate)
    first = next((r for r in rounds if r["round"] == 1), None)
    linted = None
    if first is not None:
        try:
            linted = R.read_meta(video, gate, 1).get("linted_at")
        except (OSError, ValueError):
            linted = None
    presented = (R.read_presented(video, gate) or {}).get("at")
    a, b = _when(linted), _when(presented)
    calls = ledger.rows(channel=channel, video=video.name, gate=gate)
    done = [_when(c.at) + timedelta(seconds=c.duration_s or 0) for c in calls if _when(c.at)]
    return {
        "gate": gate,
        "linted_at": linted or "-",
        "presented_at": presented or "-",
        "minutes_to_owner": round((b - a).total_seconds() / 60) if a and b else None,
        "first_call": calls[0].at if calls else "-",
        "last_call_done": max(done).isoformat(timespec="seconds") if done else "-",
        "room_rounds": sum(1 for r in rounds if not r.get("owner_notes")),
        "owner_rounds": sum(1 for r in rounds if r.get("owner_notes")),
        "calls": len(calls),
        "checkpoint": _checkpoint(video, gate),
    }


def gate_times(video_dir: Path, ledger: Ledger, channel: str) -> list[dict[str, Any]]:
    return [_gate(Path(video_dir), gate, ledger, channel) for gate in CHECKPOINTS]


COLUMNS = ("gate", "linted_at", "presented_at", "minutes_to_owner", "first_call", "last_call_done", "room_rounds",
           "owner_rounds", "calls", "checkpoint")


def render_times(rows: list[dict[str, Any]]) -> str:
    head = "| " + " | ".join(COLUMNS) + " |\n|" + "---|" * len(COLUMNS)
    body = ["| " + " | ".join("-" if r[c] is None else str(r[c]) for c in COLUMNS) + " |" for r in rows]
    return "\n".join([head, *body]) + "\n"


def _marks(path: Path) -> list[dict[str, Any]]:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError, UnicodeDecodeError):
        return []
    if not isinstance(data, list):
        return []
    return [m for m in data if isinstance(m, dict) and isinstance(m.get("seat"), str) and m.get("mark") in MARKS]


def scorecard(channel_dir: Path) -> list[dict[str, Any]]:
    seats: dict[str, dict[str, Any]] = {}
    for path in sorted(Path(channel_dir).glob("videos/*/review-g*-marks.yaml")):
        for m in _marks(path):
            row = seats.setdefault(m["seat"], {"seat": m["seat"], "films": set(), **{k: 0 for k in MARKS}})
            row["films"].add(path.parent.name)
            row[m["mark"]] += 1
    out = []
    for row in seats.values():
        total = sum(row[k] for k in MARKS)
        share = row["agreed"] / total if total else 0.0
        films = len(row["films"])
        flag = "under one in three agreed over three films: the seat leaves" if films >= 3 and share < 1 / 3 else ""
        out.append({**row, "films": films, "share": round(share, 2), "flag": flag})
    return sorted(out, key=lambda r: r["seat"])


def render_scorecard(rows: list[dict[str, Any]]) -> str:
    lines = ["| seat | films | agreed | unsure | disagreed | agreed share | flag |", "|---|---|---|---|---|---|---|"]
    lines += [f"| {r['seat']} | {r['films']} | {r['agreed']} | {r['unsure']} | {r['disagreed']} | {r['share']} | "
              f"{r['flag'] or '-'} |" for r in rows]
    return "\n".join(lines) + "\n"
```

`__main__.py`: `cmd_times` (`load_room`, `_video_in`, `print(times.render_times(times.gate_times(video, Ledger(),
_channel(args))))`) and `cmd_scorecard` (`print(times.render_scorecard(times.scorecard(cfg.channel_dir)))`); parsers
`times` (positional `video_dir`, `--channel`, `--config`) and `scorecard` (`--config`).

- [ ] **Step 4: Run** `$PY -m pytest core/studio/tests/test_room_times.py core/studio/tests/test_room_ledger.py -q` → PASS.

- [ ] **Step 5: Commit** `feat(room): gate times and the seat scorecard`.

---

### Task 6: The meaning layer in the story lint (`> UNDER:`, `> DARLING:`)

**Files:**
- Modify: `core/engines/whatif/pipeline/story_lint.py`
- Test: `core/studio/tests/test_whatif_story_under.py`

**Interfaces:**
- Produces: `problems(text, require_under=False) -> list[str]`; CLI
  `story_lint.py <script.md> [--under-from YYYY-MM-DD]` (requires `> UNDER:` when the script's folder name starts with
  a date on or after the given one).
- Rules: `> UNDER:` once, before the first beat, non-empty, ends with `?`. `> DARLING:` at most three, each must be a
  spoken line of the script (whitespace and case ignored).

- [ ] **Step 1: Failing tests** in `core/studio/tests/test_whatif_story_under.py`:

```python
"""The meaning layer (pipeline v2, section 1): one > UNDER: question, never spoken; up to three > DARLING: lines."""

from __future__ import annotations

import importlib.util
import subprocess
import sys
from pathlib import Path

REAL_ROOT = Path(__file__).resolve().parents[3]
LINTER = REAL_ROOT / "core/engines/whatif/pipeline/story_lint.py"
spec = importlib.util.spec_from_file_location("whatif_story_lint_under", LINTER)
lint = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lint)

FIVE = "".join(f"> {n}: x.\n" for n in lint.FIVE)
BODY = "## [00:00] Hook\nMumma calls. You let it ring.\nThe chai goes cold.\n"


def test_under_is_optional_unless_required():
    assert lint.problems(FIVE + BODY) == []
    assert any("UNDER" in p for p in lint.problems(FIVE + BODY, require_under=True))


def test_a_good_under_line_passes():
    assert lint.problems(FIVE + "> UNDER: Would you still forgive if you couldn't forget?\n" + BODY, True) == []


def test_under_must_be_a_question_given_once_before_the_first_beat():
    assert any("question" in p for p in lint.problems(FIVE + "> UNDER: Forgiveness matters.\n" + BODY, True))
    twice = FIVE + "> UNDER: A?\n> UNDER: B?\n" + BODY
    assert any("once" in p for p in lint.problems(twice, True))
    late = FIVE + BODY + "> UNDER: A?\n"
    assert any("before the first beat" in p for p in lint.problems(late, True))


def test_darlings_are_spoken_lines_and_at_most_three():
    good = FIVE + "> DARLING: Mumma calls. You let it ring.\n" + BODY
    assert lint.problems(good) == []
    assert any("DARLING" in p for p in lint.problems(FIVE + "> DARLING: Not in the script.\n" + BODY))
    four = FIVE + "> DARLING: The chai goes cold.\n" * 4 + BODY
    assert any("at most three" in p for p in lint.problems(four))


def test_under_from_requires_it_only_for_new_videos(tmp_path):
    for name, code in (("2026-11-09_old", 0), ("2026-11-10_new", 1)):
        video = tmp_path / name
        video.mkdir()
        (video / "script.md").write_text(FIVE + BODY)
        run = subprocess.run([sys.executable, str(LINTER), str(video / "script.md"), "--under-from", "2026-11-10"],
                             capture_output=True, text=True)
        assert run.returncode == code, run.stdout
```

- [ ] **Step 2: Run** → FAIL (`problems() takes 1 positional argument`).

- [ ] **Step 3: Implement** in `story_lint.py` (update the docstring: two more checks):

```python
UNDER_LINE = re.compile(r"^>\s*UNDER\s*:(.*)$")
DARLING_LINE = re.compile(r"^>\s*DARLING\s*:(.*)$")
MAX_DARLINGS = 3


def _spoken(text: str) -> set[str]:
    return {" ".join(ln.split()).casefold() for ln in text.splitlines() if ln.strip() and ln.strip()[0] not in ">#"}


def meaning_problems(text: str, require_under: bool) -> list[str]:
    unders: list[tuple[str, bool]] = []
    darlings: list[str] = []
    before = True
    for raw in text.splitlines():
        line = raw.strip()
        if BEAT.match(line):
            before = False
        if m := UNDER_LINE.match(line):
            unders.append((m.group(1).strip(), before))
        if m := DARLING_LINE.match(line):
            darlings.append(m.group(1).strip().strip("\"'"))
    out: list[str] = []
    if require_under and not unders:
        out.append("the meaning layer: missing > UNDER: (the question under the question) before the first beat")
    if len(unders) > 1:
        out.append(f"the meaning layer: > UNDER: is given {len(unders)} times; give it once")
    for body, early in unders:
        if not early:
            out.append("the meaning layer: > UNDER: must come before the first beat, with the five lines")
        if not body.endswith("?"):
            out.append("the meaning layer: > UNDER: is a question the film never answers aloud; end it with ?")
    if len(darlings) > MAX_DARLINGS:
        out.append(f"darlings: {len(darlings)} > DARLING: lines; name at most three")
    spoken = _spoken(text)
    out += [f'darlings: "{d}" is not a spoken line of the script' for d in darlings if " ".join(d.split()).casefold() not in spoken]
    return out
```

`problems(text, require_under=False)` returns `out + meaning_problems(text, require_under)`. `main` accepts
`[--under-from DATE]` and sets `require_under = path.parent.name[:10] >= DATE` when the folder name starts with a date
(`re.match(r"\d{4}-\d{2}-\d{2}", ...)`); a bad date argument exits 2.

- [ ] **Step 4: Run** `$PY -m pytest core/studio/tests/test_whatif_story_under.py core/studio/tests/test_whatif_story_lint.py -q` → PASS.
Then lint the five batch-1 scripts with `--under-from 2026-11-10`; each must give the same result as without the flag.

- [ ] **Step 5: Commit** `feat(whatif): story lint checks the under-question and the darlings`.

---

### Task 7: Say Suppose's room, rules and idea room

**Files:**
- Modify: `channels/say-suppose/room.yaml` (`rounds: 1`, `limits`, `viewer_required: false`, `owner_first: true`,
  linter `--under-from 2026-11-10`, comment block)
- Modify: `channels/say-suppose/rules/story.md` (the under-question; the shelf of three hooks for two films)
- Modify: `channels/say-suppose/cast.md` (`> UNDER:` and `> DARLING:` direction lines)
- Modify: `channels/say-suppose/room/seats/director.md`, `story-editor.md`, `first-time-viewer.md` (the under-question
  as a lens; the protected spine; the viewer's lateness rule)
- Modify: `channels/say-suppose/rules/ideas.md` (append: pitch card fields and the dreamer)
- Modify: `channels/say-suppose/room/README.md` (a "Pipeline v2" paragraph)
- Modify: `channels/say-suppose/taste.md` (dated owner note: pipeline v2 adopted, "Looks fine")
- Test: `core/studio/tests/test_room_config.py` (a new test: the Say Suppose room is valid and opts in)

- [ ] **Step 1: Failing test** (append to `core/studio/tests/test_room_config.py`, which is not in the size baseline):

```python
SS = REAL_ROOT / "channels" / "say-suppose"


def test_the_say_suppose_room_is_valid_and_takes_pipeline_v2():
    cfg = C.load_room(SS / "room.yaml")
    assert C.validate(cfg) == []
    assert cfg.rounds == 1 and cfg.owner_first and not cfg.viewer_required
    assert cfg.limits == {"blockers": 3, "suggestions": 3, "keep": 3}
    assert any("--under-from 2026-11-10" in linter for linter in cfg.linters)
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Edit the files.** `room.yaml` gets the four keys and the linter flag, plus a comment paragraph citing
the spec (owner, 2026-11-10). `rules/story.md` gets two sections: "**The under-question (lint).**" (one `> UNDER:`
question after the five lines, approved at G1, never answered aloud; asked at most once, at the dilemma; the plot makes
it harder; the last image answers without words; no philosopher on screen without a claims row) and "**The shelf
(suggestions for two films, owner 2026-11-10).**" (the loophole beat every 60-90 s; the dilemma at 75-80% that a cold
reader can argue either way; the residue as a thing in Riya's week; a seat may suggest these, never block on them).
`cast.md` lists `> UNDER:` and `> DARLING:` (not spoken; at most three darlings, each a spoken line the writer defends).
Seat briefs: the director and story editor read `> UNDER:` as a lens and may suggest, never rewrite it; every brief
says the protected spine changes only by owner note or fact blocker and that a seat names at most three blockers.
`ideas.md` appends "## Pitch cards (2026-11-10)" (every card carries the under-question, its thought experiment and the
kind: mirror, power or frame-break) and "## The dreamer (2026-11-10)" (Claude Fable 5.1 pitches from craft alone, with no
web, beside whichever researchers the seats table names; its pitches get demand evidence like the rest).

- [ ] **Step 4: Run** `$PY -m pytest core/studio/tests/test_room_config.py core/studio/tests/test_channels.py core/studio/tests/test_channel_playbooks.py -q` and
`$PY -m studio.cli check say-suppose` → PASS.

- [ ] **Step 5: Commit** `feat(say-suppose): pipeline v2 room settings, the under-question and the dreamer`.

---

### Task 8: The room skill and the what-if stage skills

**Files:**
- Modify: `core/openmontage/skills/studio/studio-room.md`
- Modify: `core/openmontage/skills/studio/studio-whatif-{proposal,script,narration,rough-cut,final-watch,publish}.md`
- Modify: `core/studio/tests/test_room_skill.py` (new needles)

- [ ] **Step 1: Failing test**: add to `test_room_skill.py`:

```python
def test_the_skill_names_the_pipeline_v2_steps():
    text = SKILL.read_text()
    for needle in ("python -m studio.room present", "python -m studio.room times", "python -m studio.room scorecard",
                   "author's cut", "review-$G-marks.yaml", "viewer_required", "never a third"):
        assert needle in text, needle


def test_the_whatif_skills_carry_the_audition_and_the_look_test():
    skills = SKILL.parent
    assert "audition" in (skills / "studio-whatif-narration.md").read_text()
    assert "look test" in (skills / "studio-whatif-rough-cut.md").read_text()
    assert "> UNDER:" in (skills / "studio-whatif-proposal.md").read_text()
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Edit the skills.**
  - `studio-room.md`: a new "Order" section at the top (lint, then present to the owner, then seats; the room runs
    beside the owner's read). "Each round" becomes "Round 1": present step; seats in parallel; with
    `viewer_required: false` the viewer runs in the background, the session waits at most 5 minutes after the other
    seats, and a late viewer's notes join the owner-notes round as suggestions; caps (three blockers, three
    suggestions, three keep lines; the diagnosis binds, the fix is a proposal). Stop rule: one room round (`rounds: 1`),
    never a third; a disagreement the writer will not take goes to the owner as one line. Merge: the protected spine
    (five lines, `> UNDER:`, the dilemma line, the planted line and its return, the stranger's moment, keep lines,
    up to three `> DARLING:` lines, the spoken style) changes only by an owner note or a fact blocker. Finish: present
    the author's cut beside the shipped draft with the report's "What review cost the voice" and the writer's three-line
    blandness report; write the owner's blocker marks to `$V/review-$G-marks.yaml`; run `times` and `scorecard`. Silence:
    no seat speaks on thumbnail choice, colour, music level or the look-test pick. Owner-notes rounds run the required
    seats only (story and fact when `viewer_required: false`).
  - `studio-whatif-proposal.md`: the five lines plus `> UNDER:` in `packaging.md`; three title-thumbnail pairs
    rendered in the channel's code look (`brand/thumbs/`), never described; the owner picks one pair and approves the
    five lines and the under-question with it.
  - `studio-whatif-script.md`: Fable keeps the pen; the `> UNDER:` line from G1; up to three `> DARLING:` lines; the
    shelf hooks as craft aims; after lint and qc the draft goes to the owner at once (`present`); ask for the narration
    quote in the same sitting as G2.
  - `studio-whatif-narration.md`: the audition (opening ten lines and the dilemma line first; the owner hears them;
    then the full batch); the quote was approved at G2.
  - `studio-whatif-rough-cut.md`: the look test before the full build (the premise's key shot in 2-3 ways as stills
    or 5-second clips; the owner picks); the owner watches a 720p cut; ask for the music quote in the same sitting.
  - `studio-whatif-final-watch.md`: one line per cold viewer into `taste.md`, dated.
  - `studio-whatif-publish.md`: write `publish.md` and `upload.yaml` during the G6 render; the pinned comment is the
    dilemma, asked as a question.

- [ ] **Step 4: Run** `$PY -m pytest core/studio/tests/test_room_skill.py core/studio/tests/test_studio_whatif.py -q` → PASS.

- [ ] **Step 5: Commit** `docs(skills): pipeline v2 in the room skill and the what-if stage skills`.

---

### Task 9: Verify end to end

- [ ] **Step 1:** `make lint` (ruff, format check, size budgets) → clean.
- [ ] **Step 2:** `make test PYTHON=$HOME/Exploration/projects/omni-studio/.venv/bin/python` in the background → all suites pass.
- [ ] **Step 3:** Drive the real tools read-only on the real channel:
  `$PY -m studio.room times channels/say-suppose/videos/2026-11-09_what-if-you-knew-the-last-time-you-d-see-someone --config channels/say-suppose/room.yaml`
  (prints a table; old rounds have no `linted_at`, shown as `-`) and `$PY -m studio.room scorecard --config channels/say-suppose/room.yaml`
  (no marks yet: header only). Run `story_lint.py --under-from 2026-11-10` on every batch-1 script (exempt by date).
- [ ] **Step 4:** Copy one batch-1 video's `script.md` into a scratch channel under the session scratchpad with the new
  `room.yaml`, then run `lint` → `seat` (refused: owner first) → `present` → `report`, to see the messages a session
  will see. No seat calls a model.
- [ ] **Step 5:** `/simplify` on the diff; update the spec's header line to link this plan; push; update PR #28's title and body.
