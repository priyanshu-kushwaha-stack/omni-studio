# Room report, G2 (story_script)

Shipped: none. No round is a candidate (lint ok, an ok verdict from story, fact, no fact blocker), so the gate check will fail.
Calls: 2 of 16

Owner first: round 1's draft went to the owner at 2026-11-26T11:27:41+00:00

## Open notes in round 1

- claims check (fact) blocker, line 256: "Two researchers at MIT built their own model and found the same split (c01). The skilled get sharper. The rest lose the skill (c02).". Row c01's verbatim quote is "AI use can leave the worker worse off than with no AI". That quote does not support "found the same split" (which belongs to c02). Line 256 misattributes c02's finding to c01 while completely omitting c01's actual finding that leaning on AI can leave workers worse off than with no AI at all. Fix: Two researchers at MIT built a model where leaning on AI can leave workers worse off than with no AI (c01). In their model, the skilled get sharper, while the rest lose the skill (c02).
- claims check (fact) blocker, line 211: "Each company keeps the whole saving from a layoff and bears only a slice of the spending it destroys. The rest lands on its rivals (c09).". Row c09 is a contested theoretical model result (arXiv preprint 2603.20617), not an empirical measurement. The sentence asserts the dynamic as an unconditioned real-world fact without the required caveat stating that this occurs within the model. Fix: In their model, each company keeps the whole saving from a layoff and bears only a slice of the spending it destroys. The rest lands on its rivals (c09).
- claims check (fact) blocker, line 102: "Homework scores, up 18 percent (c04).". Row c04's verbatim quote is "Their homework scores rose by 18% relative to the pre-adoption mean." Stating "Homework scores, up 18 percent" overstates the finding as a general increase by omitting the baseline comparison ("against their own old average"), unlike the accurate qualification used for c06 in line 112. Fix: Homework scores, up 18 percent against their own old average (c04).
- claims check keep, line 112: "Then the monthly exams. Closed book. No AI in the room. Within six months, down 20 percent, against their own old average (c06)."
- claims check keep, line 213: "They tried Dana's fixes in the model. Retraining. A basic income. Just knowing about it. None of them stopped the race (c10). One thing did. A tax on the automation itself (c11). One model says so. Nobody has measured it."
- claims check keep, line 321: "A group of researchers argue this is the real risk (c13). No robot army. No evil machine. A slow handover of one small decision at a time, until people aren't steering. They argue it. Nobody has measured it."
- story editor (story) blocker, line 401: "Fifty-two programmers learned a brand new tool, in one small experiment at Anthropic (c15). Half had AI. On the test afterwards, the AI group scored about 50 percent. The group without it, 67 (c15).". Check #7 fails: this stacks three numbers before any result lands on you; line 403 stacks two more, and line 112 similarly combines six months with 20 percent. Fix: Separate each number with your choice on screen: “Fifty-two programmers learned a new tool in a small Anthropic experiment (c15).” Your hand approaches OLD SETTING. “With AI: about 50 percent.” Your hand stops. “Without it: 67.” You select EXPLAIN WHY. “Ask conceptual questions: 65 or more (c16).” The ANSWER FOR ME option appears. “Hand over the coding: under 40.” Likewise split line 112 into “Six months later.” followed by your meeting-room action, then “Closed-book scores: down 20 percent against their old average (c06).”
- story editor (story) blocker, line 323: "Count the screws you've already taken out. And the next morning, the sky is a colour you've never seen.". Check #5 fails: the decisive handoff and the solar event are joined as “and then,” although the storm should test the weakness created by the handoff. Fix: Replace with: “Nothing has broken yet. But the next morning, the sky is a colour you've never seen.”
- story editor (story) blocker, line 301: "> SCENE: The back of the hall, one row behind the last. A figure in a long crimson coat, the only eyes in the room with no ring. The camera passes and does not come back.". The no-new-person-after-60% check fails: the stranger first appears after roughly 6:00 in a 9:50 film. Fix: Plant the crimson-coated stranger at the far end of the train in line 57, stepping off as your rings turn cyan; line 301 then becomes the stranger's return, not an introduction.
- story editor keep, line 177: "It's the longest conversation anyone has ever had with HR."
- story editor keep, line 248: "You have never asked it a question."
- story editor keep, line 297: "Somebody wrote it, you think. Somebody must have. Somebody didn't."

## Rounds

| round | lint | seats ok | blockers | judge |
|---|---|---|---|---|
| 1 | ok | 2/2 | 6 | - |
