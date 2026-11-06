# Channel pages for Say Suppose, Power & Citizen and See Underneath

Owner approved this design on 2026-11-06. It covers the channel page only: picture, banner, watermark,
description, handle, country and keywords. Video formats, playbooks, voices and first videos are separate
passes, one channel at a time.

## Goal

Each of the three new channels looks finished to a logged-out visitor on a phone and a laptop, and is
registered in this repo as a draft channel.

## Channels

| Slug | YouTube name | Niche |
|---|---|---|
| `say-suppose` | Say Suppose | One "what if" per video, followed through with real physics, biology, history and economics |
| `power-and-citizen` | Power & Citizen | How countries are governed, compared across countries, and what each system asks of a citizen |
| `see-underneath` | See Underneath | The everyday science people stopped questioning |

All three: English, country India, not made for kids, `status: draft`, `budget_usd_per_video: 0`.

## Identity

The three identities share nothing: `omni similar` and YouTube both compare an owner's channels.

| | Say Suppose | Power & Citizen | See Underneath |
|---|---|---|---|
| Picture | AI-illustrated scene, owner picks one of three | Code-drawn: a pillar and a person at equal height | Code-drawn: a solid block with a lens showing its structure |
| Colours | indigo `#1F1B4D`, yellow `#FFC857`, coral `#FF7A59` | navy `#14213D`, parchment `#F3EBDD`, brass `#C8963E` | teal-black `#0B2E2B`, amber `#F2B441`, mint `#EAF6F2` |
| Banner | Wide illustrated scene, name over a calm centre band | Navy field, mark left, serif masthead name, brass rule | Dark field, faint blueprint grid, mark and name |
| Banner line | Change one thing. See what follows. | How the world is run, and where you fit in. | The science under ordinary things. |
| Handle to try | `@SaySuppose` | `@PowerAndCitizen` | `@SeeUnderneath` |

Rules carried over from Professor of Us:

- Lettering is drawn in code. No text inside an AI image.
- Banner is 2560x1440 with every word and the mark inside the 1546x423 safe area.
- Picture is 800x800 and must read inside a circle at 98 px and 36 px.
- Watermark is 150x150, cut from the picture.
- Power & Citizen uses no colour a party owns: no saffron, no green, no red-against-blue.

Say Suppose candidates: Earth with Saturn-like rings; two moons over a city skyline; an open door in a field
onto a different sky. The banner scene is generated after the owner picks, to match the pick.

## Copy

Descriptions (under 1,000 characters each), keywords (under 500 characters each) and the banner line live in
each channel's `page/about.md`, in the wording the owner approved. No upload schedule is promised until the
first videos exist. The contact email is entered by the owner in Studio and never written in the repo.

## Risk

Power & Citizen covers politics. Its description states the stance: it explains how systems work and does
not tell anyone who to vote for.

`risk_class` stays at the template's `B` for all three. The schema accepts A, B or C but nothing in the repo
says what the letters mean, so this pass does not guess a stricter letter for Power & Citizen. The owner
sets it when the classes are written down.

## Files

    channels/<slug>/                 scaffolded by `omni new-channel <slug>`
      channel.yaml                   niche, risk class, made_for_kids false, status draft
      page/
        about.md                     description, keywords, country, banner line, handle
        avatar.png                   800x800, tracked
        banner.png                   2560x1440, tracked
        watermark.png                150x150, tracked
        studio_checklist.md          the Studio steps and what was done
        costs.md                     credits spent, decisions, verification
        candidates/, crops/          git-ignored
    core/studio/page.py              draws the two code-made marks, all three banners, crops, watermark
    core/studio/tests/test_page.py

The final picture, banner and watermark are tracked: they are small brand files and a fresh clone needs
them to redo a Studio session. Candidates and preview crops are not tracked.

`core/engines/pou/scripts/channel_page.py` is not reused or changed: it imports the paper-and-ink colours
and the handwriting font of the Professor of Us engine.

## `core/studio/page.py`

One module, Pillow only, no network.

- `mark(slug, size)` returns the code-drawn picture for `power-and-citizen` or `see-underneath`.
- `banner(slug, out, scene=None)` writes the 2560x1440 banner. `scene` is the illustrated image for
  Say Suppose; the other two are drawn entirely in code.
- `crops(banner, out_dir)` writes the TV, desktop and phone crops YouTube shows.
- `watermark(picture, out)` writes the 150x150 watermark.
- A `python -m studio.page` command line wrapping those four.

Fonts are system fonts looked up by name with a fixed fallback order, so a missing font fails loudly
instead of silently falling back to Pillow's bitmap font.

Tests pin what a reviewer would otherwise check by eye:

- sizes of picture, banner, crops and watermark;
- every banner's text and mark sit inside the safe area (measured from the drawn boxes);
- banner text fits: a long name shrinks instead of running out of the safe area;
- the picture's ink stays inside the inscribed circle;
- each channel's colours are the ones in this spec, and Power & Citizen's contain no banned hue;
- an unknown slug raises.

## Paid calls

Higgsfield `generate_image`, model `gpt_image_2_6`: three 1:1 candidates (0.75 credits) and one 16:9 banner
scene (0.25 credits). 1.0 credit in total, approved by the owner on 2026-11-06. Nothing else is paid.

## Studio session

The agent drives the owner's Chrome through the Claude extension, one channel at a time, and stops before
each Publish for the owner's yes.

1. Customisation, Branding: picture, banner (check the three previews), watermark on "Entire video".
2. Customisation, Basic info: description, handle.
3. Settings, Channel, Basic info: country India, keywords.
4. Publish.

Not in this pass: trailer, featured video, links, contact email.

If a handle is taken, the agent stops and asks. It never picks a different handle itself.

## Done

- The owner has looked at each picture and the three banner crops and said yes.
- Each public page, opened logged out, shows the picture, banner and description.
- Each `channel.yaml` holds the channel's `UC...` id, and `omni check` passes for all three.
- `make test` passes.
