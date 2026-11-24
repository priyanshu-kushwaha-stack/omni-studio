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

Both seats ran beside the owner's read, and both failed with `cursor-agent exited 1` and empty output:
- the story editor (gpt-5.6-sol-high);
- the claims check (gemini-3.8-flash-high).

A direct test of `cursor-agent` returned `Error: [unavailable]`. From this network api2.cursor.sh and github.com did not
answer at all, while google.com did. So this is a network outage, not the draft.

Each seat has one re-run left in round 1. It runs when Cursor answers again; its notes then join the owner's notes for
the owner-notes round, as the room skill says.

## Status

`checkpoint_proposal.json`: awaiting_human. Only the owner passes G1, with `omni approve`. Not pushed yet, because
GitHub is unreachable from this network. It is committed locally on `claude/lies-counter-g1`.

## The owner's pick (2026-11-25)

The owner clicked "Pair a (47 alone)", interrupted, then wrote: **"GO with B."** So the pick is pair B: title B,
"What If You Saw How Many Lies Everyone Told?", with thumbnail b, "BY 9AM?". It is recorded in the proposal packet
(`selected_concept`) and in the checkpoint's `metadata.owner_pick`. `packaging.md` is unchanged and still shows the
writer's recommendation (pair a). G1 stays awaiting_human until the owner's own `omni approve`. No `taste.md` entry
was written, because the owner asked for no changes to channel files in this session.
