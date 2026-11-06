# Phase 3: Professor of Us engine

Goal: Professor of Us runs from omni-studio. faceless-channel and the sandbox stay untouched.

## What came over, and how

| Item | From | How |
|---|---|---|
| Engine: 21 scripts, 18 test files (161 collected cases) | faceless-channel `scripts/`, `tests/` at a2c04b0 | `git filter-repo` 2.47.0 on a fresh `--no-local` clone, merged with history into `core/engines/pou/` |
| Channel text: style, cast, voice notes, backlog, analytics, rig specs, LoRA notes | faceless-channel at a2c04b0 | `git show`, so only committed text |
| Font (Patrick Hand, OFL) | faceless-channel `channel/fonts/` | tracked in `channels/professor-of-us/fonts/` (220 KB; channel-only, so not in a shared folder) |
| LoRA `pous_ink.safetensors` (92 MB), built rig cut-outs (16 MB), 29 rig source stills (74 MB), the tails Short's assets and narration | faceless-channel working tree | copied, git-ignored |
| Playbook | sandbox `styles/stickman-explainer.yaml` at 63c1736 | `git show`, renamed identity |
| Music cue `cue-01-question.mp3` | sandbox `music_library/` | copied, git-ignored |

## Decisions

- Engine paths come from `channels/<slug>/engine.yaml` (`pou_paths.py`), not the old repo root. Video paths in
  stage.json and rig specs are relative to the channel folder; the tails files were rewritten from `shorts/...`
  to `videos/...`.
- A Short lives in `videos/` like a long video. `overlay_check.py` finds it by `anim.json` (or `--size`).
- `.venv-media` replays faceless-channel's working package set exactly (`requirements-media.lock.txt`,
  `--no-deps`): its top-level pins do not resolve together (mflux 0.24.0 declares transformers >= 5.5; the
  working venv runs 5.2.0). faster-whisper moved in from the sandbox venv.
- Gate stages: G1 `proposal`, G2 `dialogue_script`, G3 `narration`, G4 `rough_cut`, G5 `final_edit`,
  G6 `final_watch`, G7 `publish_prep`. G1 keeps the upstream name because upstream contracts require a
  `proposal` stage; the others avoid `script`/`edit`/`publish`, which demand upstream artifacts.
- Patch 9: `omni approve` signs an HMAC proof; `lib/checkpoint.py` refuses unproven approvals on channel
  projects. It stops direct and hand-edited approvals, not a process that reads the key.
- No click scanner existed (the owner's `popscan.py` was scratch), so `audio_check.py` is new.

## Verification

Exit checks were run at the final commit; results are in the PR description.
