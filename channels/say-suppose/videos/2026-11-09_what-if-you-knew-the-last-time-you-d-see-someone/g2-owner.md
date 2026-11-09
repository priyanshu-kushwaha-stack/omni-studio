# G2 for the owner: What If You Knew the Last Time You'd See Someone?

**Status: awaiting you (G2, story_script).** Read the script in full below before any asset is made. Nothing is
generated, no paid call was made, and no gate was passed.

- Script: `script.md` (round 3 of the room, shipped by the judge; room evidence verified). 499 spoken words (cites removed): 3:56 at 115 words a minute played at 1.1x, plus a short gap after each line, 56.2 s of `> HOLD:` beats (17% of the runtime) and the action between lines: about 5:39 in all. Beat times above are from that estimate; the rough cut sets the real ones.
- Facts: `claims.md`, two sourced rows spoken: c01 Tim Urban's "Tail End" 93% (his own guesses, said so) and c02
  the last-chocolate study (O'Brien & Ellsworth 2012). c03 (festival special trains, PIB) and c04 (Fung, Carstensen &
  Lutz 1999) were sourced and then dropped as lectures in round 1. Every quote was checked against the fetched page.
- Sound intent: `cues.yaml` (sound #1). Reading: `research.md`. Room: `room-g2.md`, `review-g2-round1.md` to `-round3.md`.

## Decisions for you

1. **Three open blockers** (the room ran its three rounds; these came in round 3 and are not applied). Take them, or
   not, with your notes:
   - **The chocolate fact, lines 53-54** (first-time viewer, "the viewer's week"): replace both with "The stall outside
     college never tasted like this. You were always going back tomorrow." That cuts c02, the one fact under the
     title's own idea (lasts feel different). The alternative keeps it as one short line: "Students told one
     chocolate was their last picked it as their favourite 64% of the time (c02)." My pick: the one-line version.
   - **The carriage, line 103** (retention editor, no new rule after halfway): your own reflection has a counter.
     Fix: "In the dark window, your reflection watches the other counters flip." My pick: take it.
2. **The last line.** The G1 room kept "She's still at the door. Of course she is."; round 1's first-time viewer
   blocked its first sentence as saying the shot, so the draft ends on "Of course she is." Two seats ask to restore
   it in round 3. Your call.
3. **One change from G1's premise.** The film opens on the night you leave, not "next month": a counter of "the
   times you'll see her again" would otherwise count every day you are still at home. The thumbnail's door, wave
   and 42 are unchanged and on screen inside the first 4 s.
4. **The day's room cap.** You said "no limits for today", so the room ran past the studio's 80 calls on 9 Nov.
   For this run only, `daily_cap` (in `limits.yaml` and `room.yaml`) and the seat timeout (600 to 1500 s, because Grok
   4.7 needs about 600 s for this script) were raised in this worktree. Both are restored and nothing about them is
   committed. The room used 19 of this script's 41 calls.

## The room's scores

| Seat (model) | Round 1 | Round 3 | Blockers r1 / r3 |
|---|---|---|---|
| first-time viewer (Grok 4.7) | click 4, second hook 8, habit 8, feeling 5, week 8, would finish 6 | click 8, second hook 9, habit 8, feeling 8, week 4, first watch 6 | 4 / 2 |
| retention editor (GPT-5.6 Sol) | story 7, retention 8 | story 8, retention 8 | 2 / 1 |
| fact-checker (Gemini 3.7 Flash) | 10 | 10 | 0 / 0 |
| voice director (Claude Sonnet 5.5) | feeling 8, last line 9, spoken 7, breath 6 | feeling 8, last line 8, spoken 8, breath 7 | 1 / 0 |
| animator (Claude Sonnet 5.5) | buildable 7, cue sheet 8, music follows 8 | buildable 7, cue sheet 9, music follows 6 | 0 / 0 |

Round 2 is not a candidate: the first-time viewer timed out twice. The judge (GPT-5.6 Sol) picked round 3 over round 1.
Lines the seats asked to keep: "You thought it would drop when you left. It drops when you walk in." / "It wasn't her
clock. It was your timetable." / "Saying no isn't a plan. A ticket is." / "You're not at the start of your time with
her. You're at the tail end." / "He prefers yours."

## The script in full

> SITUATION: Your first job is in another city and you leave tonight; mom waves from the door, like every morning, and you never look back.
> DESIRE: To start your own life, with home always there for "later".
> CONFLICT: A counter over mom's head says forty-two, the times you'll see her again, and every change you make only drops it.
> CHANGE: An unplanned Friday train home makes the counter climb: it counts your trains, not her years.
> RESULT: You leave home again, and at the corner you turn round and wave back.

### [00:00] The change
> MOOD: dusk
> SCENE: The thumbnail's picture. Dusk, the porch light on, the front door open. Mom in the doorway, smiling, waving. You at the left with a backpack and a rolling bag, phone up in your left hand, lifting the other hand without turning round. An auto-rickshaw idles at the gate.
> HOLD: 0.2 s. A soft porch-bell note on the first frame; the first word comes at once.
Every morning, she waves. You wave back. Not looking.
> SCENE: Clack-clack-clack: a split-flap counter drops into place over mom's head and settles on 42. You look up mid-wave. Close on your face: brows up, then worried.
> TAG: 42
Forty-two.
So what if you knew the last time you'd see someone?
> SCENE: Mom, unaware, still waving. You stare at the counter. She points at your bag; you pat it.
> BUBBLE: Mom: "Call when you reach!"
Tonight you leave. First job. Another city.
Forty-two goodbyes at that door. What would you do with them?

### [00:20] The rule
Nobody else can see it. Just you.
> SCENE: The auto pulls away. Through its back window, counters over three heads on the lane: the neighbour watering plants, the paan-stall owner, the kid on a cycle; the rest of the lane is a blank flat layer.
Everyone you know has one. The times you'll meet again. In person. If your plans stay as they are.
Calls don't count. Only being there.
Change your plans, and it does the maths again.
> SCENE: You twist round in the seat. Mom, small now at the lit door, still waving. Her counter still reads 42.
Two trips home a year. Keep that life, and the door gets forty-two more.
> SCENE: You turn back to the front and shrug. Phone up again.
It's a number. It only counts down.
And she'll be at that door. She always is.
> HOLD: 2.5 s. The auto turns the corner; the porch light drops out of frame. Ident, 3 s, from `brand/README.md` (picked at G4).

### [01:05] The first jump: the city
> MOOD: morning
> SCENE: A platform in the new city, side-on: five figures and a chai stall, every head with a counter; the rest of the crowd is a blank flat layer behind. (The same platform set is reused for the Sunday station.)
> HOLD: 2 s. The picture only this premise can show (story #8): you step off the train, bag in hand, turning slowly, and counters bob over every head on the platform like price tags, a few flipping as people meet.
Next morning. A new city.
> SCENE: A chai-wallah on the platform hands you a glass. His counter reads 1.
The chai-wallah on platform two. One.
One last chai, from a man you'll never see again.
> HOLD: 1.5 s. You sip. Your eyes go wide. You look at the glass, then at him.
It's the best chai of your life. Station chai.
Maybe it's not just the chai.
In one taste test, students were told, "This is your last chocolate."
64% picked it as their favourite. Any flavour (c02).
> SCENE: You turn to go back for a second glass. Stop. Look at the 1. Walk on, smiling.
You almost go back for another glass. Then it wouldn't be the last.
> SCENE: The metro, packed. A woman with a tote bag holds the pole beside you. Her counter reads 400.
> TAG: 400
Metro. A total stranger. Four hundred? You'll never see her again.
> HOLD: 2 s. Quick cuts, two-thirds of a second each: the next morning, the same woman, the same pole. The next. The next. On the third she glares at you.
She's your commute now.
> MOOD: day
> SCENE: The office. A colleague with a lanyard and a big smile waves from his desk. His counter reads 3000.
> TAG: 3000
At the office, Mehta from Accounts. Three thousand.
So you hide.
> HOLD: 2 s. You tiptoe into the meeting room and drop into the last empty chair. It's beside him. He beams.
> BUBBLE: Mehta: "Saved you a seat!"
Three thousand meetings. Most of them, actual meetings.
> SCENE: Friday evening, your rented room. The bed is unmade, the pillow inviting. You look at the train app (train icons, no text), then the pillow.
First Friday. Go home, or sleep till noon?
> SCENE: You already have the bag on your shoulder, running for the train.
Home. Obviously.
> HOLD: 2 s. The train crosses fields at dusk; your face at the window, phone dark in your lap.

### [02:15] The first weekend
> MOOD: dusk
> SCENE: The porch at dusk. Mom at the door with a glass of chai, steam rising. As your foot touches the step: clack. Her counter goes from 42 to 41.
You thought it would drop when you left. It drops when you walk in.
This visit is already counted.
> MOOD: lamp
> SCENE: Inside, one warm lamp. Mom puts a third helping on your plate before you finish the second.
She's had the chai ready since your train left the city.
> SCENE: Grandpa in his chair, counter reading 8. He raises both hands: the story is starting.
Grandpa. Eight.
And the story. The bicycle and the buffalo. You've never once stayed for the end.
> SCENE: Your phone buzzes. You look at it, then turn it face down and sit on the floor by his chair.
> HOLD: 3 s. Grandpa acts it out: pedalling, the buffalo, the ditch coming. Then he stops. Frowns. Looks at you.
> BUBBLE: Grandpa: "How does it end?"
You don't know it either.
> MOOD: dusk
> SCENE: Sunday evening, the station. Mom presses a steel tiffin into your hands. Her counter reads 41.
> BUBBLE: Mom: "Next month?"
You say, "Let's see. Work."
> SCENE: Clack. 41 goes to 39. You stare at it as the train pulls in.
> HOLD: 2 s. The train doors close between you. She waves. You wave, phone up.
Thirty-nine. You didn't lose one. You lost two.
"Let's see" was a plan. And it did the maths.

### [03:05] The carriage
> MOOD: night
> SCENE: The night train, side-on, a cutaway of the carriage. Seated passengers in a row, each with a counter. Stations drift past as a background layer. The stranger, crimson head, long dark coat, sits at the far end; their counter faces away.
> HOLD: 5 s. The train's rhythm. At each station one passenger steps off to someone waiting on the platform, and both their counters flip down by one as they meet. In the dark window, a dim copy of your head, with its own counter.
> SCENE: You open the tiffin on your lap. Count on your fingers.
Thirty-nine. Fine. An allowance. You'll spend it carefully.
It only counts down. You've watched it.

### [03:15] The second jump: the year
> MOOD: day
> SCENE: The office. Calendar on the wall, the October page. A diya sticker on one date. A deadline circled in red over it.
> TAG: OCTOBER
October. Diwali. And a deadline.
Thirty-nine is plenty. Skip this one. Save it for later.
> MOOD: night
> SCENE: The office at night, almost empty. Through the window, the platform set as a far layer, flipped and dimmed to night, packed with people and bags going home for Diwali. You type.
> SCENE: Video call. Mom holds the phone up to show the diyas on the porch. You smile into the screen.
Calls don't count.
> SCENE: Insert: the steel tiffin, empty, on your desk.
> HOLD: 4 s. Cut to the porch at night, diyas along the step, mom alone in the doorway. The camera drifts across the door. Her counter: clack, 39 to 38.
Thirty-eight. You skipped it to save it. It's just gone.
> SCENE: Back at the office. Over the partition, Mehta holds out a samosa. His counter reads 3000.
Mehta, meanwhile, is doing fine.
> MOOD: lamp
> SCENE: Your rented room. You sit on the floor, back to the bed, doing sums on the paper napkin from the tiffin.
Thirty-eight visits. A weekend each.
> SCENE: A paper diagram draws itself, no labels: a long strip of squares, one for every day you lived at home, filling the wall. Beside it, a tiny strip for the weekends left.
A writer, Tim Urban, did this sum. On his own guesses.
By the time he left school? 93% (c01).
Of his time with his parents, in person. Used up.
Your strip is thinner.
> HOLD: 2.5 s. The ceiling fan turns. You look at the long strip, then the short one. The music thins to one instrument.
You're not at the start of your time with her. You're at the tail end.

### [04:10] The third jump: a lifetime
> MOOD: dusk
> SCENE: The office, Friday, six o'clock. Bags going on shoulders. You look at your phone: no festival, no plan.
Friday. No festival. No plan. Train, or sleep?
> SCENE: You're already on the train, forehead on the window.
Train.
> HOLD: 2 s. The same fields at dusk as the first Friday; this time you're watching them.
> SCENE: The porch at dusk. You walk up the path, unannounced. The door opens: mom, dishcloth in hand, eyebrows up. Her counter reads 38.
Thirty-eight. Here comes the drop.
> SCENE: Your foot touches the step. Clack: 37. Mom pulls you in by the sleeve, then holds the door, looking at you.
> BUBBLE: Mom: "Next month?"
You open your mouth to say "Let's see".
> SCENE: You stop. Close on your face. You look at the counter, then at her.
> BUBBLE: You: "Next Friday."
> HOLD: 9 s. The wordless peak. Slow motion. Clack: the counter flips the wrong way. 38. 39. Then the flaps run, faster and faster, upward, a blur, and settle on 260. Your face: shock, then a laugh. Mom, who sees no counter, just shrugs and goes in for the chai. The music drops to one held note, then the theme enters.
> TAG: 260
> SCENE: Slow push-in on 260. Behind it, a paper ghost of a train timetable slides past: train icons only, no text.
It wasn't her clock. It was your timetable.
It only counted down because you only ever planned less.
> MOOD: lamp
> SCENE: Next Friday, the dinner table at home, the lamp. Mom ladling dal. Your phone lights up beside your plate: an envelope icon and a green tick button, no lettering.
But then, the offer. A bigger job. A bigger city. On duty every festival.
> SCENE: Your thumb hovers over the green tick.
> TAG: OFFER
> HOLD: 2 s. Across the table, mom's counter clacks down, fast, flap after flap, and stops on 9. She keeps ladling, unaware.
> TAG: 9
Nine.
The offer, or the Friday train?
> SCENE: You tap the red cross. Clack: the flaps run up from 9, and stop at 38. Close on your blink.
> SCENE: The train app (icons only): next Friday, then the repeat icon. The flaps run up to 260. You turn the phone face down and hold out your plate.
Saying no isn't a plan. A ticket is.
More dal.
> HOLD: 1.5 s. Mom piles it on, laughing. The counter is out of frame.
> MOOD: day
> HOLD: 6 s. The same doorway through the seasons, a second and a half each: the monsoon, you dripping under an umbrella; Holi, colour on both your faces; winter, a shawl; summer, mangoes on the step. Mom's hair greys a little. Each arrival, one flap down: 260, 259, 258, 257.
> MOOD: lamp
> SCENE: The montage stops on winter, by Grandpa's chair. His counter, 8 when you left, has climbed to 31. He starts the bicycle and the buffalo, hands up. Stops mid-story. Looks at you.
> HOLD: 2 s. You take over, both hands up, the way he does it: pedalling, the buffalo, the ditch. He leans forward.
Grandpa's story? You learned the ending. Well. You made one up.
He prefers yours.

### [05:25] Back to you
> MOOD: dusk
> SCENE: Sunday dusk. The door. Mom waves. You walk to the gate with your bag, the auto waiting. Your phone is in your pocket.
> HOLD: 4 s. At the corner you stop. Turn round. Wave properly, the whole arm, your back to the camera at centre-left. Mom, small in the doorway at the left third, waves back harder. Her counter is too small and too blurred to read; we never see the number. The right third stays empty.
Of course she is.
> HOLD: 1 s. Black.
> SCENE: End card: you, small, in the left two-thirds, holding the steel tiffin; the like, subscribe and comment tags beside you; the right third empty for end screens.
Whose number would you want to see? Tell us below.

---

Approve G2 as it is, approve with notes, or change it?
