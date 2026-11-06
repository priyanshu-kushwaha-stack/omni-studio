# Style bible

Niche: illustrated curiosity explainers about humans (body, mind, how people actually lived, what happens next). Remit is broad; the launch lane for videos 1-10 is ancient humans × brain/body, widened only after the first 2x outlier (decided 2026-10-24). English. Shorts allowed from 2026-10-31 as a discovery funnel (see "Shorts" below). From video 2 the ramp uses a **5-minute format** (4:30-6:00, one thesis; owner decision 2026-10-28, see "5-min format" below); video 1 ran 10:41. Long-form (10-20 min) returns once the 5-min format proves itself on retention.

## 5-min format (videos 2+, owner decision 2026-10-28)
Every video must be engaging *and* leave the viewer with something useful. Word budget ≈ 780-850 words at 155-170 wpm (lint with `--target-minutes 5`; skeleton from `scripts/new_video.py`).

| time | beat | rule |
|------|------|------|
| 0:00-0:10 | Prove the title | concrete image or number, no preamble |
| 0:10-0:30 | Why it matters to you | second hook names the viewer's personal stake |
| 0:30-0:40 | Agenda | one line, "three things..." (shared agenda, owner note on video 1) |
| 0:40-4:20 | 3-4 beats, ≈ 60-75 s each | evidence → twist → "so for you..."; every number in `claims.md` |
| ≈ 2:30 | Re-engagement | one midpoint reversal or open loop (linter checks it) |
| 4:20-4:50 | Take-home | 1-3 practical, sourced takeaways |
| 4:50-5:00 | Stop | subscribe line, then end |

Visual density is unchanged: ≥ 8 changes per minute, 2-4 s changes in the hook.

**Ask the viewer (owner note 2026-10-30, after video 2):** put a direct question to the viewer every ~20-30 s ("Guess how many were left.", "What should it report?", "Which would *you* trust?"), marked `> ASK:` in the script. Ask, pause ~1 s so they guess, then answer. Prefer guess-the-number, predict-the-result and which-would-you-pick questions over rhetorical ones. Questions set up a fact; they never carry a new one. Reason: video 2 lost the owner's attention in places, felt heavy or plain, and the viewer felt disconnected.

## Shorts (owner decision 2026-10-31; reverses the 2026-10-24 "no Shorts" rule)
Shorts are a discovery funnel into the long videos, not an income line (the 2026-10-24 receipts check still holds: Shorts RPM is a fraction of long-form).
- One question, one answer, one twist. 45-55 s, ≈ 130-145 words at 160-170 wpm, 9:16 vertical (1080x1920).
- The question lands in the first 2 s, on screen and spoken. No intro, no channel name.
- `> ASK:` once early (pause ~0.7 s), then the answer; the twist in the last third; the last line loops back into the first.
- One end-line pointing to a related long video when one exists (pinned comment + related-video link in Studio).
- Same claims rule as long-form: every number and finding has a row in the Short's `claims.md`.
- Text placement gate (owner, 2026-10-31): run `scripts/overlay_check.py <dir> --fix` before every render. It fails any label or caption that runs off the frame, sits under the Shorts player UI (top 6 %, bottom 20 %, right 14 % below 40 % height) or the long-form end-screen third, covers the drawing (> 4 % ink), sits on a rigged face, or overlaps other text; `--fix` moves labels to the nearest clear paper (shrinking big cards if needed) and, with `--captions` (only when a render burns them), writes `caption_layout.json`. A label with no clear spot is dropped when the caption already says it.
- Shorts stills leave paper for text: prompts ask for the top fifth and a band at 56-72 % height to stay empty, so labels have paper to sit on.
- Folder: `shorts/<YYYY-MM-DD_slug>/` with `research.md`, `claims.md`, `script.md`; the owner reviews the script before any asset is generated.
- Visual template: the same paper/ink style, reframed for 9:16 (centre-safe area). No subtitles: no burnt-in captions and no SRT upload (owner, 2026-10-31); the on-screen labels carry the key words. Render with `compose.py --size 1080x1920` (no `--burn-captions`). Stills for Shorts are generated natively at 9:16: a 16:9 still is centre-cropped and loses most of the drawing.

## Visual change rate
- A visual change every 3-6 s (2-4 s in the first 60 s). At least 8 changes in every minute. Holds of 6-12 s only for a map or chart that is still evolving.
- Every change is one of five classes and must add information or motion:
  - `motion`: motion on an existing drawing (draw-on, push-in, puppet motion)
  - `card`: a stat, comparison, callout, text, chart, map or label card
  - `illustration`: a new drawing
  - `character`: a recurring-character moment
  - `hero`: a hero motion clip
- Enforced on the scene plan by `scripts/scene_plan_check.py`; measured on the render with OpenMontage `scene_detect`.

## Visual system
- Hand-drawn stickman / marker-on-paper look. Off-white paper background (#F6F1E7), charcoal line (#2B2B2B), one accent colour per video chosen from: ochre #D9A441, rust #B5533C, teal #3A7D7B.
- Built from OpenMontage's existing pieces first: draw-on reveals (GSAP DrawSVG in HyperFrames, `evolvePath` in Remotion), `diagram_gen`, StatCard / ComparisonCard / CalloutBox / TextCard and the charts, all in the handwriting font. Custom components only where the Phase 0 visual test showed a gap (see `## Visual test` below once it exists).
- Labels are handwriting-font overlays, never text inside an AI image. Negative prompt for every still: `photo, 3d render, text, letters, watermark, gradient, neon`.
- The first 60 s get custom-made frames (hand-tuned stills, not first-pass generations).
- On-screen text only for key numbers, names and labels, sized to read on a TV (≥ 48 px at 1080p).
- The last 10-15 s leave the right third of the frame quiet for end screens.
- Mixed media per video: drawn stills with motion, cards, 1-2 charts or maps, occasional archival (Wikimedia / Archive.org) with provenance logged. Never 100% static AI stills.
- Style is locked by `channel/style_refs/ref-01..08.png` plus `model-sheet-you.png`. Every generated still passes those as image references.

## Recurring character: "you" (hypothesis until the visual test confirms it)
- A stick figure with one fixed prop (a small satchel) and no facial detail beyond two dots and a line, drawn from `style_refs/model-sheet-you.png`.
- If the figure drifts between stills in the visual test, fall back to a recurring silhouette plus the satchel; never fight the model for a face.

## Style-reference prompt (used once to make `style_refs/`, reused as the base of every still prompt)
"Hand-drawn stickman illustration, black marker on cream paper, loose confident lines, slight paper grain, minimal shading, one accent colour (ochre), 16:9, lots of negative space, no text, no letters, no watermark. Scene: {scene}."

## Voice
- One narrator voice chosen in a blind test (see `channel/voice.md`). 150-165 wpm. Second person. Short declaratives.
- Emphasis word marked with *asterisks* in the script; one per sentence at most.
- Every take carries a voice-performance plan: pauses before reversals (~1 s), after surprising claims, before the final line.

## Sound
- 3-5 music cues per video; the cue changes at section turns (question → evidence → reversal → answer → leftover fact).
- About 1 s of silence (music and voice) before each reveal.
- Subtle sound effects on draw-ons (pencil) and on "but" turns (a soft sting). Never on every change.
- Music ducks under the voice (playbook audio block). Any unintended silence over 2 s is a QC flag.

## Captions
- Accurate SRT uploaded as a sidecar. Nothing burned in.

## Pacing
- Prove the title in the first 10 s; second hook by 30 s; intro over by 45 s.
- Planned re-engagement about every 3 minutes, through the back half.
- Abrupt ending: payoff, one sentence, stop. No outro, no "thanks for watching".

## Tone
- Curious, plain, exact. One exact number or named source per section; every number has a row in `claims.md`.
- Brain/body topics are curiosity explainers citing named research, never advice. Contested claims are spoken as caveats.

## Title grammar and templates
- "How/When/Why did ancient humans actually …" → template M (mystery explainer)
- "Every type of X, explained" → template B (list)
- "What X was actually like" → template C (documentary)
- Practical titles only ("how to…", "the fix for…") → template A (essay with numbered fixes); never the default

## Channel
handle: @ProfessorofUs
display_name: Professor of Us
channel_id: UCCJhLDNsse7yozGn4EdGgJQ
url: https://www.youtube.com/@ProfessorofUs
created: 2026-10-24 (17:02 UTC)
owner_account: brand account (select this identity at every Google account chooser)
description_set: done 2026-10-24 (verified via API)
intermediate_features: done 2026-10-24 per owner (API still reports longUploadsStatus unspecified on 2026-10-25; re-check before Task 22)
advanced_features: done 2026-10-24 per owner (confirm Test & Compare is visible in Studio before Task 16)

Description (live): "Illustrated explainers about humans: how your body and brain actually work, how people actually lived, and what happens next. New video every week."

## Style references (channel/style_refs/, generated 2026-10-25 with Higgsfield Nano Banana 2.1, 16:9, 1.5 credits each)
| file | scene | keep reason |
|------|-------|-------------|
| ref-01.png | satchel figure asleep by a campfire under stars | line weight, palette, the character |
| ref-02.png | figure facing a sunrise with a question mark | question-mark idiom, ochre sun |
| ref-03.png | brain as a walnut, one region in ochre, one arrow | how we highlight anatomy |
| ref-04.png | ruler timeline, campfire at left, house at right | timeline idiom |
| ref-05.png | two figures sharing food | two-character scenes |
| ref-06.png | outline map of Africa with one ochre arrow | map idiom |
| ref-07.png | figure yawning at a desk with a phone | the modern "you" |
| ref-08.png | ~20 tiny figures in a ring around a fire | crowd / camp scenes |
| model-sheet-you.png | six poses of the "you" figure (standing, walking, sitting, pointing, sleeping, surprised), same satchel | character reference |

All nine passed on the first generation (contact sheet reviewed; no regenerations). Base prompt as above; every future still passes 2-4 of these as image references.

## Edit template
The layer stack (draw-on reveals, camera, word-anchored overlays, music ducking, SFX, SRT) is in `channel/template.md`; rendered by `scripts/compose.py`. Set up 2026-10-25 on the first 3 minutes of video 1.

## Motion test (Kling 3.0 image-to-video on ref-01, 2026-10-25)
verdict: hero clips allowed (subtle motion only)
why: the figure kept its shape across all 5 s, lines stayed black and crisp, the paper did not swim, the fire flickered and the stars shifted faintly; frame-to-frame luma difference averaged 0.31 (max 0.88), i.e. motion is present but gentle. Output was 1284x716, so hero clips need an upscale to 1080p before compose.
credits: 10 (Kling 3.0, 5 s)

## Calibration (2026-10-25; OpenMontage scene_detect ffmpeg fallback thr 0.3, bracketed 0.2/0.4; transcript API; ebur128)
| video | length | shots/min | median hold | longest hold | motion / animated stills / static / text cards | wpm | music |
|-------|--------|-----------|-------------|--------------|-------------------------------------------------|-----|-------|
| Zenn — What Did Ancient Humans Do at Night? (8.09M) | 8:32 | 18.8 (16-21) | 2.9 s (p90 5.5) | 11.4 s | 24% / 19% / 57% / ~2 of 20 keyframes | 187 | continuous bed, -18.4 LUFS integrated, LRA 2.2, never silent |
| EverythingProfessor — Every Type of Sleep (672K) | 13:47 | 13.2 (12-14) | 3.8 s (p90 8.9) | 17.5 s | 29% / 62% / 9% / ~4 of 20 keyframes | 162 | continuous bed, -18.4 LUFS, LRA 4.1, 4 s under -40 dBFS |

Per-minute cuts: Zenn [20, 14, 19, 18, 15, 21, 20, 23]; EverythingProfessor [14, 11, 15, 16, 11, 11, 11, 10, 12, 18, 11, 11, 16, 14]. Contact sheets and raw JSON in OpenMontage `projects/_reference/`.

Channel targets after calibration: changes per minute ≥ 12 for this style (the floor of 8 in `## Visual change rate` was too low against 13-19 measured; the checker's threshold stays 8 as a hard floor, 12 is the design target), median hold 3-4 s, longest hold ≤ 12 s, wpm 155-175 (Zenn's 187 is within 25% of our 155-165 band, so the band is widened upward, not moved), music a continuous bed about 20 dB under the voice, cue changes at section turns rather than silences.
What they do that we will copy: one idea per frame; a figure in nearly every frame; single-word drawn-in labels; text cards as section headers; never a silent second.
What they do that we will not: 57% fully static stills (Zenn); Cyanide-and-Happiness vector look (EverythingProfessor); 187 wpm with no directed pauses.

## Channel page (2026-10-27)
Avatar: `channel/page/avatar.png` (mascot: the satchel figure as a professor, round glasses, chalk). Banner: `channel/page/banner.png`, text inside the 1546x423 safe area, built by `scripts/channel_page.py`. Watermark: `channel/page/watermark.png`. About text and keywords: `channel/page/about.md`. Trailer: `videos/2026-10-27_channel-trailer/`. Studio steps: `channel/page/studio_checklist.md`. Design: `docs/superpowers/specs/2026-10-27-channel-page-design.md`.
