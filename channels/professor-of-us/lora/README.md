# Style LoRA "pous_ink"

Dataset: `dataset/` = 9 style refs (`channel/style_refs/`) + the 72 approved drawings of video 1, long side 1024,
one caption per image written by `scripts/lora_dataset.py` (`pous_ink` style trigger first, `pous_you` when the
satchel figure is in frame, the scene line, then "ochre accents, black marker line on cream paper" so the colour
is a caption, not a baked-in default). Rebuild: `.venv/bin/python scripts/lora_dataset.py --stills <video>/assets/stills --plan <video>/scene_plan.json`.

Base model: FLUX.2 klein base 4B (Apache 2.0). Trainer: `mflux-train` on the Mac (`train.json`), fallback the fal
klein-4B trainer. Weights: `pous_ink.safetensors` (gitignored; path and training log noted below).

## Training log
- 2026-10-28 attempt 1 (768 px, 18 epochs): crashed at the first validation pass with a Metal "Impacting Interactivity"
  timeout while the FLUX.2 smoke test shared the GPU. Lesson: one MLX job on the GPU at a time.
- 2026-10-28 attempt 2: same config, written to `train_<timestamp>/` in the repo root (mflux resolves `output_path`
  from the cwd, and suffixes a timestamp when the folder exists). Stopped, config now points at `channel/lora/train`.
- 2026-10-28 attempt 3 (768 px, 18 epochs = 1,458 iterations): ran at 55-78 s per iteration on the M1 Max (31 h
  projected) with 28 GB of swap in use; the step-0 preview is in `train_attempt3_768px/preview/` (loose wash
  sketch, far from the house style, as expected before training). Stopped at iteration 28.
- 2026-10-28 attempt 4 (512 px, 8 epochs = 648 iterations, bf16): 43 GB process, 31 GB of swap, slowed from 17 to
  30 s per iteration (4.7 h projected). Stopped at iteration 73; outputs in `train_attempt4_512px/`.
- 2026-10-28 attempt 5 (512 px, 8 epochs, `low_ram: true`, `quantize: 8`, checkpoints every 150): 18 GB process,
  no new swap, 11-16 s per iteration, finished in 2 h 57 min; validation loss 0.63 -> 0.49, falling to the end.
  Output `train_20261028_133614/` (checkpoints 150/300/450/600/648 with previews). The step-648 adapter is
  installed as `pous_ink.safetensors`.
- Checkpoint comparison (s002, s004, s040, same seeds, with the raw scene-plan beats as prompts): every checkpoint
  and the base model drew nearly the same composition; the LoRA mostly thins the lines and simplifies the figures
  (648 closest to the house stickmen). The real gap was the prompt: FLUX read "draws in" as a hand with a pencil,
  "ring" as a bowl, "camp" as tents. With literal prompts (`assets/prompts.json`) both LoRA and base land close
  to the Nano Banana originals; the LoRA is a little cleaner and sketchier. Weak point of klein 4B at 4 steps:
  counting ("three figures" came out as one or two) and map scope (North America added) -> re-roll seeds.
