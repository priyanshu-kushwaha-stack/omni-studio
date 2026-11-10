# Say Suppose G4/G5 speed-ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut the render time inside G4 and G5 (video 1: about 22 h across the two gates; six full 1080p renders
and three audio-only passes) by watching 720p previews, making a sound note cost a fast audio pass, and
re-rendering only the beats that changed, while G6 still watches one full 1080p render.

**Architecture:** Optimisation 5 of `docs/superpowers/specs/2026-11-10-say-suppose-pipeline-v2-design.md`, section 5
(the preview ladder and beat caching first described in `2026-11-09-say-suppose-next-phase-design.md`, section 2a).
Four layers, each usable without the next: (1) the what-if tools record their run time per variant and take the render
queue themselves, so `python -m studio.jobs report --video <id>` shows the hours; (2) `whatif_render` gets
`quality: preview | final` (1280x720 for G4/G5, 1920x1080 only for G6); (3) it gets `mode: picture | audio`, and a new
`whatif_mux` puts a fresh audio pass on the last picture pass, so the mix never leaves Remotion (the effects live
inside the beats) but a sound note costs an audio-only render, not a picture render, and a kit `SoundOnly` context
lets that audio pass skip all drawing (Task 4b); (4) a new `whatif_beats` renders
each beat of a video to a cached file keyed by a hash of what it reads, and stitches them with ffmpeg.

**Tech Stack:** Remotion 4.0.484 CLI (`render --scale --muted --codec=wav --frames`, `bundle`), ffmpeg
(concat demuxer, `-c:v copy`, `alimiter`), Python 3.12 OpenMontage tools, `core/studio/jobs` (timing and queues),
pytest.

## Global Constraints

- Seven owner-only gates. Agents write `awaiting_human` and stop; never run `omni approve` or touch the approval key.
- G6 watches exactly one full 1920x1080 render made by `whatif_render quality=final mode=full` (one Remotion render
  with its own audio, then the limiter). It is never stitched from cached beats and never muxed. Its media proof
  covers that exact file (`lib/studio_approval.py`, approval.media), unchanged by this plan.
- One render at a time on the Mac: every preview or full render (Remotion, ffmpeg film assembly) holds the `render`
  queue (`studio.jobs`). `whatif_render` and `whatif_beats` take it themselves after Task 2.
- No paid provider call anywhere in this plan. Renders are local and free.
- Inside `core/openmontage/` add only files with `studio` in the name; any other upstream edit is listed in
  `core/PATCHES.md`. This plan edits only `studio`-named files there (`tools/studio/studio_whatif_tools.py`,
  `pipeline_defs/studio-whatif.yaml`, `skills/studio/studio-whatif-*.md`) and adds
  `tools/studio/studio_whatif_cache.py`, so `core/PATCHES.md` does not change.
- Code health: ruff (complexity 12), modules under 500 lines, functions under 60, tests under 2 s unless
  `@pytest.mark.slow`. `studio_whatif_tools.py` is 238 lines today; with Tasks 2-6 it stays under 500 because the cache
  logic lives in `studio_whatif_cache.py`.
- Film sessions do not change studio or engine code; this plan is a studio session. Rendered media and caches stay
  in the git-ignored `renders/` folder.
- Worktrees have no `.venv`: run Python with the main checkout's interpreter and an absolute `PYTHONPATH`
  (`/Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv/bin/python`, `PYTHONPATH=$PWD/core` for
  `studio.*`, and `cd core/openmontage && PYTHONPATH="$PWD:$PWD/.."` for the tools).

---

## Where video 1's G4/G5 time went

Video 1 is `channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day` (9,433 frames, 5:14 at 30 fps).
Its renders are still in its git-ignored `renders/` folder; the table reads their file times and the commits between
them. No render time was recorded: the what-if tools have no `@record_tool` (only the PoU tools do), so
`python -m studio.jobs report` has no render rows today. Task 1 fixes that.

| # | Render (finished) | Gate | What changed since the last render | Kind | Sound only? | One beat only? |
|---|---|---|---|---|---|---|
| 1 | `rough-cut` (11-07 15:12) | G4 | First build | 1080p picture and audio | n/a | n/a |
| 2 | `rough-cut-v7` (11-07 17:52) | G4 | Script v7 and 1.1x narration: every timing moved | 1080p | no | no |
| 3 | `rough-cut-v8` (11-07 21:07) | G4 | Colour fix in the kit, the brand title card and subscribe nudges in `Film.tsx` | 1080p | no | no |
| 4 | `edit-v1` (11-08 09:00) | G5 | The score, plus sources off screen | 1080p | no | no |
| 5 | `edit-v2` (11-08 12:04) | G5 | Sparse score 26 dB under the voice, light music, quieter ticks and pop | 1080p | yes | n/a |
| 6 | `edit-v3` (11-08 12:44) | G5 | The film plays the cleaned narration track; softer pop | audio pass, remuxed on v2 | yes | n/a |
| 7 | `edit-v4` (11-08 13:12) | G5 | The Opening's flips and pops under the lighter mix | audio pass, remuxed on v2 | yes | n/a |
| 8 | `edit-v5` (11-08 13:37) | G5 | The same mix, checks re-run for the owner | audio pass, remuxed on v2 | yes | n/a |
| 9 | `edit-v6` (11-08 17:40) | G5, then G6 | The film speaks at 0.6 s instead of 2.4 s: every timing moved | 1080p | no | no |

So the "at least 9 full renders" is six full 1080p renders and three audio passes: `edit-v3`, `-v4` and `-v5` carry
`edit-v2`'s video stream byte for byte (`ffmpeg -i <file> -map 0:v -c copy -f md5 -` gives the same hash for all four)
with a different audio stream each. The session already made audio-only renders by hand and remuxed them; this plan
makes that a checked tool and makes the audio pass itself fast. Every 720p file in that folder (`*-preview.mp4`) was
made by scaling the 1080p render down afterwards, so it saved no render time. One of the six full renders (`edit-v2`)
changed only sound. None of the nine changed only one beat: each moved shared timing (a new script, a new opening gap)
or shared code (the kit's colour, `Film.tsx`).

**Render time, measured on 2026-11-10** (this plan's benchmark: video 1 at main 4c6133f, a 300-frame slice from
frame 4000, one bundle, under the render queue, M1 Max, 10 cores, with other sessions loading the Mac):

| Step (`studio.jobs` step name) | Seconds | Per frame | Note |
|---|---|---|---|
| `bench-bundle`: `remotion bundle` once | 5.6 | | Bundling is not the cost |
| `bench-slice300-1080p`: 300 frames, 1920x1080, muted | 307.9 | 1.03 s | Load average about 30 |
| `bench-slice300-1080p-again`: the same, later | 305.4 | 1.02 s | Load average 6-22: the same time |
| `bench-slice300-720p`: 300 frames, `--scale=0.6666666666666666` | 133.7 | 0.45 s | 2.3x faster than 1080p (2.25x fewer pixels) |
| `bench-slice300-720p-veryfast`: the same with `--x264-preset=veryfast` | 133.6 | 0.45 s | No gain: drawing frames is the cost, not encoding |
| `bench-audio-only-full`: the whole film, `--codec=wav` | 1,301.1 | 0.14 s | Still mounts every frame's React tree |
| `bench-mux`: 720p picture + wav, `-c:v copy`, limiter | 0.4 | | Free |

Two findings changed the plan. `--scale=0.6667` fails ("height ... must be an integer, but is 720.036"); the scale
must be `0.6666666666666666`, which gives exactly 1280x720 in doubles (Task 3 tests it). And the x264 preset saves
nothing, so the plan sets none. The slice is one stretch of the film (DayTwelve), so the per-frame times are used for
ratios; the absolute film times below take the 60-70 min that video 1's 1080p renders took in its own session
(next-phase spec, finding 1), which the slice's 1.02 s a frame would put at 2.7 h for this stretch's density. Task 3
step 5 and the first film's `studio.jobs` rows replace these with whole-film numbers.

## Expected hours saved per video, and how to measure them

The estimates replay video 1's six full renders and three audio passes (above) with each change, using full-film
times: 65 min for a 1080p render (as video 1's session saw), 28 min for a 720p preview (the measured 2.3x), 22 min
for today's audio pass (measured) and 5 min for the sound composition's audio pass (Task 4b's target, not yet
measured). They count render wall time on the critical path between an owner note and the next watch, not agent
build time or owner waits, which are most of the 22 h.

| Change | Video 1 replay: render wall saved | Per round after the change | Formula | Read it from `studio.jobs report --video <id> --step whatif_` |
|---|---|---|---|---|
| Task 1, timing and the queue | 0 h directly | n/a | Makes every row below measurable; the queue stops renders failing under load (video 1 lost renders to a frame timeout and a killed session) | Every what-if render has a row |
| Task 3, 720p for G4 and G5, one 1080p at G6 | **2.6 h** | A picture round: 65 -> 28 min | 6 full renders x 65 min (390) -> 6 previews x 28 + one G6 render x 65 (233) | `whatif_render.full-1080p` runs = 1; `*-720p` median about 0.44x the 1080p median |
| Task 4 + 4b, the audio pass and the mux | **1.2 h** (0.1 h without 4b) | A sound round: 22 min (audio pass) or 28 min (720p render) -> 5 min | edit-v2's picture render becomes an audio pass (28 -> 5) and the three hand-made audio passes get fast (3 x 22 -> 3 x 5) | `whatif_render.audio` median at or under 300 s; `whatif_mux` rows with no picture row between them |
| Tasks 5-6, beat caching | **0 h** on video 1 (no round changed one beat) | A beat-local round: 28 -> about 5 min (a beat is 7-23% of the film, 17% on average) | Each beat-local round saves 28 x (1 - beat share), about 23 min | `whatif_beats.720p` total against runs x the `whatif_render.picture-720p` median; the result's `rendered` list |
| **All together** | **3.8 h of 7.6 h** of render wall (the rest of the 22 h is building, owner waits and the night) | | 7.6 h = 6 x 65 min + 3 x 22 min -> 3.8 h = 5 previews x 28 + 65 + 4 audio passes x 5 | `total` line: about 3.8 h for a film shaped like video 1 |

The hours from a G4 note to the next watch fall by the same per-round amounts: 65 min of render becomes 28 for a
picture note, 5 for a sound note, and about 5 for a one-beat note once the cache is built.

**How to measure, per video.** After Task 1 every what-if render records one row per run, named by variant:
`whatif_render.full-1080p`, `whatif_render.full-720p`, `whatif_render.picture-720p`, `whatif_render.audio`,
`whatif_mux`, `whatif_beats.720p`. For a video:

    cd core && /Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv/bin/python -m studio.jobs report \
        --video <YYYY-MM-DD_slug> --step whatif_

prints runs, failures, total, median and max seconds per variant and a total line in hours. The baseline is video 1:
six 1080p renders and three audio passes, 7.6 h of render wall. The saving for film 1 of batch 1 is that baseline minus
its `total` line, and the per-change share is read from the rows: the 1080p rows should be exactly one
(`whatif_render.full-1080p`, runs 1, the G6 render), the sound rounds show as `whatif_render.audio` plus `whatif_mux`
rows with no picture row between them, and `whatif_beats.720p` totals against `runs x` the full 720p median show what
the cache saved. The hours from a G4 note to the next watch are the gaps between `history/checkpoint_rough_cut_*.json`
(and `final_edit`) timestamps in the video folder, which already exist.

---

## File structure

| File | Change | Responsibility |
|---|---|---|
| `core/studio/jobs/timing.py` | Modify | `record_tool` names a run by the tool's `timing_step(inputs)` when it has one |
| `core/studio/jobs/__main__.py` | Modify | `report --video --channel --step` and a total line; `run --queue` tells the child it holds the queue (`OMNI_JOBS_QUEUE_HELD`) |
| `core/openmontage/tools/studio/studio_whatif_tools.py` | Modify | Timed tools, the render queue, `quality`, `mode`, `whatif_mux`, `whatif_beats` |
| `core/openmontage/tools/studio/studio_whatif_cache.py` | Create | Pure functions: file manifests and digests, render sidecars, `beats.json`, segments, beat cache keys |
| `core/openmontage/pipeline_defs/studio-whatif.yaml` | Modify | G4 success criterion says 720p; the new tools on rough_cut, final_edit; `whatif_render` on final_watch |
| `core/openmontage/skills/studio/studio-whatif-rough-cut.md` | Modify | The preview ladder at G4; `scenes/beats.json` |
| `core/openmontage/skills/studio/studio-whatif-edit.md` | Modify | A sound note is an audio pass and a mux |
| `core/openmontage/skills/studio/studio-whatif-final-watch.md` | Modify | The one 1080p render, made here |
| `core/engines/whatif/src/kit/sound.ts` | Create | `SoundOnly` context: the kit draws nothing inside a sound composition |
| `core/engines/whatif/src/kit/stage/Stage.tsx`, `rig/Figure.tsx`, `stage/PauseBars.tsx`, `stage/Look.tsx` | Modify | Return `null` under `SoundOnly` |
| `core/engines/whatif/tests/sound.test.ts` | Create | Test for Task 4b |
| `core/studio/tests/test_jobs_timing.py`, `test_jobs_cli.py` | Modify | Tests for Task 1 |
| `core/studio/tests/test_whatif_tools.py` | Modify | Tests for Tasks 2-4 and 6 |
| `core/studio/tests/test_whatif_cache.py` | Create | Tests for Task 5 |

---

### Task 1: Timing variants, report filters, and the held-queue signal

**Files:**
- Modify: `core/studio/jobs/timing.py` (`record_tool`, lines 105-127)
- Modify: `core/studio/jobs/__main__.py` (`_run`, `cmd_run`, `cmd_report`, `main`)
- Test: `core/studio/tests/test_jobs_timing.py`, `core/studio/tests/test_jobs_cli.py`

**Interfaces:**
- Produces: a tool may define `timing_step(self, inputs: dict) -> str`; `record_tool` records that name (falls back
  to `tool.name` when it is missing, raises or returns ""). `python -m studio.jobs report [--since] [--video ID]
  [--channel SLUG] [--step PREFIX]`. While `python -m studio.jobs run --queue NAME` runs its command, the child's
  environment has `OMNI_JOBS_QUEUE_HELD` set to a comma list that contains `NAME`.

- [ ] **Step 1: Write the failing tests**

Append to `core/studio/tests/test_jobs_timing.py`:

```python
class _Result:
    success = True


def test_record_tool_names_the_run_by_the_tools_timing_step(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))

    class Tool:
        name = "whatif_render"

        def timing_step(self, inputs):
            return f"whatif_render.{inputs['mode']}"

        @T.record_tool
        def execute(self, inputs):
            return _Result()

    Tool().execute({"mode": "audio", "video": "2026-11-06_x", "channel": "say-suppose"})
    row = T.read_timings()[-1]
    assert (row["step"], row["video"], row["channel"]) == ("whatif_render.audio", "2026-11-06_x", "say-suppose")


def test_a_broken_timing_step_falls_back_to_the_tool_name(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))

    class Tool:
        name = "whatif_render"

        def timing_step(self, inputs):
            raise KeyError("mode")

        @T.record_tool
        def execute(self, inputs):
            return _Result()

    assert Tool().execute({}).success
    assert T.read_timings()[-1]["step"] == "whatif_render"
```

Append to `core/studio/tests/test_jobs_cli.py`:

```python
def test_report_filters_by_video_channel_and_step_prefix(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    T.record("whatif_render.full-1080p", seconds=3600, ok=True, channel="say-suppose", video="v1")
    T.record("whatif_render.audio", seconds=120, ok=True, channel="say-suppose", video="v2")
    T.record("pou_tts", seconds=60, ok=True, channel="professor-of-us", video="v2")
    assert cli.main(["report", "--video", "v2", "--step", "whatif_"]) == 0
    out = capsys.readouterr().out.splitlines()
    assert [line.split()[0] for line in out[2:]] == ["whatif_render.audio", "total"]
    assert out[-1].split()[1] == "1" and out[-1].rstrip().endswith("0.03 h")


def test_run_with_a_queue_tells_the_command_it_holds_it(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    monkeypatch.setenv("OMNI_JOBS_QUEUES", str(tmp_path / "queues"))
    probe = "import os, sys; sys.exit(0 if 'render' in os.environ.get('OMNI_JOBS_QUEUE_HELD', '').split(',') else 4)"
    assert cli.main(["run", "--step", "x", "--queue", "render", "--", sys.executable, "-c", probe]) == 0
    assert cli.main(["run", "--step", "x", "--", sys.executable, "-c", probe]) == 4
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd core && /Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv/bin/python -m pytest studio/tests/test_jobs_timing.py studio/tests/test_jobs_cli.py -q`
Expected: 4 failures (step recorded as `whatif_render`, no `--video` option, `OMNI_JOBS_QUEUE_HELD` unset).

- [ ] **Step 3: Implement**

In `core/studio/jobs/timing.py`, add above `record_tool` and use it in the wrapper's `record(...)` call in place of
`getattr(self, "name", type(self).__name__)`:

```python
def step_for(tool: Any, inputs: dict[str, Any]) -> str:
    """The tool's name, or the variant its timing_step(inputs) names (whatif_render.picture-720p)."""
    name = getattr(tool, "name", type(tool).__name__)
    named = getattr(tool, "timing_step", None)
    if named is None:
        return name
    try:
        return str(named(inputs)) or name
    except Exception:
        return name
```

```python
                record(
                    step_for(self, inputs),
```

In `core/studio/jobs/__main__.py`:

```python
import os
...
HELD_ENV = "OMNI_JOBS_QUEUE_HELD"


def _run(command: list[str], pass_fds: tuple[int, ...] = (), held: str = "") -> int:
    env = None
    if held:
        mine = [q for q in os.environ.get(HELD_ENV, "").split(",") if q]
        env = {**os.environ, HELD_ENV: ",".join([*mine, held])}
    try:
        return subprocess.run(command, pass_fds=pass_fds, env=env).returncode
    except OSError as exc:  # never started: the shell's own codes, 126 not executable and 127 not found
        print(f"could not run {command[0]}: {exc}", file=sys.stderr)
        return 126 if isinstance(exc, PermissionError) else 127
```

In `cmd_run`, call `_run(command, (lock.fd,) if lock else (), args.queue or "")`.

```python
def _matches(row: dict, args) -> bool:
    return (
        (not args.video or row.get("video") == args.video)
        and (not args.channel or row.get("channel") == args.channel)
        and (not args.step or str(row.get("step", "")).startswith(args.step))
    )


def cmd_report(args) -> int:
    rows = summarize([r for r in read_timings(since=args.since) if _matches(r, args)])
    print(f"{'step':<28} {'runs':>5} {'fail':>5} {'total s':>10} {'median s':>10} {'max s':>10}")
    print("-" * 72)
    for r in rows:
        print(
            f"{r['step']:<28} {r['runs']:>5} {r['failures']:>5} {r['total_s']:>10.1f} {r['median_s']:>10.1f} "
            f"{r['max_s']:>10.1f}"
        )
    total = sum(r["total_s"] for r in rows)
    print(f"{'total':<28} {sum(r['runs'] for r in rows):>5} {sum(r['failures'] for r in rows):>5} "
          f"{total:>10.1f} {'':>10} {total / 3600:>8.2f} h")
    return 0
```

In `main`, on the `report` parser:

```python
    s.add_argument("--video", help="only this video id")
    s.add_argument("--channel", help="only this channel slug")
    s.add_argument("--step", help="only steps that start with this, e.g. whatif_")
```

- [ ] **Step 4: Run the tests**

Run: `cd core && /Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv/bin/python -m pytest studio/tests/test_jobs_timing.py studio/tests/test_jobs_cli.py studio/tests/test_jobs_queue.py -q`
Expected: all pass (the existing `test_report_prints_a_ranked_table` still reads rows 2 and 3).

- [ ] **Step 5: Lint and commit**

```bash
make precommit
git add core/studio/jobs/timing.py core/studio/jobs/__main__.py core/studio/tests/test_jobs_timing.py core/studio/tests/test_jobs_cli.py
git commit -m "feat(jobs): timing variants per tool, report filters by video, and the held-queue signal"
```

---

### Task 2: The what-if tools are timed and take the render queue

**Files:**
- Modify: `core/openmontage/tools/studio/studio_whatif_tools.py` (imports, `_WhatifTool.execute`, `WhatifRender`)
- Test: `core/studio/tests/test_whatif_tools.py`

**Interfaces:**
- Consumes: `studio.jobs.timing.record_tool`, `studio.jobs.queue.hold`/`QueueBusy`, `HELD_ENV` from Task 1.
- Produces: `_WhatifTool.queue: str | None` (class attribute; `"render"` on `WhatifRender` and, in Task 6,
  `WhatifBeats`); `_WhatifTool._run(inputs) -> ToolResult` (the old `execute` body); `_WhatifTool.after(inputs,
  result) -> ToolResult` (hook, default returns `result`; Tasks 4 and 6 override it); input `queue_wait_seconds`
  (default 7200) on queued tools.

- [ ] **Step 1: Write the failing tests**

Append to `core/studio/tests/test_whatif_tools.py`:

```python
from studio.jobs import queue as Q
from studio.jobs import timing as T


class _Quick(wt._WhatifTool):
    name = "whatif_test_quick"
    queue = "render"

    def command(self, inputs):
        return [["true"]], dict(os.environ)


def test_a_queued_tool_refuses_when_the_render_queue_stays_held(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_QUEUES", str(tmp_path / "queues"))
    monkeypatch.delenv("OMNI_JOBS_QUEUE_HELD", raising=False)
    with Q.hold("render", step="other session"):
        result = _Quick().execute({"queue_wait_seconds": 0})
    assert not result.success and "render queue" in result.error and "other session" in result.error
    assert _Quick().execute({"queue_wait_seconds": 0}).success


def test_a_tool_run_inside_studio_jobs_run_does_not_take_the_queue_twice(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_QUEUES", str(tmp_path / "queues"))
    monkeypatch.setenv("OMNI_JOBS_QUEUE_HELD", "render")
    with Q.hold("render", step="studio.jobs run"):
        assert _Quick().execute({"queue_wait_seconds": 0}).success


def test_whatif_tools_record_a_timing(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    monkeypatch.setenv("OMNI_JOBS_QUEUES", str(tmp_path / "queues"))
    _Quick().execute({"channel": "say-suppose", "video": VIDEO})
    row = T.read_timings()[-1]
    assert (row["step"], row["video"]) == ("whatif_test_quick", VIDEO)
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd core/openmontage && PYTHONPATH="$PWD:$PWD/.." /Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv/bin/python -m pytest ../studio/tests/test_whatif_tools.py -q`
Expected: the three new tests fail (no queue, no timing row).

- [ ] **Step 3: Implement**

At the top of `studio_whatif_tools.py`, beside the other imports:

```python
import contextlib

try:  # B1 timing and the render queue (core/studio/jobs); outside the studio layer the tools run untimed, unqueued
    from studio.jobs import queue as _queue
    from studio.jobs.timing import record_tool as _record_tool
except ImportError:
    _queue = None

    def _record_tool(fn):
        return fn

HELD_ENV = "OMNI_JOBS_QUEUE_HELD"
```

In `_WhatifTool`, add the attribute and replace `execute`:

```python
    queue: str | None = None  # "render" on tools that render; one render at a time on the Mac (CLAUDE.md)

    def _queued(self, inputs: dict[str, Any]):
        held = os.environ.get(HELD_ENV, "").split(",")
        if self.queue is None or _queue is None or self.queue in held:
            return contextlib.nullcontext()
        return _queue.hold(self.queue, step=self.name, channel=str(inputs.get("channel", "")),
                           video=str(inputs.get("video", "")), timeout=float(inputs.get("queue_wait_seconds", 7200)))

    @_record_tool
    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        try:
            with self._queued(inputs):
                return self.after(inputs, self._run(inputs))
        except Exception as exc:
            if _queue is not None and isinstance(exc, _queue.QueueBusy):
                return ToolResult(success=False, error=f"the {self.queue} queue is held ({exc}); not run")
            raise

    def after(self, inputs: dict[str, Any], result: ToolResult) -> ToolResult:
        """Runs inside the queue after the commands; Tasks 4 and 6 write sidecars here."""
        return result
```

Rename the old `execute` body to `def _run(self, inputs: dict[str, Any]) -> ToolResult:` unchanged. On
`WhatifRender` add `queue = "render"` and the `queue_wait_seconds` property to `input_schema`
(`{"type": "number", "default": 7200}`).

- [ ] **Step 4: Run the tests**

Run: `cd core/openmontage && PYTHONPATH="$PWD:$PWD/.." /Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv/bin/python -m pytest ../studio/tests/test_whatif_tools.py -q`
Expected: all pass, including the existing `test_a_timeout_kills_the_whole_command_and_is_reported`.

- [ ] **Step 5: Lint and commit**

```bash
make precommit
git add core/openmontage/tools/studio/studio_whatif_tools.py core/studio/tests/test_whatif_tools.py
git commit -m "feat(whatif): render tools record their time and take the render queue themselves"
```

---

### Task 3: 720p previews for G4 and G5; one 1080p render for G6

**Files:**
- Modify: `core/openmontage/tools/studio/studio_whatif_tools.py` (`WhatifRender`)
- Modify: `core/openmontage/pipeline_defs/studio-whatif.yaml` (rough_cut `success_criteria`; final_watch
  `tools_available`)
- Modify: `core/openmontage/skills/studio/studio-whatif-rough-cut.md` (step 5),
  `studio-whatif-final-watch.md` (first paragraph)
- Test: `core/studio/tests/test_whatif_tools.py`

**Interfaces:**
- Produces: `WhatifRender` inputs `quality: "preview" | "final"` (default `"preview"`), constants
  `PREVIEW_SCALE = 0.6666666666666666`, `WhatifRender.timing_step(inputs)` returning
  `whatif_render.full-720p` or `whatif_render.full-1080p` (Task 4 adds the other modes).

- [ ] **Step 1: Write the failing tests**

```python
def _render(**kw):
    return {"entry": "core/engines/whatif/examples/pause-sample/index.ts", "composition": "Video",
            "props": "core/engines/whatif/public/pause/props.json", "public_dir": "core/engines/whatif/public",
            "output": "core/engines/whatif/out/pause.mp4", **kw}


def test_a_render_is_a_720p_preview_unless_final_is_asked():
    tool = wt.WhatifRender()
    (render, _limit), _ = tool.command(_render())
    assert f"--scale={wt.PREVIEW_SCALE}" in render
    assert tool.timing_step(_render()) == "whatif_render.full-720p"
    (render, _limit), _ = tool.command(_render(quality="final"))
    assert not any(a.startswith("--scale") for a in render)
    assert tool.timing_step(_render(quality="final")) == "whatif_render.full-1080p"


def test_the_preview_scale_gives_whole_1280x720():
    # Remotion refuses a fractional size ("height ... must be an integer, but is 720.036" at --scale=0.6667,
    # the plan's benchmark); 0.6666666666666666 times 1920 and 1080 is exactly 1280 and 720 in doubles.
    assert (1920 * wt.PREVIEW_SCALE, 1080 * wt.PREVIEW_SCALE) == (1280.0, 720.0)


def test_a_final_render_is_the_whole_film():
    with pytest.raises(ValueError, match="whole film"):
        wt.WhatifRender().command(_render(quality="final", frames="0-299"))


def test_g6_has_the_render_tool():
    stages = {s["name"]: s for s in load_pipeline_readonly("studio-whatif")["stages"]}
    assert "whatif_render" in stages["final_watch"]["tools_available"]
```

- [ ] **Step 2: Run them to see them fail**

Run: as in Task 2, Step 2. Expected: the three new tests fail.

- [ ] **Step 3: Implement**

In `studio_whatif_tools.py`:

```python
# G4/G5 watch 1280x720 previews; G6 watches one 1920x1080 render (pipeline v2, optimisation 5). The scale was
# measured in the plan's benchmark (docs/superpowers/plans/2026-11-10-say-suppose-g4-g5-speedups.md).
PREVIEW_SCALE = 0.6666666666666666  # exactly 1280x720 in doubles; 0.6667 gives 720.036 and Remotion refuses it
QUALITIES = ("preview", "final")
```

`WhatifRender`: change `best_for` to `["a G4/G5 preview at 1280x720, or the one 1920x1080 film G6 watches
(quality=final)"]`, add to `input_schema["properties"]`:

```python
        "quality": {"enum": list(QUALITIES), "default": "preview",
                    "description": "preview: 1280x720 for G4 and G5 watches; final: the one 1920x1080 render G6 watches"},
```

and replace `command` with:

```python
    def timing_step(self, inputs: dict[str, Any]) -> str:
        return "whatif_render.full-" + ("1080p" if inputs.get("quality") == "final" else "720p")

    def _options(self, inputs: dict[str, Any], props: Path, public: Path) -> list[str]:
        quality = inputs.get("quality", "preview")
        if quality not in QUALITIES:
            raise ValueError(f"quality must be one of {QUALITIES}")
        if quality == "final" and inputs.get("frames"):
            raise ValueError("a final render is the whole film: G6 watches one 1920x1080 render, never a slice")
        opts = [f"--props={props}", f"--public-dir={public}", "--log=error"]
        if inputs.get("frames"):
            opts.append(f"--frames={inputs['frames']}")
        if quality == "preview":
            opts.append(f"--scale={PREVIEW_SCALE}")
        return opts

    def command(self, inputs: dict[str, Any]):
        entry, props, public = (inside(inputs[k]) for k in ("entry", "props", "public_dir"))
        output = inside(inputs["output"])
        raw = output.with_name(output.stem + "-raw" + output.suffix)
        render = ["npx", "remotion", "render", str(entry), str(inputs["composition"]), str(raw),
                  *self._options(inputs, props, public)]
        limit = ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-c:v", "copy", "-af", LIMITER,
                 "-c:a", "aac", "-b:a", "256k", str(output)]
        return [render, limit], dict(os.environ)
```

In `studio-whatif.yaml`: rough_cut `success_criteria` becomes
`- A 1280x720 preview of the whole script with narration, in renders/ (whatif_render quality=preview)`;
final_watch `tools_available` becomes `[whatif_render]`.

In `studio-whatif-rough-cut.md`, replace step 5's first sentence with:

```markdown
5. Check frames with `whatif_stills`, then render the watch copy as a 1280x720 preview into `renders/` (git-ignored)
   with `whatif_render` (`quality` defaults to `preview`). G4 and G5 are always watched at 720p; never render
   1920x1080 before G6.
```

In `studio-whatif-final-watch.md`, put first:

```markdown
**The one 1080p render.** First render the film once at 1920x1080 with `whatif_render` `quality: final` (`mode`
full, no `frames`) from the code and narration G5 approved; the tool waits for the render queue. Never stitch the
G6 file from cached beats and never mux it: G6's media proof covers this exact file. Run
`.venv/bin/omni qc <slug> <video> final_watch --media <render>` on it, then hand it over.
```

- [ ] **Step 4: Run the tests**

Run: as in Task 2, Step 4, plus `test_the_pipeline_names_the_tools_on_its_production_stages`. Expected: all pass.

- [ ] **Step 5: Verify on video 1 (one render, under the queue)**

Run a 720p preview of video 1's first 300 frames through the tool and check the size:

```bash
cd core/openmontage && PYTHONPATH="$PWD:$PWD/.." /Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv/bin/python -c "
from tools.studio.studio_whatif_tools import WhatifRender
v = 'channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day'
r = WhatifRender().execute({'entry': v + '/scenes/index.ts', 'composition': 'RoughCut',
    'props': v + '/assets/narration/props.json', 'public_dir': v + '/assets',
    'output': v + '/renders/plan-check-720p.mp4', 'frames': '0-299', 'channel': 'say-suppose',
    'video': '2026-11-06_pause-time-for-10-seconds-a-day'})
print(r.success, r.error)"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ../../channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day/renders/plan-check-720p.mp4
```

Expected: `True None`, then `1280,720`. Then run the same call once more without `frames`, to
`renders/plan-check-720p-full.mp4`: that is the whole-film 720p time this plan estimates at 28 min. Put the
`whatif_render.full-720p` seconds from `python -m studio.jobs report --video 2026-11-06_pause-time-for-10-seconds-a-day`
in the PR. Delete `plan-check-720p*` afterwards.

- [ ] **Step 6: Lint and commit**

```bash
make precommit
git add core/openmontage/tools/studio/studio_whatif_tools.py core/openmontage/pipeline_defs/studio-whatif.yaml \
  core/openmontage/skills/studio/studio-whatif-rough-cut.md core/openmontage/skills/studio/studio-whatif-final-watch.md \
  core/studio/tests/test_whatif_tools.py
git commit -m "feat(whatif): G4 and G5 watch 720p previews; G6 renders the one 1080p film"
```

---

### Task 4: Audio outside the picture render

The mix stays in Remotion: the score's duck curve is `scoreVolume` in the video's `Film.tsx`, and the effects are
`<Audio>` elements inside the beats (`Opening.tsx`, `Catch.tsx`, `LongRun.tsx` and others in video 1). Porting that to
ffmpeg would mean two mixes that drift. Instead the picture renders muted, the audio renders on its own with
Remotion's audio-only output (`--codec=wav`, no frames drawn), and `whatif_mux` joins them with `-c:v copy` and the
same limiter as today. A sound note then costs an audio pass and a mux.

**Files:**
- Create: `core/openmontage/tools/studio/studio_whatif_cache.py` (manifests, digests, sidecars; Task 5 adds beats)
- Modify: `core/openmontage/tools/studio/studio_whatif_tools.py` (`WhatifRender.mode`, `WhatifRender.after`,
  `WhatifMux`)
- Modify: `core/openmontage/skills/studio/studio-whatif-edit.md`, `core/openmontage/pipeline_defs/studio-whatif.yaml`
- Test: `core/studio/tests/test_whatif_tools.py`, `core/studio/tests/test_whatif_cache.py`

**Interfaces:**
- Produces in `studio_whatif_cache.py`: `file_sha(path: Path) -> str`; `manifest(roots: dict[str, Path], *,
  skip_audio: bool = False) -> dict[str, str]`; `digest(m: dict[str, str]) -> str`; `code_roots(entry: Path, engine:
  Path) -> dict[str, Path]`; `sidecar_path(media: Path) -> Path`; `write_sidecar(media: Path, *, mode: str, quality:
  str, props: Path, entry: Path, engine: Path, frames: str) -> dict`; `read_sidecar(media: Path) -> dict | None`;
  `changed_files(a: dict, b: dict) -> list[str]`.
- Produces in the tools: `WhatifRender` input `mode: "full" | "picture" | "audio"` (default `"full"`);
  `timing_step` values `whatif_render.picture-720p`, `whatif_render.audio`; tool `whatif_mux` with inputs
  `picture`, `audio`, `output`, `sound_only_change: bool` and result `data["scene_files_changed"]: list[str]`.

- [ ] **Step 1: Write the failing tests**

Create `core/studio/tests/test_whatif_cache.py`:

```python
"""Digests and sidecars behind the what-if previews (G4/G5 speed-ups plan, Tasks 4 and 5)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from tools.studio import studio_whatif_cache as C


def _write(path: Path, text: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
    return path


@pytest.fixture
def video(tmp_path):
    """A channel video with two beats, an engine with a kit, and assets with one image and one sound."""
    engine = tmp_path / "engine"
    _write(engine / "src" / "kit" / "theme.ts", "export const FPS = 30;\n")
    _write(engine / "remotion.config.ts", "// config\n")
    _write(engine / "pnpm-lock.yaml", "lock: 1\n")
    channel = tmp_path / "channels" / "say-suppose"
    _write(channel / "brand" / "IdentC.tsx", "// brand\n")
    folder = channel / "videos" / "2026-11-10_x"
    scenes = folder / "scenes"
    for rel in ("index.ts", "Film.tsx", "shared.ts", "beats/A.tsx", "beats/A.part.tsx", "beats/B.tsx"):
        _write(scenes / rel, f"// {rel}\n")
    _write(scenes / "beats.json", json.dumps([
        {"id": "a", "firstLine": 0, "files": ["beats/A.tsx", "beats/A.*.tsx"]},
        {"id": "b", "firstLine": 1, "files": ["beats/B.tsx"], "freezes": []},
    ]))
    timeline = {"totalFrames": 90, "clips": [{"file": "n/1.wav", "from": 0, "frames": 30},
                                             {"file": "n/2.wav", "from": 40, "frames": 30}], "cues": {}}
    _write(folder / "assets" / "narration" / "props.json", json.dumps({"timeline": timeline}))
    _write(folder / "assets" / "images" / "sky.png", "png")
    _write(folder / "assets" / "sfx" / "pop.wav", "wav")
    return {"engine": engine, "folder": folder, "scenes": scenes, "public": folder / "assets",
            "props": folder / "assets" / "narration" / "props.json", "brand": channel / "brand"}


def test_code_roots_cover_scenes_kit_config_lock_and_the_channels_brand(video):
    roots = C.code_roots(video["scenes"] / "index.ts", video["engine"])
    assert roots["scenes"] == video["scenes"] and roots["brand"] == video["brand"]
    assert {"kit", "config", "lock"} <= set(roots)


def test_a_sidecar_round_trips_and_names_the_files_that_changed(video, tmp_path):
    media = tmp_path / "pic.mp4"
    media.write_bytes(b"x")
    entry = video["scenes"] / "index.ts"
    first = C.write_sidecar(media, mode="picture", quality="preview", props=video["props"], entry=entry,
                            engine=video["engine"], frames="all")
    assert C.read_sidecar(media) == first
    _write(video["scenes"] / "beats" / "B.tsx", "// louder pop\n")
    second = C.write_sidecar(tmp_path / "a.wav", mode="audio", quality="preview", props=video["props"],
                             entry=entry, engine=video["engine"], frames="all")
    assert first["props_sha256"] == second["props_sha256"]
    assert first["scenes_sha256"] != second["scenes_sha256"]
    assert C.changed_files(first, second) == ["scenes/beats/B.tsx"]


def test_audio_files_are_left_out_of_an_asset_manifest_on_request(video):
    names = set(C.manifest({"assets": video["public"]}, skip_audio=True))
    assert "assets/images/sky.png" in names and "assets/sfx/pop.wav" not in names
```

Append to `core/studio/tests/test_whatif_tools.py`:

```python
def test_picture_and_audio_passes(tmp_path):
    tool = wt.WhatifRender()
    (picture,), _ = tool.command(_render(mode="picture"))
    assert "--muted" in picture and picture[5].endswith("pause.mp4")
    assert tool.timing_step(_render(mode="picture")) == "whatif_render.picture-720p"
    (audio,), _ = tool.command(_render(mode="audio", output="core/engines/whatif/out/pause.wav"))
    assert "--codec=wav" in audio and not any(a.startswith("--scale") for a in audio)
    assert tool.timing_step(_render(mode="audio")) == "whatif_render.audio"
    with pytest.raises(ValueError, match=".wav"):
        tool.command(_render(mode="audio"))
    with pytest.raises(ValueError, match="one full"):
        tool.command(_render(mode="picture", quality="final"))


def _sidecars(tmp_path, monkeypatch, *, props_a="p1", props_b="p1", scenes_a="s1", scenes_b="s1"):
    pic, aud = tmp_path / "pic.mp4", tmp_path / "aud.wav"
    pic.write_bytes(b"v")
    aud.write_bytes(b"a")
    for media, mode, props, scenes in ((pic, "picture", props_a, scenes_a), (aud, "audio", props_b, scenes_b)):
        wt.C.sidecar_path(media).write_text(json.dumps({"schema": 1, "mode": mode, "quality": "preview",
            "props_sha256": props, "scenes_sha256": scenes, "frames": "all",
            "files": {"scenes/beats/B.tsx": scenes}}))
    monkeypatch.setattr(wt, "inside", lambda p: Path(p))
    return {"picture": str(pic), "audio": str(aud), "output": str(tmp_path / "out.mp4")}


def test_mux_joins_a_matching_picture_and_audio(tmp_path, monkeypatch):
    (cmd,), _ = wt.WhatifMux().command(_sidecars(tmp_path, monkeypatch))
    assert cmd[0] == "ffmpeg" and "copy" in cmd and "alimiter=limit=0.84:level=false" in cmd


def test_mux_refuses_when_the_timing_moved(tmp_path, monkeypatch):
    with pytest.raises(ValueError, match="timing"):
        wt.WhatifMux().command(_sidecars(tmp_path, monkeypatch, props_b="p2"))


def test_mux_needs_a_sound_only_declaration_when_scene_code_changed(tmp_path, monkeypatch):
    inputs = _sidecars(tmp_path, monkeypatch, scenes_b="s2")
    with pytest.raises(ValueError, match="sound_only_change"):
        wt.WhatifMux().command(inputs)
    (cmd,), _ = wt.WhatifMux().command({**inputs, "sound_only_change": True})
    assert cmd[0] == "ffmpeg"
```

Add `import json` to the test module's imports, and `"whatif_mux"` to `NAMES`.

- [ ] **Step 2: Run them to see them fail**

Run: `cd core/openmontage && PYTHONPATH="$PWD:$PWD/.." /Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv/bin/python -m pytest ../studio/tests/test_whatif_cache.py ../studio/tests/test_whatif_tools.py -q`
Expected: import error for `studio_whatif_cache`, then the mode and mux tests fail.

- [ ] **Step 3: Create `studio_whatif_cache.py`**

```python
"""omni-studio: what the what-if previews are made of (G4/G5 speed-ups, pipeline v2 optimisation 5).

File manifests and digests, the sidecar each preview pass writes beside its media (`<file>.render.json`), and, from
Task 5 on, the beat segments and their cache keys. Pure functions: nothing here renders.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Optional

SCHEMA = 1
AUDIO_SUFFIXES = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg"}
SKIP = {"node_modules", "__pycache__", ".DS_Store"}


def file_sha(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _is_audio(path: Path) -> bool:
    return path.suffix.lower() in AUDIO_SUFFIXES or path.name.endswith(".words.json")


def manifest(roots: dict[str, Path], *, skip_audio: bool = False) -> dict[str, str]:
    """`label/relative path` -> sha256 for every file under each root; a root that is a file is keyed by its label."""
    out: dict[str, str] = {}
    for label, root in roots.items():
        if root.is_file():
            out[label] = file_sha(root)
            continue
        for p in sorted(root.rglob("*")) if root.is_dir() else []:
            if p.is_file() and not SKIP & set(p.parts) and not (skip_audio and _is_audio(p)):
                out[f"{label}/{p.relative_to(root).as_posix()}"] = file_sha(p)
    return out


def digest(m: dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps(m, sort_keys=True).encode("utf-8")).hexdigest()


def code_roots(entry: Path, engine: Path) -> dict[str, Path]:
    """What a picture is drawn from besides props and assets: the scenes folder, the kit, the engine's config and
    lock, and the channel's brand kit when the entry is a channel video (video 1's Film imports ../../../brand)."""
    scenes = entry.parent
    roots = {"scenes": scenes, "kit": engine / "src" / "kit", "config": engine / "remotion.config.ts",
             "lock": engine / "pnpm-lock.yaml"}
    parts = scenes.parts
    if "channels" in parts and len(parts) > parts.index("channels") + 1:
        roots["brand"] = Path(*parts[: parts.index("channels") + 2]) / "brand"
    return roots


def sidecar_path(media: Path) -> Path:
    return media.with_name(media.name + ".render.json")


def write_sidecar(media: Path, *, mode: str, quality: str, props: Path, entry: Path, engine: Path,
                  frames: str) -> dict[str, Any]:
    files = manifest(code_roots(entry, engine))
    data = {"schema": SCHEMA, "mode": mode, "quality": quality, "props_sha256": file_sha(props),
            "scenes_sha256": digest(files), "frames": frames, "files": files}
    sidecar_path(media).write_text(json.dumps(data, indent=1, sort_keys=True), encoding="utf-8")
    return data


def read_sidecar(media: Path) -> Optional[dict[str, Any]]:
    path = sidecar_path(media)
    if not path.is_file():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    return data if isinstance(data, dict) and data.get("schema") == SCHEMA else None


def changed_files(a: dict[str, Any], b: dict[str, Any]) -> list[str]:
    fa, fb = a.get("files", {}), b.get("files", {})
    return sorted(k for k in fa.keys() | fb.keys() if fa.get(k) != fb.get(k))
```

- [ ] **Step 4: Add `mode` to `WhatifRender` and the `WhatifMux` tool**

In `studio_whatif_tools.py`, import the cache module the way the tools import each other
(`from tools.studio import studio_whatif_cache as C`), add `import json`, and:

```python
MODES = ("full", "picture", "audio")
```

`WhatifRender.input_schema["properties"]` gains
`"mode": {"enum": list(MODES), "default": "full", "description": "picture: muted; audio: a .wav from the same
mix, no frames drawn; full: both, then the limiter"}`. Replace `timing_step` and `command`, and add `after`:

```python
    def timing_step(self, inputs: dict[str, Any]) -> str:
        mode = inputs.get("mode", "full")
        if mode == "audio":
            return "whatif_render.audio"
        return f"whatif_render.{mode}-" + ("1080p" if inputs.get("quality") == "final" else "720p")

    def command(self, inputs: dict[str, Any]):
        mode = inputs.get("mode", "full")
        if mode not in MODES:
            raise ValueError(f"mode must be one of {MODES}")
        if mode != "full" and inputs.get("quality") == "final":
            raise ValueError("a final render is one full render with its own audio (the file G6 watches); "
                             "picture and audio passes are for previews")
        entry, props, public = (inside(inputs[k]) for k in ("entry", "props", "public_dir"))
        output = inside(inputs["output"])
        base = ["npx", "remotion", "render", str(entry), str(inputs["composition"])]
        opts = self._options(inputs, props, public)
        if mode == "audio":
            if output.suffix != ".wav":
                raise ValueError("an audio pass writes a .wav")
            opts = [o for o in opts if not o.startswith("--scale")]
            return [[*base, str(output), "--codec=wav", *opts]], dict(os.environ)
        if mode == "picture":
            return [[*base, str(output), "--muted", *opts]], dict(os.environ)
        raw = output.with_name(output.stem + "-raw" + output.suffix)
        limit = ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-c:v", "copy", "-af", LIMITER,
                 "-c:a", "aac", "-b:a", "256k", str(output)]
        return [[*base, str(raw), *opts], limit], dict(os.environ)

    def after(self, inputs: dict[str, Any], result: ToolResult) -> ToolResult:
        if result.success and inputs.get("mode", "full") in ("picture", "audio"):
            C.write_sidecar(inside(inputs["output"]), mode=inputs["mode"], quality="preview",
                            props=inside(inputs["props"]), entry=inside(inputs["entry"]), engine=ENGINE,
                            frames=str(inputs.get("frames") or "all"))
        return result
```

```python
class WhatifMux(_WhatifTool):
    name = "whatif_mux"
    capability = "video_composition"
    determinism = Determinism.DETERMINISTIC
    capabilities = ["mux_picture_and_audio", "loudness_limiter"]
    best_for = ["a sound-only note at G5: the new audio pass on the last picture pass, in seconds"]
    not_good_for = ["the G6 file: that is one whatif_render quality=final"]
    input_schema = {"type": "object", "required": ["picture", "audio", "output"], "properties": {
        "picture": {"type": "string", "description": "a picture pass (whatif_render mode=picture or whatif_beats)"},
        "audio": {"type": "string", "description": "an audio pass (whatif_render mode=audio)"},
        "output": {"type": "string"},
        "sound_only_change": {"type": "boolean", "default": False,
                              "description": "every scene file changed since the picture pass changes only sound"}}}

    def command(self, inputs: dict[str, Any]):
        picture, audio, output = (inside(inputs[k]) for k in ("picture", "audio", "output"))
        pic, aud = C.read_sidecar(picture), C.read_sidecar(audio)
        if pic is None or aud is None:
            raise ValueError("mux only joins passes whatif_render or whatif_beats wrote (no .render.json beside them)")
        if pic["mode"] not in ("picture", "beats") or aud["mode"] != "audio":
            raise ValueError("picture must be a picture pass and audio an audio pass")
        if pic["props_sha256"] != aud["props_sha256"] or pic["frames"] != aud["frames"]:
            raise ValueError("the picture and the audio come from different timing (props.json or frames): "
                             "render the picture again")
        if pic["scenes_sha256"] != aud["scenes_sha256"] and inputs.get("sound_only_change") is not True:
            raise ValueError(f"scene files changed since the picture pass: {C.changed_files(pic, aud)}; pass "
                             "sound_only_change=true only if every one of them changes sound alone")
        return [["ffmpeg", "-v", "error", "-y", "-i", str(picture), "-i", str(audio), "-map", "0:v", "-map", "1:a",
                 "-c:v", "copy", "-af", LIMITER, "-c:a", "aac", "-b:a", "256k", "-shortest", str(output)]], \
            dict(os.environ)

    def after(self, inputs: dict[str, Any], result: ToolResult) -> ToolResult:
        if result.success:
            pic, aud = (C.read_sidecar(inside(inputs[k])) for k in ("picture", "audio"))
            result.data["scene_files_changed"] = C.changed_files(pic, aud)
        return result
```

Add `whatif_mux` to `tools_available` on rough_cut and final_edit in `studio-whatif.yaml`, and to the module
docstring's tool list. In `studio-whatif-edit.md`, add after the first paragraph:

```markdown
**A sound-only note** (music level, ducks, an effect's volume, mutes, the narration track): change the code, render
`whatif_render` `mode: audio` (`composition: RoughCutSound` once the video registers it, Task 4b) to a `.wav`,
then `whatif_mux` it onto the last picture pass (`mode: picture`, or
`whatif_beats`). Pass `sound_only_change: true` only when every file the mux lists in `scene_files_changed` changes
sound alone, and name those files in the hand-over. A note that moves timing (a gap, a tempo, a new take) changes
props.json; the mux refuses it, so render the picture again.
```

- [ ] **Step 5: Run the tests**

Run: as in Step 2. Expected: all pass.

- [ ] **Step 6: Verify the split mix is the same mix (one render session, under the queue)**

Render video 1's frames 0-899 three ways with the tool (`mode` full, picture, audio, all `quality` preview, outputs
`renders/plan-check-{full.mp4,pic.mp4,aud.wav}`), mux the last two to `renders/plan-check-mux.mp4`, then null-test
the audio:

```bash
cd channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day/renders
ffmpeg -v error -i plan-check-full.mp4 -i plan-check-mux.mp4 -filter_complex \
  "[0:a]aresample=48000[a];[1:a]aresample=48000,volume=-1[b];[a][b]amix=inputs=2:normalize=0,volumedetect" -f null - 2>&1 | grep max_volume
```

Expected: `max_volume` at or below -50 dB (the two mixes cancel). Then `ffprobe -count_frames` on
`plan-check-full.mp4` and `plan-check-mux.mp4` reports 900 video frames each. Delete `plan-check-*` afterwards.

- [ ] **Step 7: Lint and commit**

```bash
make precommit
git add core/openmontage/tools/studio/studio_whatif_cache.py core/openmontage/tools/studio/studio_whatif_tools.py \
  core/openmontage/pipeline_defs/studio-whatif.yaml core/openmontage/skills/studio/studio-whatif-edit.md \
  core/studio/tests/test_whatif_cache.py core/studio/tests/test_whatif_tools.py
git commit -m "feat(whatif): picture and audio passes and whatif_mux, so a sound note skips the picture render"
```

---

### Task 4b: The sound composition, so the audio pass draws nothing

An audio-only Remotion render still mounts every frame's React tree to collect the `<Audio>` elements: on video 1 it
took 1,301 s (the benchmark), and video 1's three hand-made audio passes (edit v3-v5) cost about that each. The
drawing is what is slow, and an audio pass needs none of it. A kit context turns the drawing components into
nothing; each video registers a second composition wrapped in it.

**Files:**
- Create: `core/engines/whatif/src/kit/sound.ts`
- Modify: `core/engines/whatif/src/kit/stage/Stage.tsx` (`Stage`, `Finish`), `core/engines/whatif/src/kit/rig/Figure.tsx`
  (`Figure`), `core/engines/whatif/src/kit/stage/PauseBars.tsx`, `core/engines/whatif/src/kit/stage/Look.tsx` (`Light`)
- Modify: `core/openmontage/skills/studio/studio-whatif-rough-cut.md` (the video's `Root.tsx` registers `<id>Sound`)
- Test: `core/engines/whatif/tests/sound.test.ts`

**Interfaces:**
- Produces: `SoundOnly: React.Context<boolean>` and `useSoundOnly(): boolean` in `@whatif/kit/sound`. Under
  `SoundOnly.Provider value={true}`, `Stage`, `Finish`, `Figure`, `PauseBars` and `Light` render `null`. A video's
  `Root.tsx` registers `RoughCutSound` beside `RoughCut`; the audio pass is `whatif_render mode=audio
  composition=RoughCutSound`.

- [ ] **Step 1: Write the failing test**

`core/engines/whatif/tests/sound.test.ts`:

```ts
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Figure } from "../src/kit/rig/Figure";
import { SoundOnly } from "../src/kit/sound";
import { PauseBars } from "../src/kit/stage/PauseBars";
import { Finish, Stage } from "../src/kit/stage/Stage";

const sound = (el: React.ReactElement) => renderToStaticMarkup(createElement(SoundOnly.Provider, { value: true }, el));

describe("the sound composition", () => {
  const cam = { x: 960, y: 540, zoom: 1 };
  const drawn = [
    createElement(Stage, { cam, radius: 0, origin: { x: 0, y: 0 }, back: null, actors: null }),
    createElement(Finish),
    createElement(Figure, { x: 0, y: 0, head: "#fc0" }),
    createElement(PauseBars, { frame: 5, pauses: [{ from: 0, to: 30 }] }),
  ];

  it("draws nothing", () => {
    for (const el of drawn) expect(sound(el)).toBe("");
  });

  it("draws as before outside it", () => {
    for (const el of drawn) expect(renderToStaticMarkup(el)).not.toBe("");
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd core/engines/whatif && npx vitest run tests/sound.test.ts`
Expected: FAIL, `Cannot find module '../src/kit/sound'`.

- [ ] **Step 3: Implement**

`core/engines/whatif/src/kit/sound.ts`:

```ts
import { createContext, useContext } from "react";

/** True inside a video's sound composition (the audio pass, G4/G5 speed-ups plan): the kit's drawing components
 *  render nothing, so Remotion walks a near-empty tree for the <Audio> elements. Sounds must sit outside <Stage>. */
export const SoundOnly = createContext(false);
export const useSoundOnly = () => useContext(SoundOnly);
```

In each of `Stage`, `Finish`, `Figure`, `PauseBars` and `Light`, call `useSoundOnly()` first among the hooks and
return `null` after the last hook when it is true. `Stage` becomes:

```tsx
}> = ({ cam, radius, origin, sky, back, actors, front }) => {
  const soundOnly = useSoundOnly();
  const look = useLook();
  if (soundOnly) return null;
```

`Finish` (no hooks today) becomes a block body starting `if (useSoundOnly()) return null;`; `Figure` and `PauseBars`
start with the same line; `Light` reads `const soundOnly = useSoundOnly();` before `useLook()` and returns `null` after
it. Add `import { useSoundOnly } from "../sound";` (`"./sound"` paths as the folder needs) to each file.

In `studio-whatif-rough-cut.md`, add to step 1:

```markdown
   `scenes/Root.tsx` registers two compositions with the same props: `RoughCut` (the film) and `RoughCutSound`, the
   film inside `<SoundOnly.Provider value={true}>` (`@whatif/kit/sound`), which the audio pass renders. Put every
   `<Audio>` outside `<Stage>` (as video 1's beats do), or the sound composition drops it.
```

- [ ] **Step 4: Run the engine suite**

Run: `cd core/engines/whatif && npx vitest run && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 5: Measure on video 1 and prove it is the same mix (under the queue)**

Add `RoughCutSound` to a scratch copy of video 1's `scenes/Root.tsx` (folder
`channels/say-suppose/videos/2026-11-10_plan-check-sound`, deleted afterwards), then render, all with
`whatif_render`: `mode: audio composition: RoughCut` to `a-film.wav` and `mode: audio composition: RoughCutSound` to
`a-sound.wav`. Null-test them:

```bash
ffmpeg -v error -i a-film.wav -i a-sound.wav -filter_complex \
  "[1:a]volume=-1[b];[0:a][b]amix=inputs=2:normalize=0,volumedetect" -f null - 2>&1 | grep max_volume
```

Expected: `max_volume` at or below -50 dB, and `python -m studio.jobs report --video 2026-11-10_plan-check-sound
--step whatif_render.audio` shows the two runs. The target for the sound composition is 5 min or less for the whole
film (against 1,301 s); record both numbers in the PR. If it misses the target, keep the kit change only if it is at
least twice as fast, and say so in the PR.

- [ ] **Step 6: Commit**

```bash
git add core/engines/whatif/src/kit/sound.ts core/engines/whatif/src/kit/stage/Stage.tsx \
  core/engines/whatif/src/kit/rig/Figure.tsx core/engines/whatif/src/kit/stage/PauseBars.tsx \
  core/engines/whatif/src/kit/stage/Look.tsx core/engines/whatif/tests/sound.test.ts \
  core/openmontage/skills/studio/studio-whatif-rough-cut.md
git commit -m "feat(whatif-kit): a sound composition that draws nothing, for fast audio passes"
```

---

### Task 5: Beat segments and cache keys

**Files:**
- Modify: `core/openmontage/tools/studio/studio_whatif_cache.py` (append)
- Test: `core/studio/tests/test_whatif_cache.py` (append)

**Interfaces:**
- Consumes: `file_sha`, `manifest`, `digest`, `code_roots`, `SCHEMA` from Task 4.
- Produces: `@dataclass(frozen=True) Beat(id: str, first_line: int, files: tuple[str, ...], freezes: tuple[str, ...])`;
  `@dataclass(frozen=True) Segment(id: str, start: int, end: int)` (frames `[start, end)`);
  `load_beats(scenes: Path) -> list[Beat]` (reads `scenes/beats.json`); `segments(beats: list[Beat], timeline: dict)
  -> list[Segment]`; `segment_keys(*, scenes: Path, engine: Path, public: Path, props: Path, beats: list[Beat],
  quality: str) -> dict[str, str]` (beat id -> 16-hex key).

`scenes/beats.json` is the one list of a video's beats, read by Python here and by the video's TypeScript
(`import meta from "./beats.json"` in `scenes/beats/index.ts`, so `firstLine` lives in one place):

```json
[
  {"id": "opening", "firstLine": 0, "files": ["beats/Opening.tsx", "beats/Opening.*.tsx"], "freezes": ["firstDays"]},
  {"id": "firstDays", "firstLine": 1, "files": ["beats/FirstDays.tsx", "beats/FirstDays.*.tsx"]}
]
```

`files` are globs relative to `scenes/` for the files only that beat reads. Every other file under `scenes/` (sets,
parts, `shared.ts`, `Film.tsx`, `beats.json` itself) is shared. `freezes` names beats whose frames this beat's
segment shows through a `<Freeze>` (video 1's title card freezes two frames, both inside the Opening, so it needs
none; a card that froze the next beat's first frame would list that beat).

- [ ] **Step 1: Write the failing tests**

Append to `core/studio/tests/test_whatif_cache.py`:

```python
def _keys(video, quality="preview"):
    beats = C.load_beats(video["scenes"])
    return C.segment_keys(scenes=video["scenes"], engine=video["engine"], public=video["public"],
                          props=video["props"], beats=beats, quality=quality)


def test_segments_run_from_each_beats_first_line_to_the_next(video):
    beats = C.load_beats(video["scenes"])
    timeline = json.loads(video["props"].read_text())["timeline"]
    assert C.segments(beats, timeline) == [C.Segment("a", 0, 40), C.Segment("b", 40, 90)]


def test_a_change_to_one_beats_files_changes_only_its_key(video):
    before = _keys(video)
    _write(video["scenes"] / "beats" / "A.part.tsx", "// restaged\n")
    after = _keys(video)
    assert after["a"] != before["a"] and after["b"] == before["b"]


@pytest.mark.parametrize("rel", ["scenes/shared.ts", "scenes/Film.tsx", "engine/src/kit/theme.ts",
                                 "channels/say-suppose/brand/IdentC.tsx", "assets/narration/props.json",
                                 "assets/images/sky.png"])
def test_a_shared_change_changes_every_key(video, tmp_path, rel):
    before = _keys(video)
    roots = {"scenes": video["scenes"], "engine": video["engine"], "channels": tmp_path / "channels",
             "assets": video["public"]}
    head, _, rest = rel.partition("/")
    path = roots[head] / rest if head != "channels" else tmp_path / rel
    _write(path, path.read_text() + " ")
    after = _keys(video)
    assert after["a"] != before["a"] and after["b"] != before["b"]


def test_a_sound_asset_changes_no_key(video):
    before = _keys(video)
    _write(video["public"] / "sfx" / "pop.wav", "louder")
    assert _keys(video) == before


def test_a_beat_that_freezes_another_follows_its_changes(video):
    meta = json.loads((video["scenes"] / "beats.json").read_text())
    meta[1]["freezes"] = ["a"]
    _write(video["scenes"] / "beats.json", json.dumps(meta))
    before = _keys(video)
    _write(video["scenes"] / "beats" / "A.tsx", "// new pose\n")
    after = _keys(video)
    assert after["a"] != before["a"] and after["b"] != before["b"]


def test_preview_and_final_keys_differ(video):
    assert _keys(video, "preview") != _keys(video, "final")


@pytest.mark.parametrize("meta, message", [
    ([{"id": "a", "firstLine": 0, "files": ["beats/*.tsx"]}, {"id": "b", "firstLine": 1, "files": ["beats/B.tsx"]}],
     "claimed by both"),
    ([{"id": "a", "firstLine": 1, "files": []}], "first beat"),
    ([{"id": "a", "firstLine": 0, "files": []}, {"id": "b", "firstLine": 0, "files": []}], "increase"),
    ([{"id": "a", "firstLine": 0, "files": [], "freezes": ["z"]}], "unknown beat"),
])
def test_bad_beat_lists_are_refused(video, meta, message):
    _write(video["scenes"] / "beats.json", json.dumps(meta))
    with pytest.raises(ValueError, match=message):
        _keys(video)
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd core/openmontage && PYTHONPATH="$PWD:$PWD/.." /Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv/bin/python -m pytest ../studio/tests/test_whatif_cache.py -q`
Expected: `AttributeError: module ... has no attribute 'load_beats'`.

- [ ] **Step 3: Implement (append to `studio_whatif_cache.py`)**

```python
import fnmatch
from dataclasses import dataclass


@dataclass(frozen=True)
class Beat:
    id: str
    first_line: int
    files: tuple[str, ...]
    freezes: tuple[str, ...] = ()


@dataclass(frozen=True)
class Segment:
    """Frames [start, end) of the film; Remotion's --frames takes start-(end - 1)."""

    id: str
    start: int
    end: int


def load_beats(scenes: Path) -> list[Beat]:
    raw = json.loads((scenes / "beats.json").read_text(encoding="utf-8"))
    beats = [Beat(str(b["id"]), int(b["firstLine"]), tuple(b.get("files", [])), tuple(b.get("freezes", [])))
             for b in raw]
    ids = [b.id for b in beats]
    if not beats or beats[0].first_line != 0:
        raise ValueError("beats.json: the first beat must start at line 0")
    if len(set(ids)) != len(ids) or any(a.first_line >= b.first_line for a, b in zip(beats, beats[1:])):
        raise ValueError("beats.json: ids must be unique and firstLine must increase")
    for b in beats:
        unknown = set(b.freezes) - set(ids)
        if unknown:
            raise ValueError(f"beats.json: {b.id} freezes unknown beat {sorted(unknown)}")
    return beats


def segments(beats: list[Beat], timeline: dict[str, Any]) -> list[Segment]:
    clips, total = timeline["clips"], int(timeline["totalFrames"])
    starts = [0 if b.first_line == 0 else int(clips[b.first_line]["from"]) for b in beats]
    ends = [*starts[1:], total]
    return [Segment(b.id, s, e) for b, s, e in zip(beats, starts, ends) if e > s]


def _own_files(scenes: Path, beats: list[Beat]) -> dict[str, set[str]]:
    rels = [p.relative_to(scenes).as_posix() for p in scenes.rglob("*") if p.is_file()]
    own = {b.id: {r for r in rels if any(fnmatch.fnmatch(r, g) for g in b.files)} for b in beats}
    for a in beats:
        for b in beats:
            both = own[a.id] & own[b.id] if a.id < b.id else set()
            if both:
                raise ValueError(f"beats.json: {sorted(both)} claimed by both {a.id} and {b.id}")
    return {k: {f"scenes/{r}" for r in v} for k, v in own.items()}


def segment_keys(*, scenes: Path, engine: Path, public: Path, props: Path, beats: list[Beat],
                 quality: str) -> dict[str, str]:
    """Beat id -> cache key. A key changes with the beat's own files or a frozen beat's, anything shared (scene files
    no beat claims, the kit, the brand kit, the engine config and lock), props.json, a non-audio asset, or quality."""
    files = manifest(code_roots(scenes / "index.ts", engine))
    own = _own_files(scenes, beats)
    claimed = set().union(*own.values())
    common = digest({"shared": digest({k: v for k, v in files.items() if k not in claimed}),
                     "props": file_sha(props), "assets": digest(manifest({"assets": public}, skip_audio=True)),
                     "quality": quality, "schema": SCHEMA})
    return {b.id: digest({"common": common,
                          "beat": digest({k: files[k] for bid in (b.id, *b.freezes) for k in own[bid]})})[:16]
            for b in beats}
```

Move the two new imports to the top of the module with the others.

- [ ] **Step 4: Run the tests**

Run: as in Step 2. Expected: all pass, each under 2 s.

- [ ] **Step 5: Lint and commit**

```bash
make precommit
git add core/openmontage/tools/studio/studio_whatif_cache.py core/studio/tests/test_whatif_cache.py
git commit -m "feat(whatif): beat segments and cache keys from scenes/beats.json"
```

---

### Task 6: `whatif_beats`: render the changed beats, stitch the rest

**Files:**
- Modify: `core/openmontage/tools/studio/studio_whatif_tools.py` (new `WhatifBeats`)
- Modify: `core/openmontage/pipeline_defs/studio-whatif.yaml` (`whatif_beats` on rough_cut and final_edit)
- Test: `core/studio/tests/test_whatif_tools.py`

**Interfaces:**
- Consumes: `C.load_beats`, `C.segments`, `C.segment_keys`, `C.write_sidecar` (Tasks 4-5); `PREVIEW_SCALE` (Task 3); `_WhatifTool.queue`, `after` (Task 2).
- Produces: tool `whatif_beats`, inputs `channel`, `video`, `output` (inside the video's `renders/`), `composition`
  (default `"RoughCut"`); timing step `whatif_beats.720p`; cache files `renders/cache/<beat id>-<key>.mp4`; result
  `data["rendered"]` and `data["reused"]` (beat ids); a `mode: "beats"` sidecar beside `output`, which `whatif_mux`
  accepts as a picture pass.

- [ ] **Step 1: Write the failing tests**

```python
def _beats_video(tmp_path, monkeypatch, video_fixture):
    """Point the tools at a tmp studio holding the cache tests' video."""
    monkeypatch.setattr(wt, "STUDIO_ROOT", tmp_path)
    monkeypatch.setattr(wt, "ENGINE", video_fixture["engine"])
    return {"channel": "say-suppose", "video": "2026-11-10_x",
            "output": str(video_fixture["folder"] / "renders" / "beats-preview.mp4")}


def test_beats_renders_every_beat_the_first_time(tmp_path, monkeypatch, video):
    inputs = _beats_video(tmp_path, monkeypatch, video)
    cmds, _ = wt.WhatifBeats().command(inputs)
    renders = [c for c in cmds if c[:3] == ["npx", "remotion", "render"]]
    assert [c for c in renders if "--frames=0-39" in c] and [c for c in renders if "--frames=40-89" in c]
    assert all("--muted" in c and f"--scale={wt.PREVIEW_SCALE}" in c for c in renders)
    assert cmds[0][:3] == ["npx", "remotion", "bundle"] and cmds[-1][0] == "ffmpeg" and "concat" in cmds[-1]


def test_beats_reuses_a_cached_beat(tmp_path, monkeypatch, video):
    inputs = _beats_video(tmp_path, monkeypatch, video)
    keys = wt.C.segment_keys(scenes=video["scenes"], engine=video["engine"], public=video["public"],
                             props=video["props"], beats=wt.C.load_beats(video["scenes"]), quality="preview")
    cache = video["folder"] / "renders" / "cache"
    cache.mkdir(parents=True)
    (cache / f"a-{keys['a']}.mp4").write_bytes(b"cached")
    cmds, _ = wt.WhatifBeats().command(inputs)
    renders = [c for c in cmds if c[:3] == ["npx", "remotion", "render"]]
    assert len(renders) == 1 and "--frames=40-89" in renders[0]


def test_beats_output_stays_in_the_videos_renders_folder(tmp_path, monkeypatch, video):
    inputs = _beats_video(tmp_path, monkeypatch, video)
    with pytest.raises(ValueError, match="renders"):
        wt.WhatifBeats().command({**inputs, "output": str(video["folder"] / "beats.mp4")})
```

Move the `video` fixture from `test_whatif_cache.py` to `core/studio/tests/conftest.py` (or a shared
`core/studio/tests/whatif_fixtures.py` imported by both modules) so both test modules use it. Add `"whatif_beats"` to
`NAMES`.

- [ ] **Step 2: Run them to see them fail**

Run: as in Task 4, Step 2. Expected: `AttributeError: ... no attribute 'WhatifBeats'`.

- [ ] **Step 3: Implement**

```python
class WhatifBeats(_WhatifTool):
    name = "whatif_beats"
    capability = "video_composition"
    determinism = Determinism.DETERMINISTIC
    queue = "render"
    capabilities = ["beat_cache", "paper_cut_render"]
    best_for = ["a 720p G4/G5 picture pass where only some beats changed: renders those, reuses the rest"]
    not_good_for = ["the G6 render: that is one whatif_render quality=final", "a video with no scenes/beats.json"]
    input_schema = {"type": "object", "required": ["channel", "video", "output"], "properties": {
        "channel": {"type": "string"}, "video": {"type": "string"},
        "output": {"type": "string", "description": "the stitched, muted 1280x720 picture, inside renders/"},
        "composition": {"type": "string", "default": "RoughCut"},
        "queue_wait_seconds": {"type": "number", "default": 7200}}}

    def timing_step(self, inputs: dict[str, Any]) -> str:
        return "whatif_beats.720p"

    def _layout(self, inputs: dict[str, Any]):
        folder = video_dir(inputs)
        scenes, public = folder / "scenes", folder / "assets"
        props = public / "narration" / "props.json"
        beats = C.load_beats(scenes)
        segs = C.segments(beats, json.loads(props.read_text(encoding="utf-8"))["timeline"])
        keys = C.segment_keys(scenes=scenes, engine=ENGINE, public=public, props=props, beats=beats,
                              quality="preview")
        cache = folder / "renders" / "cache"
        return folder, scenes, public, props, [(s, cache / f"{s.id}-{keys[s.id]}.mp4") for s in segs]

    def command(self, inputs: dict[str, Any]):
        folder, scenes, public, props, parts = self._layout(inputs)
        output = inside(inputs["output"])
        if not output.is_relative_to(folder / "renders"):
            raise ValueError("beat previews go in the video's renders/ folder (git-ignored)")
        cache = folder / "renders" / "cache"
        cache.mkdir(parents=True, exist_ok=True)
        bundle, comp = cache / "bundle", str(inputs.get("composition", "RoughCut"))
        missing = [(s, f) for s, f in parts if not f.is_file()]
        cmds = []
        if missing:
            cmds.append(["npx", "remotion", "bundle", str(scenes / "index.ts"), f"--out-dir={bundle}",
                         f"--public-dir={public}", "--log=error"])
        for s, f in missing:
            part = f.with_name(f.stem + ".part.mp4")  # a killed render never leaves a file under the real key
            cmds.append(["npx", "remotion", "render", str(bundle), comp, str(part), f"--props={props}",
                         f"--frames={s.start}-{s.end - 1}", "--muted", f"--scale={PREVIEW_SCALE}",
                         "--log=error"])
            cmds.append(["mv", str(part), str(f)])
        listing = cache / f"{output.stem}.concat.txt"
        listing.write_text("".join(f"file '{f}'\n" for _, f in parts), encoding="utf-8")
        cmds.append(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
                     "-c", "copy", str(output)])
        return cmds, dict(os.environ)

    def _run(self, inputs: dict[str, Any]) -> ToolResult:
        try:
            *_, parts = self._layout(inputs)
        except (ValueError, OSError) as exc:
            return ToolResult(success=False, error=str(exc))
        rendered = [s.id for s, f in parts if not f.is_file()]  # before the run: afterwards every file exists
        result = super()._run(inputs)
        result.data["rendered"] = rendered
        result.data["reused"] = [s.id for s, _ in parts if s.id not in rendered]
        return result

    def after(self, inputs: dict[str, Any], result: ToolResult) -> ToolResult:
        if result.success:
            _, scenes, _, props, _ = self._layout(inputs)
            # frames "all" matches an audio pass rendered without `frames`, so whatif_mux accepts the pair.
            C.write_sidecar(inside(inputs["output"]), mode="beats", quality="preview", props=props,
                            entry=scenes / "index.ts", engine=ENGINE, frames="all")
        return result
```

Add `whatif_beats` to `tools_available` on rough_cut and final_edit in `studio-whatif.yaml` and to the module
docstring.

- [ ] **Step 4: Run the tests**

Run: as in Task 4, Step 2. Expected: all pass.

- [ ] **Step 5: Verify a stitched picture matches a full render (one render session, under the queue)**

On a copy of video 1 with a `scenes/beats.json` written from its `BEATS` list (`opening` 0, `firstDays` 10,
`dayTwelve` 22, `catch` 35, `longRun` 49, `ending` 60; files `beats/<Name>.tsx` and `beats/<Name>.*.tsx`, with
`FirstDays.common.tsx` and `Catch.rig.tsx` falling under their beat's glob; no `freezes`), in a scratch folder under
`channels/say-suppose/videos/` that is deleted afterwards. Its segments are 1,603, 1,791, 1,499, 2,136, 1,760 and 644
frames (7-23% of 9,433):

1. `whatif_beats` to `renders/beats-a.mp4` (renders all six beats). Note the `whatif_beats.720p` seconds.
2. `whatif_render` `mode: picture` to `renders/full-a.mp4` (720p, one render).
3. `ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0` on both:
   both equal `totalFrames` from props.json.
4. `ffmpeg -v error -i renders/beats-a.mp4 -i renders/full-a.mp4 -lavfi ssim -f null - 2>&1 | tail -1`: `All:` at or
   above 0.98 (encoder differences only).
5. Touch one beat's file (a comment), run `whatif_beats` to `renders/beats-b.mp4`: `data["rendered"]` is that one
   beat, and its seconds are close to that beat's share of the full render.
6. `whatif_render` `mode: audio` to `renders/aud.wav`, then `whatif_mux` `beats-b.mp4` with it: success.

Record the numbers from steps 1, 2 and 5 in the PR description.

- [ ] **Step 6: Lint and commit**

```bash
make precommit
git add core/openmontage/tools/studio/studio_whatif_tools.py core/openmontage/pipeline_defs/studio-whatif.yaml \
  core/studio/tests/test_whatif_tools.py core/studio/tests/test_whatif_cache.py core/studio/tests/conftest.py
git commit -m "feat(whatif): whatif_beats renders only the beats that changed and stitches the picture"
```

---

### Task 7: The preview ladder in the G4 skill, and the first measurement

**Files:**
- Modify: `core/openmontage/skills/studio/studio-whatif-rough-cut.md`
- Create (after film 1 of batch 1 passes G5): `docs/superpowers/calibration/2026-11-g4-g5-speedups.md`

- [ ] **Step 1: Write the ladder into the G4 skill**

Replace step 5 of `studio-whatif-rough-cut.md` (as edited in Task 3) with:

```markdown
5. Check frames with `whatif_stills`. Write `scenes/beats.json` (one entry per beat: `id`, `firstLine`, the `files`
   only that beat reads, and `freezes` for any beat whose frames it shows) and have `scenes/beats/index.ts` read
   `firstLine` from it. Then build the watch copy, every time at 1280x720 in `renders/`:
   - the picture: `whatif_beats` (only beats whose code, or the shared code, props or images changed re-render);
     without `beats.json`, `whatif_render` `mode: picture`;
   - the sound: `whatif_render` `mode: audio`, `composition: RoughCutSound`, to a `.wav`;
   - the watch file: `whatif_mux` of the two, then `omni qc` on it.
   A sound-only note after that is an audio pass and a mux (`studio-whatif-edit`). G4 and G5 are always watched at
   720p; the one 1920x1080 render is made at G6. Every render tool waits for the render queue itself.
```

- [ ] **Step 2: Commit**

```bash
git add core/openmontage/skills/studio/studio-whatif-rough-cut.md
git commit -m "docs(whatif): the G4 preview ladder: beats, audio pass, mux, 720p"
```

- [ ] **Step 3: After film 1 of batch 1 passes G5, write the measurement**

Run `python -m studio.jobs report --video <film 1 id> --step whatif_` (command in "How to measure" above) and
write `docs/superpowers/calibration/2026-11-g4-g5-speedups.md`: the report table, the baseline (video 1:
7.6 h of 1080p renders), the hours saved per change against the estimates in this plan, how many G4/G5
rounds were sound-only and how many touched one beat, and the gaps between the `history/checkpoint_rough_cut_*` and
`final_edit` timestamps (hours from a note to the next watch). This is the evidence for the owner's decision 3 below.

---

## Self-review

- **Spec coverage.** Section 5 item 5 names beat caching (Tasks 5-6), audio outside the picture (Tasks 4 and 4b) and 720p
  previews (Task 3); its measure, "renders per gate; hours from G4 note to the next watch", is Task 1 plus Task 7
  step 3. Room 4 ("watches a 720p cut, one 1080p render is kept for G6") and Room 6 (the media proof covers the exact
  file) are kept by Task 3's final-quality rules and the G6 skill text. The render queue (CLAUDE.md) is Task 2.
- **Not in this plan.** The slide detector and frame-pack room (item 7) and the look test (item 8) run on these cheap
  previews but have their own plans. Cloud renders (portable compute B2-B4) wait for B1 timings, which Task 1 now
  produces for the what-if engine.
- **Names checked across tasks.** `PREVIEW_SCALE`, `QUALITIES`, `MODES`, `C.write_sidecar`,
  `C.read_sidecar`, `C.changed_files`, `C.load_beats`, `C.segments`, `C.segment_keys`, `timing_step`, `after`,
  `_run`, `queue`, `HELD_ENV`, `SoundOnly`, `useSoundOnly`, `RoughCutSound` are defined once and used with the same
  signatures.
- **Measured, not assumed.** The scale, the absent preset, the audio pass time and the mux time come from the
  benchmark above; the 5-minute sound-composition target and the whole-film 720p time are checked in Task 4b step 5
  and Task 3 step 5 before anyone relies on them.

## Built and measured (2026-11-10)

Tasks 1, 2, 3, 4, 4b and 7 step 1 are built (branch `claude/say-suppose-g4g5-speedups`). Tasks 5-6 wait for film 1's
numbers. Measured on video 1 through the tools, under the render queue, with `studio.jobs report --video
2026-11-10_plan-check-sound --step whatif_`:

| Step | Seconds | Against the estimate |
|---|---|---|
| `whatif_render.full-720p`, the whole film (9,433 frames, 1280x720, with audio) | 1,918.9 | 32 min, against 28 estimated |
| `whatif_render.audio` with `RoughCutSound`, the whole film | 60.4 | 1 min, against the 5-minute target and 1,301 s before |
| `whatif_render.picture-720p`, frames 0-299 | 78.2 | |
| `whatif_mux` | 0.4 | 300 frames at 1280x720 out |

The sound composition's whole-film wav is byte-identical to the full film's (`cmp`; null test -91 dB), so the audio
pass is the same mix. With these numbers the video 1 replay is 2.2 h saved by 720p previews (6 x 32 + 65 = 257 min
against 390) and 1.6 h by the audio pass and mux (32 -> 1 min once, 22 -> 1 min three times): 3.8 of 7.6 h, as
estimated.

/simplify changes against the tasks above: `hold` itself is re-entrant for a child of a `studio.jobs run --queue`
holder (`queue.HELD_ENV`, `held_by_parent`, `env_holding`), so the tools no longer read the variable; tool rows time
the work inside the queue, not the wait; sidecars carry `mode`, `props_sha256`, `frames` and `files` only (no
`quality`, no `scenes_sha256`); an entry outside a `scenes/` folder or the engine's `examples/` is refused; the mux
accepts only `picture` passes until beat caching adds its own; `Light` has no SoundOnly gate (it is drawn only
inside `Stage`).

## Decisions for the owner

Each is a yes or no, or a pick. Nothing is built until the owner says so; none of them is a gate approval.

**Owner's answers, 2026-11-10:** 1 yes, 2 yes, 3 after film 1's numbers. Build Tasks 1-4b and 7 now. Tasks 5-6
(beat caching) wait for the calibration note from Task 7 step 3, and the owner decides on them then.

1. **720p for every G4 and G5 watch, 1080p only at G6** (Task 3, about 2.6 h of render a video). You would watch
   rough cuts and edits at 1280x720 and see 1080p once, at G6, after G5 passes (one extra render at that point, which
   the estimate already counts; G7 prep runs beside it). Notes on colour, staging, music and pace read at 720p; fine
   text and paper grain read less well. Yes or no.
2. **A sound note is a fast audio pass and a mux** (Tasks 4 and 4b, about 1.2 h a video). Sound-only G5 rounds (four
   of six on video 1) arrive in about 5 minutes instead of 22-28. The kit gains a `SoundOnly` switch that each video's
   `Root.tsx` uses for a second composition. The G6 file is still one full render with its audio inside. Yes or no.
3. **Beat caching now, or after film 1's numbers** (Tasks 5-6). It is the largest build, saved nothing on video 1
   (every round there moved shared timing or code), and with 720p previews a one-beat round saves about 23 minutes.
   Pick: build it with the rest, or build Tasks 1-4b and 7 now and decide on 5-6 when the calibration note (Task 7
   step 3) shows how many of film 1's rounds touched one beat. Recommended: after film 1's numbers.
