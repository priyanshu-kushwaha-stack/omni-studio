# G1 round 1: What If You Could See Everyone's Lies Today? (2026-11-24)

**Topic.** The owner picked it on 2026-11-24 ("Lies counter") from a shortlist built on the channel analysis of
2026-11-23 (`channels/say-suppose/research/2026-11-23-channel-analysis.md`, PR #65). The owner's words: "Lets take this
learning and not make any changes. First lets create another video here only in this session." So the analysis's
targets went into this film's brief (`brief.md`), and no rule, `taste.md` or `style.md` changed.

**Writer.** Claude Fable 5.1, through `claude -p --tools "" --model claude-fable-5-1`, in one call. The prompt held
`rules/story.md`, `rules/thumbnails.md`, `style.md`, `cast.md`, `taste.md`, `audience.md`, the AI layoff trap film's
packaging as the format example, this film's `claims.md` and `brief.md`.

**Research.** `claims.md` has 18 rows, fetched 2026-11-24 by a research subagent. The session re-checked the two rows
the film turns on at the source:
- c03: "Sixty percent of subjects report telling no lies at all, and almost half of all lies are told by only 5% of
  subjects." (OpenAlex abstract for Serota, Levine & Boster 2010)
- c12: "anywhere from 10 to 200 times". The TED transcript.

## The session's changes to the writer's draft

- **Tag b.** "HE SAID HI." became "BY 9AM?". With the counter's 47 counted as a word, the writer's tag measured four
  words and failed K5. "BY 9AM?" uses the cast note (forty-seven at nine in the morning) and repeats no word of title
  B. The packaging's tag table and K5 line say so.
- Nothing else changed.

## Checks

- `studio.room lint g1 --round 1`: ok, no problems, no warnings (draft sha256 b3ee4026…).
- `title.py`: A 80, B 84, C 84. Each title only notes the mobile cut and "no number". Pair A carries no tag, so the
  47 is its only text. `title-lint.json`.
- Thumbnails (`brand/thumbs/lies`, `thumb-checks.json`), all three:

  | Check | a | b | c |
  |---|---|---|---|
  | K3 head | 37.5% | 37.5% | 37.5% |
  | K4 | 4.89:1 | 4.89:1 | 4.89:1 |
  | K5 words | 1 (the 47) | 3 | 3 |
  | K8 pointers | 0 | 0 | 0 |
  | K9 colourfulness / mean luminance | 54.3 / 0.08 | 62.4 / 0.10 | 70.5 / 0.12 |
  | K11 badge zone | clear | clear | clear |

  K10 is edge contrast only: 13–18:1 on white, 1.1–1.4:1 on the dark feed, as with the channel's other night frames.
  The 47's glow and the mustard head are what separate it on dark.
- The owner saw the rendered sheet (`renders/packaging/g1-sheet.jpg`) and the five lines first. `room present`
  recorded the draft at 2026-11-24T13:13:20Z.

## The room

**Round 1.**
- The first try failed on both seats: `cursor-agent exited 1`, with Cursor and GitHub unreachable from this network on
  2026-11-24.
- Each seat's one re-run, on 2026-11-25, returned ok.
- **Story editor, 3 blockers. All applied in round 2:**
  - #21, the midnight-reset stall: the debate now airs at eight, with a 30-second read-or-forfeit.
  - #3, the 0:30 line gave no gain or risk: rewritten with both.
  - #7, the survey card landed three numbers at once: split, with 60% on the bus and "5% told half" at the boss reveal.
- **Story editor, 2 suggestions:**
  - Make the read unavoidable: applied ("If it's true, reading it costs you nothing").
  - One closing question only: not taken at G1, because the end-card call to action is the template's (rules/story.md
    #19). It is revisited at G2.
- **Claims check, 1 blocker. Applied:** "when they have to write it down, they mostly don't" overstated c11. It now
  reads "a diary study found people lied least in email, though about as often in instant messages as face to face",
  and the narrator's line is the story's own: "The counter just can't hear a keyboard." The think moments, the
  "but what about" list and the claims list were fixed to match.
- **Claims check, 3 suggestions. All applied:** "barely better than a coin flip, about fifty-four percent"; "almost all
  small"; "ten to two hundred".

**Round 2** is an owner-notes round, applying the room's own notes. It registers no owner note.
- Lint ok.
- **Claims check: 0 blockers.** Three precision suggestions (c16/c08 "developmental studies", c12 and c03/c04 cites in
  the premise, c01 "two diary studies") go to the G2 script.
- **Story editor: 3 blockers. Carried to the G2 script** (the round ships on a candidate with no fact blocker):
  - #16, "Nine?" reads as a new rule after halfway. Plant before the midpoint that the sight can spread, and you don't
    know how.
  - No new person after 60%: the crimson stranger first appears at 8:05. Plant them at the stadium at 4:15, the space
    over their head hidden by a railing.
  - #7, the 4:00 card has three numbers. Keep only fifty-four percent.
- **Story editor, 3 suggestions, for G2:**
  - Show the habit change at the close ("Fine" erased, then "Not really").
  - Make the poker night causal.
  - Compress the close to about 40 s.

**Shipped:** round 2 (`room/g1.json`, artifact b2eace56…). `room verify`: room evidence ok. `omni similar`: ok, against
11 videos. Room calls used: 6.

## The owner's pick (2026-11-25)

The owner clicked "Pair a (47 alone)", interrupted, then wrote: **"GO with B."** So the pick is pair B: title B,
"What If You Saw How Many Lies Everyone Told?", with thumbnail b, "BY 9AM?". It is recorded in the proposal packet
(`selected_concept`) and in the checkpoint's `metadata.owner_pick`. `packaging.md` is unchanged and still shows the
writer's recommendation (pair a). G1 stays awaiting_human until the owner's own `omni approve`. No `taste.md` entry
was written, because the owner asked for no changes to channel files in this session.
