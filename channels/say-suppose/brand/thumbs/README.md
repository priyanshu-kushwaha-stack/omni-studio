# Thumbnail candidates, drawn in code

G1 thumbnails for Say Suppose, drawn with the what-if engine's kit (`core/engines/whatif/src/kit`: the rig, the stage,
the moods, the split-flap) and the channel's tag look (`../thumb_tag.py`). No AI images, no paid calls. Rules:
`../../rules/thumbnails.md` (K1-K15).

| File | What |
|---|---|
| `batch1.ts` | The data: one entry per candidate (video, variable, value, hero pose and face, tag, stake, key boxes). Plain TS, no JSX |
| `Thumbs.tsx` | The five sets (doorway, hall, ledger, hourglass, pages) and the frame: stage, finish, tag |
| `Root.tsx`, `index.ts` | One composition, `Thumbs`; frame i is candidate i |
| `manifest.ts` | Dumps the candidates with the hero's head on screen, for `check.py` |
| `check.py` | Files the renders in each video's `renders/packaging/` (full size, 168x94, both feed themes) and measures K3, K4, K5, K8, K9, K10, K11 into the video's `thumb-checks.json` |

Render and check, from `core/engines/whatif` (after `pnpm install --frozen-lockfile`):

    pnpm exec remotion render ../../../channels/say-suppose/brand/thumbs/index.ts Thumbs out/thumbs-batch1 --sequence --image-format=png
    pnpm exec tsx ../../../channels/say-suppose/brand/thumbs/manifest.ts > out/thumbs-batch1/manifest.json
    ../../../.venv/bin/python ../../../channels/say-suppose/brand/thumbs/check.py out/thumbs-batch1/manifest.json out/thumbs-batch1

(In a worktree, use the main checkout's `.venv`.) Render into the engine's `out/`: Remotion refuses an image-sequence
folder whose path contains a dot-folder such as `.claude/`.

K1 and K2 (the 0.5 s flash read and the focal points) need a cold reader on the 168x94 renders; K6, K7, K12-K15 are
judged at G1 in `packaging.md`. A later batch adds its own `batchN.ts` and points `Root.tsx` at it.

`review_page.py` and `review_page.html` build the owner's one-sitting G1 page for a batch (every film's title and
thumbnail pairs at YouTube feed sizes on both themes, the room's verdict, the cold read, one pick per film). The page
embeds the renders, so publish it as an Artifact instead of committing it. Batch 1's notes:
`../../backlog/g1-batch1-review-notes.json`.
