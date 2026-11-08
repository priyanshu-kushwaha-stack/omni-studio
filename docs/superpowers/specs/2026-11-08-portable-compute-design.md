# Portable compute: heavy jobs in the cloud, the Mac as fallback

Owner direction, 2026-11-08: "This repo should be portable that is I should be able to run a few things on the
cloud as well with more resources as currently its running very slow. Need to optimise the complete process and
then use that. I will be reviewing everything in local but things can run in the cloud ... and when cloud is not
available then fallback to local machine." Kubernetes was discussed and deferred ("We will come to that later").

Split out of the quality spine spec (`2026-11-08-quality-spine-design.md`) on both Cursor reviewers' advice: it has
its own storage, secrets, billing and portability concerns. Nothing here runs a paid call until the owner approves a
budget.

## Goal

Know where the time goes, make the cheap local fixes, then let the slowest heavy steps run on cloud GPUs or CPUs with
the same inputs and outputs, falling back to the Mac when the cloud is unavailable, off, or over budget. Review,
gates and uploads never leave the Mac.

## What stays on the Mac

The owner's review, every gate, `omni approve`, the approval key, YouTube tokens, `omni upload`, and the quality
room's model calls. Cloud jobs produce files only.

## What ties the repo to this Mac today

- Qwen3-TTS runs through `mlx-audio` (`core/engines/pou/scripts/tts.py`) and stills through `mflux` FLUX.2 klein with
  the channel LoRA (`stills.py`): Apple-only.
- Voice reference clips, LoRA weights, music cues, rig cut-outs and `.tools/` are git-ignored and live only here.
- Docker on macOS cannot reach the Apple GPU, so the Mac fallback runs natively, not in containers.

## B1: measure first (no cloud, no cost)

No step records its run time. B1 adds a timing record for every heavy step on every channel (step, channel, video,
machine, wall time, inputs size), written to the same git-ignored state folder as the room ledger
(`~/.local/state/omni-studio/jobs/timings.jsonl`). It wraps the engine entry points without editing them while the
channel branches are open. After a week of real runs: a ranked list of where the time goes, and the cheap fixes
(lower-resolution G4 previews, re-render only changed scenes, cache voice takes by hash, run independent steps side
by side).

## B2-B4: jobs with interchangeable backends

**Job.** Every heavy step becomes a job with declared inputs and outputs. Its key is the sha256 of: the code version
(git tree hash of the script and the container image digest), the model revision, every input file's hash (voice
references and LoRA included), the settings, the seed, and the **backend family** (`mps` or `cuda`), since the same
seed gives different output on each. A job is complete only when every declared output exists and its hash is
recorded; partial output is discarded. A complete key never runs again.

**Backends.** `local | modal | runpod`, later `k8s` from the same images. `auto` picks the cloud only when the owner
has set a budget, the cloud answers a health check within 10 s, and the job's estimate fits; otherwise it runs on the
Mac. Every output records its backend.

**Parity.** CUDA paths for Qwen3-TTS and FLUX (diffusers) beside the MLX ones; each channel LoRA must load on both.
The owner approves a channel's cloud voice by ear once before it switches. One video's narration uses one backend
family.

**Artifacts.** Cloudflare R2 (no download fees), keyed by hash, with a manifest in git; media stays out of git. Cloud
images built from the lock files, digests pinned in `core/lock.yaml`, with a CUDA media lock beside
`requirements-media.lock.txt`.

**Secrets.** Cloud jobs get only their inputs and a short-lived storage token. Modal and R2 keys live under
`~/.config/omni-studio/`. Like `omni upload` today, one named command (`omni job run`) is the only code that reads
them, in memory; agents never read or print them. This needs a line in CLAUDE.md next to the `omni upload` exception.

**Budget and approval.** Off by default. The owner sets a monthly cloud budget (suggested: $30, Modal's monthly
credit) and that approval is recorded in the repo; each job's estimate and actual cost go to the job log; once the
month's budget is spent, jobs run on the Mac. Without a recorded budget, `auto` means local.

**Platform.** Modal first (Python-native, weights on a volume, results return to the local command), RunPod as
backup. Skipped: cloud Macs (24-hour minimum, not faster than an M1 Max), Fly GPUs (shut down August 2026), Remotion
Cloud Run (unmaintained alpha). Kubernetes later, as a `k8s` backend on the same images, once load is steady.

## Rough costs (Modal, from the 2026-11-08 research)

| Job | Cost |
|---|---|
| 10 min of voice (L4) | $0.15-0.70 (Chatterbox low, Qwen3 high) |
| 20 FLUX stills (L40S) | about $0.20 |
| One LoRA training run (H100, ~30 min) | $2-2.50 |
| 6-min 1080p Remotion render (CPU) | $0.15-0.30 |
| One music track, 10 min of transcription | about $0.05 each |

## Phases

| Phase | Done when |
|---|---|
| B1 Measure | a week of timed runs on all channels, a ranked list, cheap local fixes proposed |
| B2 Job runner | one job (Chatterbox voice) runs on Modal or the Mac; a repeat is a cache hit; mps and cuda keys differ |
| B3 CUDA paths | Qwen3 and FLUX on CUDA, LoRAs load on both, cloud voices approved by ear |
| B4 Renders | the slowest of renders, music and transcription moved, per B1 |

B2 onward edits engine scripts the channel sessions use; those edits wait until the channel branches merge.

## Decisions

| Decision | Default |
|---|---|
| Cloud budget | none until the owner sets one (suggested $30 a month) |
| Accounts | the owner creates Modal and R2 and stores the keys under `~/.config/omni-studio/` |
