# Room owner-note budget and G1 fact scope: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `docs/superpowers/specs/2026-11-12-room-owner-note-budget-design.md`: G1 fact nits become suggestions,
and every owner note registered at a gate adds two rounds of required seats to that gate's call cap.

**Architecture:** A new module `core/studio/room/owner_notes.py` holds the whole rule: it reads `taste.md`'s bold quotes,
the notes already registered in a gate's round metas, checks new ones, and computes `gate_cap`. `__main__.py` calls it
from `cmd_lint` (register), `_ctx` (the ledger's `script_cap`) and `cmd_report` (the report's `cap`, which the evidence
check reads). The ledger itself is unchanged: it already refuses a call past `script_cap`. The G1 scope is a brief edit.

**Tech stack:** Python 3, argparse, pytest (`core/studio/tests`), ruff.

## Global constraints

- `OWNER_NOTE_ROUNDS = 2`; `gate_cap = derived_cap(cfg) + OWNER_NOTE_ROUNDS * required seats * registered notes`.
- A note matches when its words, whitespace-collapsed, equal the text inside one `**"..."**` in the channel's `taste.md`.
- `--owner-note` only with `--owner-notes`; repeatable; one note once per video and gate.
- Modules under 500 lines, functions under 60, ruff complexity 12; tests under 2 s.

---

### Task 1: `owner_notes.py` and the lint flag

**Files:**
- Create: `core/studio/room/owner_notes.py`
- Modify: `core/studio/room/report.py` (`write_meta` takes `owner_note: list[str]`)
- Modify: `core/studio/room/__main__.py` (`--owner-note`, `cmd_lint`, `_ctx`, `cmd_report`)
- Test: `core/studio/tests/test_room_owner_notes.py`

**Interfaces:**
- Produces: `taste_quotes(channel_dir: Path) -> list[str]`, `registered(video_dir: Path, gate: str) -> list[str]`,
  `problems(words: list[str], channel_dir: Path, video_dir: Path, gate: str) -> list[str]`,
  `gate_cap(cfg: RoomConfig, video_dir: Path, gate: str) -> int`.

- [ ] **Step 1: Write the failing tests** (`test_room_owner_notes.py`): `gate_cap` equals `derived_cap` with no notes and
  adds `2 x required seats` per registered note; lint refuses `--owner-note` without `--owner-notes`, unknown words, and a
  note registered at an earlier round of the same gate, and accepts it at another gate; the round meta records it; a seat
  call past the raised cap is refused and one under it runs; the report's `cap` is the raised cap.
- [ ] **Step 2: Run them:** `PYTHONPATH=core .venv/bin/python -m pytest core/studio/tests/test_room_owner_notes.py -q`.
  Expected: fail on `ModuleNotFoundError: studio.room.owner_notes`.
- [ ] **Step 3: Implement** `owner_notes.py`, the `write_meta` field, the flag and the three call sites.
- [ ] **Step 4: Run** the new tests and `test_room_cli.py test_room_config.py test_room_viewer_optional.py
  test_room_report.py test_room_evidence.py`. Expected: pass.
- [ ] **Step 5: Commit** `feat(room): an owner note registered at a gate adds two rounds to its cap`.

### Task 2: G1 claims-check scope

**Files:**
- Modify: `channels/say-suppose/room/seats/fact-checker.md` (the G1 paragraph)
- Modify: `channels/say-suppose/room.yaml` (comment), `core/openmontage/skills/studio/studio-room.md` if it documents
  owner-notes rounds (an existing `studio` file, no PATCHES entry)

- [ ] **Step 1:** Replace the brief's last paragraph with the G1 scope: blockers only for a stated fact with no row, a
  line contradicting its row, or a straw-man/unbroken wrong belief; precision, rounding, scope wording, missing `(cNN)`
  and arithmetic slips are G1 suggestions with a corrected line; never fill the blocker limit.
- [ ] **Step 2:** Document `--owner-note` where the skill describes owner-notes rounds.
- [ ] **Step 3:** `.venv/bin/omni check say-suppose`; `make lint`. Expected: pass.
- [ ] **Step 4: Commit** `docs(say-suppose): at G1 the claims check blocks only on what G2 cannot fix`.
