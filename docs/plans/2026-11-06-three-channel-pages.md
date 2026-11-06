# Channel pages for Say Suppose, Power & Citizen and See Underneath

Goal: each new channel looks finished to a logged-out visitor and is registered here as a draft channel.
Design: `docs/superpowers/specs/2026-11-06-three-channel-pages-design.md` (owner approved 2026-11-06).

## Constraints

- Lettering is drawn in code. No text inside an AI image.
- Banner 2560x1440, every word and the mark inside the centred 1546x423 safe area.
- Picture 800x800, ink inside the inscribed circle. Watermark 150x150.
- Power & Citizen: navy `#14213D`, parchment `#F3EBDD`, brass `#C8963E` only.
- See Underneath: teal-black `#0B2E2B`, amber `#F2B441`, mint `#EAF6F2`. Say Suppose: indigo `#1F1B4D`,
  yellow `#FFC857`, coral `#FF7A59`.
- Paid: Higgsfield `gpt_image_2_6`, 1.0 credit in total, approved. Nothing else.
- Nothing is published in Studio without the owner's yes for that channel.
- This worktree has no `.venv`; run with the main checkout's interpreter and this worktree on `PYTHONPATH`:
  `PYTHONPATH=$PWD/core/openmontage:$PWD/core ~/Exploration/projects/omni-studio/.venv/bin/python`.

## Tasks

| # | Task | Files | Done when | Verified by |
|---|---|---|---|---|
| 1 | Scaffold the three channels | `channels/{say-suppose,power-and-citizen,see-underneath}/` via `omni new-channel`; set `niche` in each `channel.yaml` | Three draft channels exist with real niches | `omni check` passes for all three |
| 2 | `studio.page`, test first | `core/studio/page.py`, `core/studio/tests/test_page.py` | `mark`, `banner`, `crops`, `watermark` and the command line exist; tests cover sizes, safe area, text fit, circle, colours, unknown slug | `pytest core/studio/tests/test_page.py` red, then green |
| 3 | Build the two code-made pages | `channels/{power-and-citizen,see-underneath}/page/{avatar,banner,watermark}.png`; `.gitignore` for `page/candidates/` and `page/crops/` | Files exist at spec sizes | Look at each picture at 800, 98 and 36 px and at the three banner crops |
| 4 | Say Suppose picture and banner | `channels/say-suppose/page/` | Owner picked one of three candidates; banner scene generated to match (0.25 credits); banner lettered in code | Same look as task 3; no text inside the generated image |
| 5 | About text and checklists | `channels/<slug>/page/{about.md,studio_checklist.md,costs.md}` | Description under 1,000 characters, keywords under 500, wording as approved | Character counts printed by a one-line check |
| 6 | Owner's look | none | Owner says yes to each picture and banner | Owner's reply |
| 7 | Studio session | none in the repo until done | Picture, banner, watermark, description, handle, country, keywords live on each channel | Each public page opened logged out |
| 8 | Record and close | each `channel.yaml` (`youtube_channel_id`), `costs.md` | Ids recorded, session written down | `omni check`, `make test` |

Task 7 stops before each Publish for the owner's yes. If a handle is taken, stop and ask.

## Order

1, 2 and 5 do not depend on the owner. 3 follows 2. 4 waits for the pick. 6 gates 7. 8 is last.
