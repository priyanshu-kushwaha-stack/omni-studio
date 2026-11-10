# The idea room: how what-ifs are chosen

Owner, 2026-11-09: topics come from independent research by several creative models, a neutral moderator, ratings by
every model, and agreement on one scored list; "final decision should definitely be mine." Run before every batch of
five, at the weekend slate session. The owner picks; G1 follows.

## Seats

| Role | Model (2026-11-09) | Family |
|---|---|---|
| Researcher | Claude Fable 5.1 | anthropic |
| Researcher | GPT-5.6 Sol | openai |
| Researcher | Gemini 4 Argon | google |
| Researcher | Grok 4.7 | xai |
| Researcher | Kimi K3 | moonshot |
| Moderator | GLM 5.2 | zhipu (proposes nothing) |

All run through `cursor-agent -p --mode ask` from an empty folder, on the Cursor subscription. The session that runs
the room only passes files, shuffles lists and computes medians by script; it gives no rating.

## Rounds

1. **Ideas.** Each researcher alone, with the channel brief and the list of neighbours' titles not to copy, and no
   other constraint, brings 10 what-ifs: title, tag, hook, wrong belief, mind-boggle, person, why now (with links).
2. **Merge.** The moderator merges duplicates (same daydream and same twist become one entry, crediting every
   proposer), marks each entry against the pick card below without dropping it, and rates every entry.
3. **Evidence.** Public demand evidence for each entry (recent same-format outliers, search signals), gathered from
   public pages through the browser; no API with the owner's credentials, no yt-dlp.
4. **Rate.** Every researcher scores every entry 1-10 on click promise, story engine, felt and relatable, new
   perspective, buildable, and overall; blind, each with its own shuffled order.
5. **Converge.** Each researcher sees the anonymised spread (median, range, the strongest reason for and against) and
   may revise its scores with a reason. At most two rounds; stop when the spread narrows.
6. **Final list.** Ordered by median overall (ties: mean, then demand evidence), with the proposers, each model's
   score and the dissent. The owner picks the batch.

## The pick card (revised 2026-11-09)

A topic must pass all nine; a fail is shown, never hidden.

1. A daydream people already had, for the one named viewer (`story.md`).
2. You can live it, from an ordinary moment of that viewer's week.
3. A wrong belief it breaks, named before writing.
4. One belief-breaking fact and one late mind-boggle, both sourceable.
5. The mind-boggle lands late, after the story has earned it.
6. Three jumps of consequence to you and your person, each bigger; the planet or a lifetime is one image, not a
   forced rung.
7. Stakes the premise earns; a person to lose only when it does.
8. Buildable in paper-cut this week (a new set that is the long pole fails).
9. Not the same twist or title a neighbour used in the last 90 days; the same daydream with a new belief and a new
   thumbnail promise is eligible.

## Demand evidence (scorer, revised 2026-11-09)

- Count recent (last 12-18 months), small-channel, same-format second-person what-ifs most; old millions on big
  channels barely count.
- A twist title loses at most a point or two to a flood of plain-title copies.
- Momentum decides this month's slot, not the rank.
- Health, politics and tragedy are review flags (a neutrality or explain-never-advise pass), not automatic deductions;
  limited-ads territory (death dates, disaster as spectacle) keeps a real penalty.
- Production cost is a scheduling constraint and a tiebreak, not a score.
- The spread between models is shown; a high median with a wide spread is a bet, and is labelled so.

## Pitch cards (owner, 2026-11-10)

Pipeline v2 (`docs/superpowers/specs/2026-11-10-say-suppose-pipeline-v2-design.md`, section 2, room 0). Every entry on
the final list carries three more lines, so the owner picks with the meaning in view:

- **The under-question**, in the viewer's words ("Am I good, or just watched?").
- **The thought experiment underneath** (Ring of Gyges, the experience machine, Funes): the writer's lens, never a
  citation on screen.
- **The kind:** mirror (about you, other people, time and worth), power, or frame-break. Mirror topics pulled hardest
  in the 2026-11-09 evidence; a power topic needs a twist title to compete.

## The dreamer (owner, 2026-11-10)

Claude Fable 5.1 pitches from craft alone, with no web: the wish, the mirror, the under-question. It sits beside
whichever researchers the seats table names, brings its ten like the others, and its entries get demand evidence and
ratings like every other entry. In the first run it proposed or co-proposed 2 of the 5 films the owner picked.
