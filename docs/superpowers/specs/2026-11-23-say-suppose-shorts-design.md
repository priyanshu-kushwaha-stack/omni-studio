# Say Suppose: Shorts

Status: **draft for the owner's review** (2026-11-23). It is a plan only. Nothing is built, no rule or `taste.md` line
is changed, no Short is rendered and nothing is uploaded until the owner approves.

The owner asked for "Another session to plan Shorts". This spec answers six questions: which Shorts we make, how we make them with
our free, code-drawn pipeline, how often, which gates, how we package them and how we tell if they work. It ends with a
first slate of five Shorts cut from films we already have.

Sample frames (rendered, not described): **https://claude.ai/code/artifact/23f6292e-8bc7-41dd-b192-282b0393c7d0** (the HTML version of this spec), and the PNGs in the session notes
folder (`say-suppose-shorts-samples/`). Every frame is from the AI rents film's own scene code, rendered by the
engine at scale 2 and cut to 1080x1920. The overlays are HTML mock-ups in the film's tag style and Rubik 800.

## 0. What exists today

| Where | What | Reuse |
|---|---|---|
| `channels/say-suppose/style.md`, "Shorts" | One beat of a finished film, re-staged for 9:16, 30-50 s, ending on a line that points to the film; its own seven gates; pipeline `studio-whatif-short` to be written later | The starting point. This spec proposes changes the owner decides on |
| `docs/superpowers/specs/2026-11-11-...-three-a-week-design.md` §5 | "Same-day Shorts ... after the first batch" | That point is now: three films have passed their gates |
| `core/openmontage/pipeline_defs/studio-short.yaml` + `skills/studio/studio-short-*.md` | Professor of Us Shorts: 9:16, at most 58 s, seven gates, checks per stage (`claims`, `clicks` with the Shorts tail, `loudness`, `similarity`, `upload_request`) | The pipeline shape, the checks and the publish skill. The dialogue-cast parts and the Shorts sound rule (one pencil per 5 s, a 2.4 s fade tail) are Professor of Us craft rules, not ours |
| `core/studio/checks.py`, `qc/clicks.py` | The 2.4 s tail check runs on any `studio-short` render | A loop ending would need the check to take a per-pipeline tail (section 2) |
| `core/engines/whatif` | Every set and rig is drawn for one 1920x1080 camera (`theme.ts` `WIDTH`/`HEIGHT`, `Stage.tsx` `camTransform`) | Everything is vector, so a 9:16 window on the same world renders crisp. That is how the samples were made |
| Films with scene code and a final render | Pause time (public, `-si5nCzgQl8`), wants-you-to-fail (private, `9XdddTnb0H0`), AI rents (private, `Rw9Mb1morvA`) | The first slate. Four more films are at their gates (PRs #54, #55, #56, #60) and join later |
| Vertical cuts of Say Suppose films | None | |

## 1. What the research says

Full notes, with every link: `docs/research/2026-11-23-say-suppose-shorts.md`.

The agent checked 28 Shorts in our lane on 2026-11-23, signed out, and saw every view count itself. It paused 13 of
them on their first and last frames with the sound off.

| # | Short | Channel | Views | Length | Why it is here |
|---|---|---|---|---|---|
| 1 | [Why Stopping Time Is A Bad Idea](https://www.youtube.com/shorts/lWz9YjJ7H4E) | Low Poly Shorts | 13,420,130 | 47 s | Our pause premise. Frame 0 is rockets frozen in mid-air; it ends mid-word, so the replay runs into the opening line |
| 2 | [Why You Shouldn't Live Forever](https://www.youtube.com/shorts/5XDu7hk1qoY) | Low Poly Shorts | 9,867,600 | 61 s | The last second is a "NEW LONGFORM / WATCH NOW" card, with the related link set to the [long video](https://www.youtube.com/watch?v=3SKVwkE1jY8) (209,327 views) |
| 3 | [Dumping Yellowstone's Magma On NYC](https://www.youtube.com/shorts/gpZstBrMiF0) | Zack D. Films | 5,804,370 | 32 s | Caption "If you looked" on frame 0; the payoff by 3 s |
| 4 | [The New Android (fiction)](https://www.youtube.com/shorts/HRz5dffu4hY) | Zack D. Films | 3,995,906 | 50 s | AI and the future; opens in the middle of the action |
| 5 | [What If You Never Slept?](https://www.youtube.com/shorts/hiIIGMeMEuE) | Kurzgesagt | 3,081,265 | 70 s | Title stacked in the top third, with "YOU" largest |
| 6 | [What If You Built a Human With Four Arms?!](https://www.youtube.com/shorts/tbVQi4m5OQI) | Prof. Gizzard | 1,939,708 | 60 s | One big word, "YOU", on frame 0 |
| 7 | [What if you could pause time?](https://www.youtube.com/shorts/MjMANsbKA3c) | Lecuden | 1,162,453 | 138 s | Our exact premise again, at 2:18 |
| 8 | [What Happens If You Jump Into Saturn?](https://www.youtube.com/shorts/HMCWSpHJyH8) | What If | 862,174 | 178 s | Cut from a long video, letterboxed in parts |
| 9 | [Could 2 People Restart Humanity?](https://www.youtube.com/shorts/J17CZfV7u4k) | Awaken (@awaken.studios) | 16,959 | 63 s | Flat 2D, the style closest to ours; its long videos reach millions |

What this means for us:

- **Hook.** The hits open inside the premise, in the second person, on screen and spoken from frame 0 (6 of the 9
  animated what-ifs checked). None has an intro. This matches the films' rule, made tighter.
- **Length.** The 20 most-viewed run 30-78 s, with a median of 60.5 s, and none is over 80 s. The 2-3 minute cuts
  sit at 0.7-1.4M. One secondary study ([Virlo](https://virlo.ai/data/how-long-should-a-youtube-short-be)) finds 60-90 s
  the weakest length for channels under 100K subscribers. **So: 30-60 s.**
- **Loop.** Many hits end mid-line or with no outro, so the replay runs into the opening. Others end on a question to
  the viewer.
- **Captions.** Burned in, 1-4 words at a time, centred about 65-78% of the way down; a question title sits in the
  top third. Google's ad template keeps text out of the top 288 px, the bottom 672 px and the right 192 px. Organic
  hits use less: about 120-380 px at the top and 290-460 px at the bottom (measured, not official).
- **Voice.** Every animated hit has narration with captions. None is music-only or trending audio. This fits our
  local narrator.
- **Vertical, not stacked.** Every Short over 2M views is staged for vertical. Long-video cuts and letterboxed
  segments score lower. This is a correlation, not an A/B test.
- **Short to film is a small door.** The best case found: 9.87M Short views against 209K on the linked long video, so
  at most 2.1% went across. Other sources put the related link at about 0.3%. YouTube advises a spoken and visual
  call to action in the last 5 s ([guide](https://blog.youtube/creator-and-artist-stories/youtube-related-videos-traffic-guide/))
  but publishes no rate. Shorts are mainly reach and subscribers; a few viewers cross to the film.
- **The premise alone does not win.** About 20 copycat "What If You Never Slept Again?" Shorts have 0.2-1.6K views
  each, against Kurzgesagt's 3.08M. Pause time is crowded: Low Poly 13.4M, FactoHolic 67.7M (a talking head), Lecuden
  1.16M. Our Short has to win on its own angle (the bus, the kid, the curtain), not on the premise.

Platform facts (official sources, in the notes):

- **Views.** Since 31 March 2025 every start or replay counts as a Shorts view; the old count is "engaged views". Since
  24 August 2026 that applies to every format, and CTR, retention and recommendations still run on engaged views
  ([YouTube Blog](https://blog.youtube/inside-youtube/engaged-views-youtube-explained/)).
- **Length.** Up to 3 minutes, since 15 October 2024.
- **Monetisation.** Shorts-feed views do not count toward the 4,000 watch hours; Shorts qualify on their own with 10M
  engaged views in 90 days ([YouTube Help](https://support.google.com/youtube/answer/72851)). From 1 February 2027 the
  bars rise ([YouTube Blog](https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/)).
  Shorts do not move the channel toward the Partner Program through watch hours.
- **2026.**
  - Custom Shorts thumbnails from late July, for Partner Program channels on desktop only. Until then the first frame
    is the thumbnail.
  - The dislike button is gone since 25 June.
  - Since 1 October, recommendations favour original Shorts. Cutting your own long video is not the target, but the
    agent could not read the full post, so a re-staged cut (option C) is the safer side.

## 2. Formats

Three formats. Each one links to one long film.

| | F1 **The moment** | F2 **The one-minute what-if** | F3 **One fact** |
|---|---|---|---|
| What | One beat of a finished film, re-framed for 9:16: the cold open, the rule's first use, the reveal or the twist | A complete small what-if, start to turn: a new premise or a film's sequel premise | One sourced fact from a film's `claims.md`, felt through you ("a normal person X, you Y") |
| Length | 40-60 s | 40-60 s | 25-40 s |
| Picture | The film's own scene code, new 9:16 camera (option C below) | Staged for 9:16 from the start with kit sets and rigs (option D) | One set, the split-flap counter or a drawn diagram, staged for 9:16 |
| Voice | The film's approved narration for that beat, plus at most one new hook line (local voice B) | New script, local voice B | New script, local voice B |
| Ends on | The film's own open question, then the pointer to the film | The catch and a question, looping back to the first line | The "so what" for you, then the pointer to the film |
| Cost per Short | Lowest: picture, voice and claims already approved | Highest: a new script and new staging | Low: one scene, three or four lines |
| Also good for | Every film yields two | Testing a premise or a Part 2 before making the film | A film whose best fact is buried at minute 7 |

**Recommendation: start with F1 and F3** (cheap, and everything except the hook line was already approved). Add F2
once F1 and F3 have run for three weeks. F2 is how a sequel premise gets tested: a Short that beats the channel's
Shorts median by 3x is a strong Part 2 signal (the template spec's breakout rule).

### The spine of a Short (all three formats)

| Time | Beat |
|---|---|
| 0-1 s | Picture and sound at once: the strongest frame of the beat is the first frame (the film's no-empty-opening rule, tighter) |
| by 2 s | The hook line: the premise as a question, or the stake ("Your best friend just hugged you. Minus eighty-four.") |
| 2-5 s | The rule in one line, if the beat needs it |
| middle | One escalation or one reveal; something changes every 1.5-3 s (films: 2-4 s) |
| last 3-5 s | The open question the film answers, said once. Then one of the two endings below |

**Ending, the owner's choice (samples: END frame):**
- **E1 Loop (recommended for F2).** The last line runs straight into the first line, so a replay is seamless. No fade
  tail. This needs the Shorts tail check to be per pipeline (Professor of Us keeps its 2.4 s tail).
- **E2 Pointer card (recommended for F1 and F3).** A 1.5-2 s end card: the question on a tag and "FULL FILM: THE LINK
  BELOW" over the last shot, while the last line still runs into the first, so the Short loops and points at once (Low Poly's 9.87M Short ends this way). No 2.4 s fade tail.

## 3. Making them: free, code-drawn, local voice

No paid call anywhere in this plan. Picture: the whatif engine. Voice: local Qwen3 voice B (`voices.yaml`), the same
as the films. Music: the film's own score for that beat (rights already recorded), or a cue from the film's stems.
Captions from the script text, never from speech recognition (style.md, Other languages).

### Reframing a 16:9 film for 9:16: four ways (samples A, B, C and C2/C3)

A 9:16 window on a 16:9 frame is only 32% of its width. The AI rents bunk shot (sleeper left, ghost centre, brother
upside down at the right) shows the problem clearly.

| | How | Look | Work | Verdict |
|---|---|---|---|---|
| **A Centre crop** | Crop the delivered 1080p frame to 608x1080 and scale it up 1.78x | Loses the sleeper and the brother; soft from the upscale; tags and bubbles cut off | ffmpeg only | Reject |
| **B Stacked** | The whole 16:9 frame in the middle band, a blurred copy behind, the title tag above, captions below | Everything is visible but small: the figures are a third of the screen. Reads as a clip of a video, not a Short. No Short over 2M views in the research is stacked | ffmpeg only | Fallback only: a beat whose meaning is the whole wide frame (a crowd of cards, a city) |
| **C Re-framed camera** (recommended for F1) | Render the film's scene code at 1080x1920 with a vertical camera: a window at zoom 1.78 or more on the same world, with a per-shot reframe track that pans or cuts between subjects (you, then the ghost, then your brother) | Crisp (vector). Each subject fills the frame. Same animation, timing and sound | A small engine change (below) plus one `reframe.yaml` per Short | Recommended |
| **D Staged for 9:16** (F2, F3) | New scenes built for the tall frame from kit sets and rigs: subjects stacked top and bottom (a bunk bed, a staircase, a phone screen) | The best use of the frame | A new scene per shot, like a film | For F2 and F3, which have new scripts anyway |

**Engine change for C and D (proposed, not built).**
- A viewport context (default 1920x1080) replaces the `WIDTH`/`HEIGHT` constants in `camTransform` and `toScreen`.
- A `ShortCut` composition at 1080x1920 renders a frame range of a film's `Film` with a reframe track. The track is
  keyed to the film's named cues, so it moves with a new take.
- Screen-space overlays (tags, bubbles, the counter, captions) get a 9:16 layout inside the Shorts UI-safe area.
- Sets need no redraw for C. At zoom 1.78 the window stays inside the 1920x1080 set; a few sets may need 100-200 px
  more sky or floor when a reframe pans to an edge.

This is the job of a separate engine session with its own plan (CLAUDE.md: film sessions do not change engine code).

### Captions: three looks (samples K1, K2, K3)

A stranger decides in a second, often with the sound low, so the hook must read without sound.

| | Look | For | Against |
|---|---|---|---|
| **K1 Story tags only** | The film's own stamped tags (THE BAND, `rents out your brain...`), no running captions | Pure film; nothing new to design | Most lines go unread with the sound off; the hook is lost |
| **K2 Paper-tag captions** (recommended) | Two to four words at a time on the cream stamped tag, Rubik 800, in the lower-middle safe band | On brand; readable muted; it looks like the channel's tags, not a template | Calmer than the genre norm |
| **K3 Word-pop captions** | White Rubik 800 with an ink outline, the stressed word in mustard, one to three words at a time | The genre norm; very readable | Looks like every other Shorts channel; harder to keep off faces |

Rules for any choice (from `core/studio/rules/text-placement.md` and style.md): off faces, inside the UI-safe area
(60 px left, 220 px top, 192 px right, 500 px bottom on 1080x1920; the K2 sample draws 160 px on the right), captions centred 60-75% of the way down, never overlapping, one caption
block at a time.

### Sound

- Mix to the channel's `story` loudness (-14 LUFS integrated, -1 dBTP), checked by `omni qc` the same way as the films.
- The film's score under the beat, re-cut to the Short's length; the music swell on the payoff; the voice ducks the
  music the same way as in the film.
- The first sound within 0.5 s and the first word within 1 s (the `opening` check, here a hard check: a Short has no
  second chance).
- Click scan before handing over (owner rule).

## 4. Cadence

The films run at three a week (Mon, Wed, Fri, say). Options:

| | Rhythm | Owner time a week | Note |
|---|---|---|---|
| **K-a: one Short per film, on the day between films** (recommended for three weeks) | 3 a week: F1 from the newest film, or F3 | ~15 min | Each Short points at a film that is already public. Then decide with the numbers (section 7) |
| K-b: two Shorts per film | 6 a week (F1 on film day +1, F3 on +2) | ~30 min | After K-a, if Shorts send viewers to the films |
| K-c: daily | 7 a week, F2 filling the gaps | ~45 min | Only if Shorts become the channel's main door |

Rules for any rhythm:
- A Short links only to a film that is public when the Short goes out.
- The first Shorts point at pause time, the one public film, until the owner makes wants-you-to-fail and AI rents public.
- An empty slot beats a weak Short (the films' rule).
- One render at a time on the Mac (`studio.jobs --queue render`); a 45 s Short renders in under a tenth of a film's time, so it fits
  between film renders.

## 5. Gates (the owner decides; every gate stays the owner's own `omni approve`)

Today `style.md` gives a Short "its own seven gates". For F1 that means re-approving a narration, picture and claims the owner already
approved on the film. Proposed lighter flows:

| | F1 The moment | F3 One fact | F2 The one-minute what-if |
|---|---|---|---|
| **Proposed** | **2 gates.** S1 *Cut*: the owner watches the 1080p 9:16 Short once at 1x, with the packet (beat, title, hook line, end card) and signs. S2 *Publish*: upload private; the owner sets the related-video link and flips it public by hand | **2 gates**, like F1. The one new line cites a `claims.md` row, and the `claims` check runs | **3 gates.** S1 *Packet*: premise, title, first frame and the 100-word script, passed in batches of three like G1. S2 *Cut*: the 1080p Short with the local voice, watched at 1x. S3 *Publish* |
| Today (style.md) | 7 | 7 | 7 |

What stays the same in every flow:
- Only the owner passes a gate. Agents write `awaiting_human` and stop.
- `omni approve` re-runs the stage's automated checks and refuses while any check fails: claims, loudness, clicks,
  similarity, `opening`, and the upload request at publish.
- Uploads are private, through `omni upload`, signed on the exact file (sha256 and metadata digest). The public flip
  and the related-video link are set by hand in YouTube Studio.
- Final watch at 1x: for a 45 s Short the S1 cut watch *is* the final watch, at 1080p. There is no separate 720p round
  unless the owner asks for one.

Code this implies (for the plan, not now): a `studio-whatif-short` pipeline with two or three stages and their
`studio_checks`; `channel.yaml` `formats.short: studio-whatif-short`; style.md's Shorts section rewritten to the
owner's choice.

## 6. Packaging

| Item | Rule |
|---|---|
| Title | At most 40 characters. It promises the hook, not the film's title: "Your best friend: minus 84%". English, readable worldwide. `yt-package` lint for truncation and vagueness |
| First frame | The thumbnail on the Shorts shelf and the frame a scroller sees: the strongest frame of the beat, a face mid-reaction, no text over the face |
| Description | Line 1: the hook as a question. Line 2: "Full film: <film URL>". Then the sources for any fact said (the `claims.md` rows), as for the films |
| Related video | The long film, set in Studio on the Short (the owner, at the public flip). Shorts can't carry end screens or cards; this link is how the viewer gets to the film |
| Pinned comment | Drafted by the agent in `upload.yaml` notes and posted and pinned by the owner: the film's question, then "The full story: <film URL>" |
| On the film | Nothing changes on the film. Later: a "Shorts from this film" line in the film's description |
| Hashtags | None needed. `#Shorts` is not required for a vertical video under 3 min; at most one topic tag |
| Made for kids, AI content | Answered in `upload.yaml` like the films (`made_for_kids: false`, `contains_synthetic_media` from the film's answer) |

## 7. Measures: is it working?

Read 48 hours and 7 days after each Short, from YouTube Analytics (by hand or by the channel-analysis work), into
`channels/say-suppose/analytics/shorts.md`.

| Measure | Where | First bar to look for (to be reset after 9 Shorts) |
|---|---|---|
| Viewed vs. swiped away | Shorts analytics, "Viewed vs swiped away" | 60% or more viewed |
| Average % viewed | Per Short | 80% or more (a loop counts above 100%) |
| Views at 7 days | Per Short | The channel's own Shorts median, once there are 9 |
| Clicks to the film | The Short's related-video clicks; the film's traffic from Shorts | 1-2% of a Short's viewers is a good result (the best case found was at most 2.1%); the key measure for the films |
| Subscribers from the Short | Per Short | Compared with the films' subscribers per 1,000 views |
| Comments with a "what would I do" answer | Read by hand | The audience's top mood (audience.md) |

**Decision after three weeks (nine Shorts):**
- Shorts send viewers to films: go to K-b (two per film) and start F2.
- Shorts get views but send no one: keep one a week as a reach test; put the time back into films.
- Shorts are swiped away: change the hook and captions before the rhythm. Try a second caption look (K2 to K3),
  then the formats.

## 8. The first slate (five Shorts from films we have)

| # | Format | From | Beat | Hook (first 2 s) | Ends on | Links to |
|---|---|---|---|---|---|---|
| S1 | F1 moment | Pause time, 0:00-0:45 | Day twelve: a bus, a kid, ten seconds; back to day one, the alarm frozen | "On day twelve, all that stands between a bus and a kid is ten seconds." | "So what's your first pause for?" | Pause time (public now). **Can go first.** The premise is crowded (Low Poly 13.4M, Lecuden 1.16M), so the bus and the kid lead, not "pause time" |
| S2 | F1 moment | Pause time, the midnight pause (~4:20) | Ten seconds of a frozen city, just for you; a curtain moves in a window that should be frozen | "Every midnight you freeze the city. Just for you." | "Someone else isn't frozen." (a natural loop) | Pause time |
| S3 | F1 moment | Wants-you-to-fail, cold open (0:00-0:50) | Your best friend hugs you; the card over his head runs down to -84 | "Your best friend just hugged you. Minus eighty-four." | "Would you tell him you saw it?" | Wants-you-to-fail, once it is public |
| S4 | F1 moment | AI rents, Night One (0:21-1:22) | The band, the ghost at the laptop, coins in the jar; "$90." "Scam." | "What if a company rented your brain while you slept?" | "Would you sign?" | AI rents, once it is public (samples C, K2 and END are this beat) |
| S5 | F3 one fact | Wants-you-to-fail claim c02 | Exam day: a whole country grounds its planes for 35 minutes so a listening test stays quiet | "A whole country grounds its planes. For a test." | "Now picture being the kid that test is for." | Wants-you-to-fail |

Kept for later: an F2 test of the AI rents sequel premise ("What if AI rented your eyes all day?", `sequel.md`), and
an F3 of AI rents claim c10 (your brain is 2% of your weight and uses about 20 watts).

## 9. Decisions for the owner

1. **Formats:** F1 and F3 first, F2 after three weeks? (recommended: yes)
2. **Reframe:** C, the re-framed camera, for F1, with B only for wide beats? (samples A, B, C)
3. **Captions:** K1, K2 or K3? (recommended: K2)
4. **Ending:** E1 loop or E2 pointer card, per format? (recommended: E2 for F1 and F3, E1 for F2)
5. **Cadence:** K-a, three a week, for three weeks? (recommended: yes)
6. **Gates:** two gates for F1 and F3, three for F2, instead of seven? (the owner's call alone)
7. **The slate:** S1-S5 as listed, S1 first because pause time is public?

After the owner's answers: an implementation plan (`superpowers:writing-plans`) for the engine viewport and
`ShortCut` composition, the `studio-whatif-short` pipeline, and the style.md Shorts section. Then S1 as the first Short
through the owner's gates.
