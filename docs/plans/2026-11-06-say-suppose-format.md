# Say Suppose format: implementation plan

Spec: `docs/superpowers/specs/2026-11-06-say-suppose-format-design.md` (owner said "lets go ahead", 2026-11-06).

**Goal:** Say Suppose's channel files record the approved format, a seven-gate `studio-whatif` pipeline exists,
and the owner's two first what-ifs each sit at a gate, never past one.

**First videos (owner, 2026-11-06):**
1. "What if you could pause time for only 10 seconds in a day?"
2. "What would happen if everyone is given Universal Basic Income?"

## Constraints

- Core changes are new `studio`-named files only, listed in `core/PATCHES.md`. No upstream file is edited.
- Do not touch `channels/professor-of-us`, `channels/power-and-citizen`, `channels/see-underneath`,
  `~/Exploration/sandbox/what-if-pause` or `~/Exploration/projects/faceless-channel`.
- No paid call and no generated asset. Never run `omni approve` on a real video; agents write `awaiting_human`.
- Worktree commands: `export PYTHONPATH="$PWD/core/openmontage:$PWD/core" PYTHONDONTWRITEBYTECODE=1` and
  `PY=~/Exploration/projects/omni-studio/.venv/bin/python`. Run `$PY -m studio.cli link` once.
- Commit after each task. No push, no PR.

## Task 1: `studio-whatif` pipeline (test first)

Files:
- Create `core/studio/tests/test_studio_whatif.py`
- Create `core/openmontage/pipeline_defs/studio-whatif.yaml`
- Create `core/openmontage/skills/studio/studio-whatif-{proposal,script,narration,rough-cut,edit,final-watch,publish}.md`
- Modify `core/PATCHES.md`: two rows under "New files with `studio` names"

Steps:
- [ ] Write the test: stages are `proposal, story_script, narration, rough_cut, final_edit, final_watch,
      publish_prep`, all `human_approval_default: true`; every required skill file exists; `stage_checks` returns
      `[]`, `[claims]`, `[claims, clicks]`, `[loudness, clicks, similarity]` (edit and final watch) and
      `[claims, loudness, clicks, similarity, upload_request]`; the manifest body names no `lip_sync` or
      `character_rig_renderer`; on a dummy channel, G2 is refused without a qc report, refused for a spoken digit
      with no claim id, and passes once the digit cites a sourced row while "day twelve" in words needs none.
- [ ] Run `$PY -m pytest core/studio/tests/test_studio_whatif.py -q`: fails, no pipeline named `studio-whatif`.
- [ ] Write the manifest (modelled on `studio-dialogue.yaml`: `render_runtime` external, `tools_available: []`
      on every stage until the engine exists) and the seven skills.
- [ ] Run the test again: passes.
- [ ] Add the PATCHES.md rows. Commit.

Verify: the test file passes; `git diff --stat main -- core/openmontage` shows only new `studio` files.

## Task 2: channel files

Files (all in `channels/say-suppose/`): `channel.yaml`, `style.md`, `playbook.yaml`, `cast.md`, `voices.yaml`,
`backlog/topics.yaml`.

Steps:
- [ ] Add to the test file: `say-suppose` loads with `formats == {"story": "studio-whatif"}`, `cadence == "daily"`,
      `loudness["story"].integrated_lufs == -14`, `budget_usd_per_video == 0`, `status == "draft"`; `voices.yaml`
      has a `narrator` with the Arthur id. Run: fails.
- [ ] `channel.yaml`: formats, cadence, `loudness.story`, comments. Nothing else changes.
- [ ] `style.md`: the spec's format, script rules, look, Shorts and cadence sections, plus where the sample lives.
- [ ] `playbook.yaml`: the sample's palette, Rubik 800, motion and audio rules; must pass the playbook schema.
- [ ] `cast.md`: cast table and script line format (`> SCENE:`, `> BUBBLE:`, `> TAG:`, bare lines are the narrator).
- [ ] `voices.yaml`: the narrator entry. `backlog/topics.yaml`: the two picked topics and the five proposed ones.
- [ ] Run the test, `$PY -m studio.cli check say-suppose` and
      `$PY -m pytest core/studio/tests/test_channel_playbooks.py -q`: all pass. Commit.

Verify: `omni check say-suppose` prints ok; `make test PYTHON=$PY` is green.

## Task 3: both videos to G1 (packaging), then stop

For each topic:
- [ ] `$PY -m studio.cli new-video say-suppose "<working title>" --format story`.
- [ ] Read `core/openmontage/skills/studio/studio-whatif-proposal.md`. Write `packaging.md`: three title and
      thumbnail pairs linted with the yt-package `title.py`, and the premise in two lines.
- [ ] Write a schema-valid `proposal_packet` (`render_runtime: external`, the runtime choice logged) and the
      `proposal` checkpoint with `status: awaiting_human`. Commit.

Verify: `$PY -m studio.cli status` lists both videos with the `proposal` gate pending. Stop for the owner.

## Task 4: scripts to G2, after the owner passes G1

For each video:
- [ ] `research.md`: what the sources say, with URLs fetched and read, not recalled.
- [ ] `claims.md`: one row per real-world claim, with the verbatim quote and status.
- [ ] `script.md` to the spec's beats and script rules, 900 to 1,100 words.
- [ ] `$PY -m studio.cli qc say-suppose <video> story_script` passes (claims).
- [ ] `story_script` checkpoint with `status: awaiting_human`. Commit. Stop for the owner's full read.

Verify: qc prints `[PASS] claims`; no file under `assets/` or `renders/`; `cost_log.json` shows no spend.
