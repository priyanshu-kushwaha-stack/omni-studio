# Say Suppose first-cut review: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Say Suppose's first owner review gets a script, a free local narration (Qwen3 cloned from Arthur) and a
720p first cut; the pipeline has five gates; the story room has two reviewers plus a claims check, and no judge.

**Architecture:** The what-if engine's narration build (`pipeline/build.ts`, `pipeline/voice.ts`) gains a free local
voice route beside the paid Higgsfield one; `story.py` picks local or paid from `voices.yaml`. The `studio-whatif`
pipeline drops the `narration` and `rough_cut` stages (their steps move into the script and edit skills). The room
makes the judge optional. Spec: `docs/superpowers/specs/2026-11-10-say-suppose-first-cut-review-design.md`.

**Tech Stack:** Python 3.12 (studio, pytest), TypeScript (engine, vitest), mlx-audio Qwen3-TTS in `.venv-media`.

## Global Constraints

- No paid provider call is made by any test or by the local route. Paid takes still need `--max-credits` and the
  owner's approval.
- Professor of Us pipelines (`studio-dialogue`, `studio-short`) and its room are unchanged.
- Inside `core/openmontage/`, edit only files with `studio` in the name.
- Ruff, size budgets (500-line modules, 60-line functions), tests under 2 s unless `@pytest.mark.slow`.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Python from the root venv: `cd core && PYTHONPATH="$PWD/openmontage:$PWD" ../.venv/bin/python -m pytest ...`.
  Engine tests: `cd core/engines/whatif && npx vitest run tests/<file>`.

---

### Task 1: The engine's paths keep a symlinked interpreter

**Files:** Modify `core/engines/pou/scripts/pou_paths.py:48-52`; Test `core/engines/pou/tests/test_pou_paths.py`
(create, or add to an existing paths test if one exists).

- [ ] Step 1: failing test. A temp channel folder with `engine.yaml` `media_python: venv/bin/python`, where
  `venv/bin/python` is a symlink to `/usr/bin/true`; `pou_paths.path("media_python")` (with `POU_CHANNEL_DIR` set to
  the folder) must equal `folder/venv/bin/python`, not `/usr/bin/true`.
- [ ] Step 2: run it, expect FAIL (it returns the symlink target).
- [ ] Step 3: in `path()`, replace `(folder / value).resolve()` with `Path(os.path.abspath(folder / value))`
  (normalises `..` without following symlinks); `import os`.
- [ ] Step 4: run the pou suite: `.venv/bin/python -m pytest core/engines/pou/tests -q`. Expect PASS.
- [ ] Step 5: commit `fix(pou): engine paths keep a symlinked interpreter, so local TTS starts in .venv-media`.

### Task 2: `story.py` picks the local or the paid narrator

**Files:** Modify `core/engines/whatif/pipeline/story.py:59-66`; Test `core/studio/tests/test_whatif_story.py`.

**Produces:** a story `voice` of `{"model": "local:qwen3", "voiceType": "local", "voiceId": <sha256[:16] of the
reference wav>, "ref": <path relative to the omni-studio root>, "refText": <transcript>}` when `voices.yaml`'s
narrator has `use: local`; today's paid spec otherwise. `WHATIF_VOICE=paid|local` overrides `use` (the A/B).

- [ ] Step 1: failing tests: (a) narrator with `use: local` and `local: {engine: qwen3, ref: brand/voice/a.wav,
  ref_text: "Hello."}` (a tiny wav written in the test) gives `model == "local:qwen3"`, `ref ==
  "channels/<slug>/brand/voice/a.wav"`, `voiceId` stable across two builds; (b) `WHATIF_VOICE=paid` with the same
  file gives the paid spec; (c) `use: local` with no `local` entry raises `ValueError` naming the narrator.
- [ ] Step 2: run, expect FAIL.
- [ ] Step 3: implement `_voice(channel)`: read `narrator`; `which = os.environ.get("WHATIF_VOICE") or
  narrator.get("use", "paid")`; for `local`, hash the reference file bytes, store `ref` relative to `ROOT`
  (`channel.parent.parent`), engine from `local.engine` (only `qwen3` accepted for now); else today's code.
- [ ] Step 4: run `test_whatif_story.py`, expect PASS.
- [ ] Step 5: commit `feat(whatif): story.py picks the local or the paid narrator`.

### Task 3: The narration build reads local voices for free

**Files:** Modify `core/engines/whatif/pipeline/voice.ts`, `core/engines/whatif/pipeline/build.ts`,
`core/engines/whatif/src/kit/timeline.ts` (VoiceSpec gains optional `ref`, `refText`); Create
`core/engines/whatif/pipeline/local_tts.py`; Test `core/engines/whatif/tests/voice.test.ts`.

**Produces:** `isLocal(v)`, `localText(text)` (bracket directions removed), `cost()` returns 0 for a local voice,
`synthesizeLocal(jobs: {text: string; out: string}[], v)` runs one `local_tts.py` process for all jobs.

- [ ] Step 1: failing vitest cases: `isLocal({model: "local:qwen3", ...})` true and false for `elevenlabs_v4`;
  `localText("[warm] Every morning, she waves. [pause] Not looking.")` is `"Every morning, she waves. Not looking."`;
  `await cost("Hi.", localVoice)` is `0` without calling the Higgsfield CLI.
- [ ] Step 2: `npx vitest run tests/voice.test.ts`, expect FAIL.
- [ ] Step 3: implement. `local_tts.py` reads a JSON spec on stdin `{ref, ref_text, jobs: [[text, out], ...]}`, loads
  `mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16` once, and for each job calls `generate_audio(text=..., model=...,
  ref_audio=ref, ref_text=ref_text, file_prefix=<out without suffix>, audio_format="wav", join_audio=True)`, moving
  `<prefix>_000.wav` to `out` (the code `core/engines/pou/scripts/tts.py:_qwen3` runs today). `synthesizeLocal` resolves
  `ref` against the omni-studio root (`resolve(HERE, "../../../..")`), runs `WHISPER_PY` (the media venv) with that
  script, then converts each output to mono 44.1 kHz like `synthesize`. In `build.ts`: when `isLocal(voice)`, skip the
  quote and the credit cap, call `synthesizeLocal(pending, voice)` once, log `N local take(s), free`.
- [ ] Step 4: vitest PASS; `npx tsc --noEmit` clean.
- [ ] Step 5: commit `feat(whatif): local Qwen3 narration takes, free and cached by line`.

### Task 4: Five gates in `studio-whatif`

**Files:** Modify `core/openmontage/pipeline_defs/studio-whatif.yaml`, `core/studio/checks.py:253`,
`core/openmontage/skills/studio/studio-whatif-script.md`, `studio-whatif-edit.md`, `studio-whatif-final-watch.md`,
`studio-whatif-publish.md`, `studio-room.md`; Delete `studio-whatif-narration.md`, `studio-whatif-rough-cut.md`;
Tests `core/studio/tests/test_studio_whatif.py`, `test_room_skill.py`, `test_whatif_tools.py` (if it names the stages).

- [ ] Step 1: update tests first: `STAGES = ["proposal", "story_script", "final_edit", "final_watch",
  "publish_prep"]`; `stage_checks("studio-whatif", "story_script") == ["claims", "clicks"]`; the audition and look test
  are asserted in `studio-whatif-script.md` and `studio-whatif-edit.md`; a new test that `run_stage` at `story_script`
  reads `narration/narration.wav` (monkeypatch `run_check` and record its `media`).
- [ ] Step 2: run, expect FAIL.
- [ ] Step 3: pipeline yaml: header says five owner gates (G1 Packaging, G2 Story lock, G3 Picture lock, G4 Final
  watch, G5 Publish); remove `narration` and `rough_cut`; `story_script` gets tools `whatif_story, whatif_narration,
  whatif_render, whatif_mux` and review focus "G2 story lock: script and local narration together, read and heard in
  the first cut"; `final_edit` gets the rough-cut review focus and "G3 picture lock: key shot, pacing, text, music and
  mix; the voice the A/B chose"; `studio_checks.story_script: [claims, clicks]`, no `narration` key. `checks.py`: media
  lookup when `stage in ("narration", "story_script")`. Skills: the script skill gains drop 1 (local narration via
  `whatif_story` + `whatif_narration` with no credits) and drop 2 (scenes, `whatif_render quality=preview`, music
  bed, `whatif_mux`), notes tagged by part, the story loop, and the re-open note for a video whose `story_script` was
  approved under seven gates; the edit skill gains the rough-cut build steps, the key-shot pick, and the paid-voice
  A/B (`WHATIF_VOICE=paid`, quote, owner's yes, `whatif_narration` with `owner_approved_paid_call` and `max_credits`).
  The narration and rough-cut skills are deleted (their text moves as above).
- [ ] Step 4: run `core/studio/tests -k "whatif or room_skill or checks"`, expect PASS.
- [ ] Step 5: commit `feat(say-suppose): five gates; narration and rough cut fold into story and picture lock`.

### Task 5: The judge is optional; local voices satisfy `pre_g2_local`

**Files:** Modify `core/studio/room/config.py`, `core/studio/room/__main__.py:274-323`; Test
`core/studio/tests/test_room_config.py`, `test_room_cli.py`.

- [ ] Step 1: failing tests: a room.yaml without `judge:` loads (`cfg.judge is None`) and validates; `room judge`
  with no judge configured exits 0 printing `{"judged": false, "why": "no judge in room.yaml"}` and makes no call;
  `pre_g2_local` accepts `voices: {narrator: {tool: higgsfield elevenlabs_v4, local: {engine: qwen3}}}` and still
  refuses a narrator with no `local` free engine.
- [ ] Step 2: run, expect FAIL.
- [ ] Step 3: `REQUIRED` drops `judge`; `RoomConfig.judge: Optional[str]`; `judge=str(data["judge"]) if
  data.get("judge") else None`; `validate` checks the judge's family only when set; `cmd_judge` returns early when
  `cfg.judge is None`; `_voices_problems` treats a voice as local when `v.get("tool") in LOCAL_TTS or
  (v.get("local") or {}).get("engine") in LOCAL_TTS`.
- [ ] Step 4: run `core/studio/tests -k room`, expect PASS.
- [ ] Step 5: commit `feat(room): the judge is optional; a narrator's local engine satisfies pre_g2_local`.

### Task 6: Say Suppose's room, voices and rules

**Files:** Modify `channels/say-suppose/room.yaml`, `channels/say-suppose/room/README.md`,
`channels/say-suppose/room/seats/story-editor.md`, `channels/say-suppose/voices.yaml`,
`channels/say-suppose/channel.yaml`, `CLAUDE.md`; local only (git-ignored): `channels/say-suppose/brand/voice/arthur-ref.wav`.

- [ ] Step 1: room.yaml: seats `first-time viewer` (viewer, claude-opus-5-5), `story editor` (story,
  gpt-5.6-sol-high), `claims check` (fact, gemini-3.8-flash-high, `room/seats/fact-checker.md`); no director, no
  `judge:`; `pitch_clip: pre_g2_local`; a dated comment citing the spec. Story-editor brief takes the director's
  checks (#2 opening matches the thumbnail in 7 s, #3 a second hook by 0:30, #8 the key shot only this premise can
  show, #10). README seat table and ownership lines to match.
- [ ] Step 2: voices.yaml narrator: `use: local` and `local: {engine: qwen3, ref: brand/voice/arthur-ref.wav,
  ref_text: "You wake up and discover you can pause time. 10 seconds once a day. At first, you use it for dumb things.
  You catch your falling coffee. You dodge your boss in the hallway."}` with a comment that the wav is git-ignored and
  copied in by hand (13 s of Arthur's paid takes from the pause sample, 2026-11-06). Copy the audition's
  `arthur-ref.wav` there in the main checkout.
- [ ] Step 3: channel.yaml "seven owner gates" -> "five owner gates"; CLAUDE.md: the gate table gets a Say Suppose
  column (G1 Packaging, G2 Story lock, G3 Picture lock, G4 Final watch, G5 Publish), "Seven human gates" says
  Professor of Us keeps seven, and G2's "before any asset is generated" becomes "before any paid asset is generated".
- [ ] Step 4: `omni check say-suppose`; room validation `[]`; `make test` all suites pass.
- [ ] Step 5: commit `feat(say-suppose): two reviewers and a claims check; local Qwen3 narrator; five gates in the
  rules`.

### Task 7: Prove it on film 2's opening

- [ ] Build `story.json` for film 2 with `use: local`, run `whatif_narration` (no credits) and confirm the takes are
  made locally, `props.json` is written, and a re-run makes no new take. Report the time per line.
- [ ] Open the PR (`--repo priyanshu-kushwaha-stack/omni-studio`) with the spec, this plan and the results.
