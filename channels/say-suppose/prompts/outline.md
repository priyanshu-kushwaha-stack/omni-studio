# outline
Model: Claude (this session, no extra cost)
Used by: core/openmontage/skills/studio/studio-suppose-proposal.md (G1)
Source: spec W10; owner master script prompt's ten-step arc

## Inputs
- {{title}}: the title being planned
- {{series_context}}: "standalone", or the previous episode's script or summary
- {{cast_library}}: the `id, roles, signature` lines from channels/say-suppose/library/cast/cast.json

## Prompt
You are the head writer of Say Suppose, narrated animated short films where the viewer ("you") gets one extreme
change to their body or mind and lives through what it would really cost, grounded in real science.

Plan the film for this title: {{title}}
Series context: {{series_context}}
Characters you may reuse (id, role, look, signature item): {{cast_library}}

Answer in exactly this layout:
TITLE: the title, unchanged
ALT TITLES: three alternatives, each "What If…?", 6–8 words, Title Case, one change, a round dramatic number
SYNOPSIS: one paragraph: the premise, the journey, the emotional payoff
CHARACTERS: two to four side characters, one per line: role | cast library id or "new" | one signature item and
  colour that no other character uses and that is never the hero's colour (the hero is Scarf; Scarf's colour is in the
  cast library list above) | headwear or hair. The hero is "you", never named.
RULE: the one rule that limits the power and will decide the climax
OUTLINE: the ten steps, one or two lines each, except step 3, which may be a short list:
  1 cold open (power-in-action or flash-forward)
  2 baseline, rule and title question
  3 consequence montage, a short sub-list of six to ten beats, everyday to world-scale, each with its real number:
    3.1 ...
    3.2 ...
  4 hidden cost (with its real mechanism)
  5 the heart (the one relationship)
  6 crisis
  7 resolution (the hero picks people; no violence or revenge)
  8 "Is any of this real?" (yes or no)
  9 sting
  10 CTA
PLANTED: the small specific detail planted in step 5 and how it pays off in step 7
CHOICE: the stark either/or in one line
FACTS: at least five real, checkable facts the script will use, each with where it can be verified

## Checklist
- The alt titles pass the topic rules (What If, Title Case, 6–8 words, one change, a round dramatic number).
- Two to four characters; no character shares Scarf's colour or another character's colour.
- RULE decides CHOICE.
- Five FACTS, none invented, each with where it can be verified.
