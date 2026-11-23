# Say Suppose: why the views are low (2026-11-23)

The owner asked: "Analyse the videos on the channel and see where are we doing wrong as other channels made some
really good videos and got really good views also in 5 videos only atleast something good."

HTML report: https://claude.ai/code/artifact/53f1852b-5377-41e0-84c2-22e24b393823 (private to the owner).

Sources:
- Our numbers: YouTube Studio Analytics, read in the owner's Chrome on 2026-11-23 at about 18:45 IST. Read-only;
  nothing in Studio was changed.
- Competitor numbers: public YouTube pages read the same day (watch pages, channel pages, `/about`, RSS).

Nothing in `rules/`, `taste.md`, `style.md` or any film was changed. The rule changes below are proposals for the
owner to decide.

## Summary

YouTube has barely shown our films to anyone.

- **Pause-time** got 955 thumbnail impressions, almost all in its first week, at a 2.9% click-through rate. About 43%
  of viewers were gone by 0:32. Then YouTube stopped testing it: 22 impressions in the last 7 days.
- **The next two films** have been public for 3–4 days and have been shown only 30 and 23 times.

The lane is not the problem. Six brand-new "What If You…" cartoon channels got 1.7M–5.4M views within their first
five uploads in October 2026. On the same lane, they beat us on four things, in this order:

1. a thumbnail built on one face and one number;
2. a first 30 s that shows the power working;
3. uploads every 1–3 days;
4. films of 7–11 minutes, against our 12–13.

## 1. Our three films

| Film | Public | Length | Impressions | CTR | Views | Unique viewers | Avg view |
|---|---|---|---|---|---|---|---|
| [Pause time for 10 seconds a day](https://youtu.be/-si5nCzgQl8) | 9 Nov 18:30 | 5:14 | 955 | 2.9% | 74 (81 on the public counter) | 35 | 2:10 (41%) |
| [AI rented your brain while you slept](https://youtu.be/Rw9Mb1morvA) | 19 Nov 18:30 | 13:12 | 30 | 3.3% | 7 | 4 | 10:28* |
| [Saw who wants you to fail](https://youtu.be/9XdddTnb0H0) | 20 Nov 17:30 | 12:37 | 23 | 4.4% | 4 | 1 | 11:28* |

\* Near-full-length average views from 1–4 unique viewers are almost certainly the owner and friends. Retention is
still processing for both. There is no stranger data on them yet.

**Channel, last 28 days:** 90 views, 3.6 watch hours, 9 subscribers. 0 Shorts.

**Pause-time retention** (read from Studio's advanced-mode chart):

| 0:00 | 0:03 | 0:06 | 0:10 | 0:19 | 0:32 | 0:38 | 1:00 | 1:30 | 2:38 | 4:14 | end |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 94% | 81% | 73% | 67% | 61% | 57% | 51% | 47% | 42% | 41% | 38% | 32% |

All of the loss is in the first minute. After 1:30 the curve is flat.

**Pause-time traffic:**
- Browse 20.3%. Suggested 13.5%, next to unrelated videos (a zombie list, TikTok reactions, Family Guy).
- External 17.6%, 92% of it WhatsApp. Direct 16.2%. Channel pages 13.5%. Other 32.4%.
- Search 9.5%, mostly "what if you could pause time".
- Notifications sent: 0.
- Phone 61%, computer 35%. India 41.8%. Captions on for 33%.
- Returning vs new viewers: "Not enough data".
- The thumbnail A/B test has run since 9 Nov with no winner.

**Our first 30 s** (from `subtitles/en.srt`):

| Film | First word | What happens first |
|---|---|---|
| Pause-time | 0.6 s | "On day twelve…" (the bus). Title question at 0:18. |
| Fail | 2.9 s | Three rules in 15 s. The thumbnail's −84 at 0:59. |
| AI-rents | 7.4 s | A plasma nurse and family debt. Power named at 0:31. |

**Our pacing** (ffmpeg scene detection, threshold 0.30, 6 fps):
- Fail: 21.6 visual changes a minute.
- AI-rents: 17.3 a minute, but only 11 in the first minute.
- Narration: 143–150 words a minute.

## 2. Eight channels that broke out early

Exact view counts from the watch pages on 2026-11-23. Four accounts were created long before their first public
upload (Ifverse, Awaken, Ifinite, Hypothetically), so earlier deleted uploads can't be ruled out. ConChaser, The
Hidden Why and Minute Zero are verifiably new.

| Channel | Breakout | Views | Upload # | Length | Uploaded | Subs |
|---|---|---|---|---|---|---|
| [Ifverse](https://www.youtube.com/@IfverseTales) | [What If Your Reaction Time Was 10x Faster?](https://www.youtube.com/watch?v=MroF1XmHOZw) | 4,755,695 | 1st | 7:13 | 2026-10-07 | 64.1K |
| [Awaken](https://www.youtube.com/@awaken.studios) | [Can 2 People Really Restart Humanity?](https://www.youtube.com/watch?v=6oZ9fdM0n50) | 5,379,940 | 1st | 6:58 | 2026-10-20 | 25.3K |
| [Minute Zero](https://www.youtube.com/@Minute_zero_real) | [What If You Sped Up and Couldn't Stop?](https://www.youtube.com/watch?v=gpLC_ELulyg) | 2,441,884 | 3rd | 9:00 | 2026-10-12 | 23.8K |
| [ConChaser](https://www.youtube.com/@ConChaser) | [What If You Could See Everyone's Future Wealth?](https://www.youtube.com/watch?v=DK4EOHCrVvM) | 2,439,272 | 3rd | 10:47 | 2026-10-25 | 33.8K |
| [Ifinite](https://www.youtube.com/@Ifinite-c5h) | [What If You Could See How Long Everyone Has Left?](https://www.youtube.com/watch?v=u2GyTKhHsTQ) | 1,890,287 | 1st | 10:30 | 2026-10-15 | 19.1K |
| [The Hidden Why](https://www.youtube.com/@HiddenWhyProject) | [What If You Woke Up 20,000 Years Ago?](https://www.youtube.com/watch?v=myAGmeMR_vQ) | 1,784,377 | 4th | 11:16 | 2026-10-30 | 3.89K |
| [Hypothetically](https://www.youtube.com/@HypotheticallyHQ) (2025) | [What Every Level of Wealth ACTUALLY Feels Like](https://www.youtube.com/watch?v=UchQEgBmp0M) | 1,774,259 | 4th (3 months after the 1st) | 15:35 | 2025-08-15 | 344K |
| [AI In Context](https://www.youtube.com/@AI_In_Context) (2025) | [We're Not Ready for Superintelligence](https://www.youtube.com/watch?v=5KVDDfAkRgc) | 11,435,814 | 2nd | 34:11 | 2025-07-09 | 460K |

Per channel (hooks are rebuilt from chapters and storyboards, not from transcripts; voices were not heard; cuts per
minute are estimates):

- **Ifverse**
  - Title: "What If Your [ability] Was 10x…", a multiplier.
  - Thumbnail: a round-headed character in a red hoodie, a bullet at his face, "TOO SLOW.".
  - Hook: cold open (a fly, a coffee cup), title card at about 0:35–0:40, a timer on screen.
  - Pacing: 11–12 or more changes a minute.
  - Cadence: daily. Parts 2–3 within 36 h (705K, 394K). "500 IQ" got 1.49M.
- **ConChaser** (account created 16 Oct 2026)
  - Title: "What If You Could See Everyone's [number]?".
  - Thumbnail: no words, "$150" over "you" and "$8,742,619,300" over a homeless man.
  - Hook: opens on the thumbnail's moment within about 15 s.
  - Cadence: 30 uploads in 31 days.
  - Later "Everyone's IQ" got 2.9M. Its floor stayed high (30K–900K).
- **Minute Zero**
  - Title: series formula "What If You [verb]ed and Couldn't Stop?".
  - Thumbnail: a giant "1,235 km/h" readout.
  - Look: low-poly 3D first-person view with a speed HUD that climbs every frame. 2–4 hard cuts a minute.
  - Upload 4 got 2.16M. 15 uploads in 22 days, then stopped.
- **Ifinite**
  - Thumbnail: "52 YEARS" in green and "00:00:05" in red over figures on a neon street.
  - Hook: chapters "0:00 Twelve Seconds Left", "0:35 The Rules".
  - Cadence: 44 uploads in 39 days. Everything after the hit got 14K–343K.
- **Awaken**
  - Thumbnail: "ONLY 2 LEFT", two worried figures.
  - Hook: question card at 0:29, then the maths on a chalkboard, with a generation counter.
  - Follow-ups "Last Guy on Earth" (1.0M) and "Last Girl" (873K).
- **The Hidden Why**
  - Uploads 1–3 were "Why…" explainers with 484–2,612 views. Its first "What If You…" got 1.78M in the same style
    and voice. This is the cleanest test that the frame matters.
  - Thumbnail: "WRONG ERA?!" over a shocked cartoon "you".
- **Hypothetically**
  - A status ladder with split-screen "Homeless" vs "Billionaire" faces.
  - Cheap clip-art visuals. 10 auto-dubbed tracks.
- **AI In Context**
  - A funded team (80,000 Hours) with an on-camera presenter, here for the AI-future premise.
  - Opens on outside proof that the scenario is real.

**What most of them share:**
- **Title:** "What If You… + a number or a status reveal", 37–49 characters (5 of 8).
- **Thumbnail:** a cartoon "you" with a readable face (6 of 8); three words or fewer, or numbers only (7 of 8).
- **Running number:** a number on screen that keeps changing carries the escalation (5 of 8).
- **Length:** 7–11.5 minutes (6 of 8).
- **Cadence:** uploads every 1–3 days in the first month (6 of 8).
- **Multipliers:** a sequel to the hit within days (4 of 8); auto-dubbed audio (5 of 8).

**The catch:** in 5 of 8 the hit was a single spike, and recent uploads get 1K–140K. Their like rate is low (0.4–1.2%).
The same searches found copycats with 1–4K views (for example @WhatIfUClick), and hits that only came at upload 7
(IFOLOGY, IFNation).

## 3. What we're doing wrong, ranked by likely effect on views

1. **The thumbnail doesn't sell the power (high).**
   - Evidence: 2.9% CTR on 955 impressions, and then the test stopped. "DAY 12", "THAT'S ME?" and "NOT HIM." only
     make sense after watching. In 7 of 8 breakouts, the number or two words *are* the premise.
   - Next film: one big reacting "you" face and one glowing number that states the premise, on a dark ground with one
     light. For the fail film, that would be a large −84% over the best friend's grin. Render 3 options and use Test &
     Compare from day one.
2. **The first 30 s don't show the power working (high).**
   - Evidence: pause-time falls 94% → 81% by 0:03 and 57% by 0:32, then stays flat. AI-rents' first word is at 7.4 s,
     on a plasma clinic. The fail film's −84 arrives at 0:59.
   - Next film: the thumbnail's shot and number by 0:05, the power in use before any backstory, the title question by
     0:20. Check the 720p first cut at 0:03, 0:10 and 0:30.
3. **Too few uploads, too far apart (high).**
   - Evidence: 3 films in 15 days, with a 10-day gap. The new films got 23–30 impressions. The breakouts posted every
     1–3 days and hit at upload 1, 3 or 4. Seven of our films wait at gates (PRs #38, #39, #40, #54, #55, #56, #60).
   - Next film: one film every two days from the finished queue, with gates batched.
4. **The films run long (medium).**
   - Evidence: 13:12 and 12:37, against 7–11.5 minutes for the breakouts and our own 9–10 minute template. There is no
     stranger retention on our long films yet, so this is an inference.
   - Next film: first cut at 10:30 or less.
5. **Topics are told small and heavy (medium).**
   - Evidence: the right premises, told through one local, sombre setting. The breakouts label everyone and escalate
     in scale. The 13 Nov audience research found the same thing.
   - Next film: score topics on "a number everyone in frame carries" and "escalates past one person"; open in a world
     anyone knows.
6. **No running number on screen (medium).**
   - Evidence: 5 of 8 breakouts use one. Minute Zero shows it works in code-drawn visuals.
   - Next film: one persistent readout tied to the power, updating with each set piece.
7. **No sequels, Shorts or dubs to multiply a hit (low for now).**
   - Next film: one 30–45 s Short from the cold open. If a film beats 3x the channel median, start part 2 that week.
8. **Pacing and voice are not the main problem (low).**
   - Evidence: 17–22 visual changes a minute is at or above the breakouts' estimated rate. Voice quality is a clarity
     issue, not a reach issue, as far as the data shows.

## 4. Rule changes for the owner to decide (not applied)

| File | Proposal |
|---|---|
| `rules/thumbnails.md` | One large readable face plus one glowing number or at most three words that state the premise without the film. Fails: tags that need the story. Dark ground, one light. |
| `rules/story.md`, `style.md` | The thumbnail's shot and number by 0:05, the power in use before backstory, the title question by 0:20. A warning on the opening check (the owner's 15 Nov choice), plus a 0:03/0:10/0:30 stranger note at G2. |
| `style.md` (template) | Length ceiling 10:30. Longer needs a named reason from the story seat. |
| `style.md` (Cadence) | One film every two days from the finished queue. A film that has passed its gates ships on its slot. |
| `rules/ideas.md`, topic scoring | Score "a number everyone in frame carries" and "escalates past one person". Mark down openings that need a local institution explained. |
| `style.md` (Look) | One persistent on-screen readout tied to the power. |
| Publish checklist | One Short per film. A sequel the week a film beats 3x the median. The owner may switch on YouTube auto-dubbing in Studio. |

## 5. Limits

- **Tiny sample.** Only pause-time has stranger data, and it is mixed with our own re-watches and WhatsApp shares.
- **Competitor hooks** are not from transcripts: YouTube's caption endpoints refused. Their voices were not heard, and
  their cuts per minute are storyboard estimates (one frame every 5–10 s).
- **Our pacing** counts big picture changes (cards included), not only hard cuts.
- **Why the newest films got so few impressions** is not shown in Studio. "A weak first test plus a 10-day gap" is an
  inference.
- **Full notes:** the per-channel research notes, with every URL used, sit outside the repo at
  `~/Library/Application Support/Claude/side-session-notes/local_b06a1860-7c54-4b3a-8954-735bf5464af4/breakout-channels-2026-11-23.md`.
