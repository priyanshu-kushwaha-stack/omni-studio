# G2 review, round 2: AI predicted every choice you make, v2 (2026-11-14)

The owner's note, relayed by the coordinator session (2026-11-13): "most of the videos we made so far are emotional sort
of so thats why asked. I want exciting stuff." After the audience research: "Yes, update rules". The channel's rules
changed that day (PR #57, carried here unchanged in 3c7c451): the power is the star (`rules/story.md` #20), loopholes
are closed on screen (#21), every scene has a laugh and sadness is seasoning (#22), the peak is a triumph, a reveal or a
mind-boggle (#18), a person to lose is optional (#9), and the thumbnail shows the power working and someone stunned
(K17). G2 stays `awaiting_human`; nothing here approves anything.

## How v2 was made

- **Writer:** Claude Fable 5.1 (`claude -p --tools ""`), from v1, the new rules, the audience research, the room's G2
  notes and the open notes from the v1 cut. The first two calls ran out of output (one omitted files, one spent its
  budget planning); the third wrote the script with planning capped, and a fourth wrote say.yaml, the change table, the
  thumbnail verdict and the sequel.
- **Room:** owner-notes rounds, registered on the note above.
  - Round 2: the claims check found 0 blockers (facts 10, fidelity 10, scope 10); the story editor raised 3 blockers.
  - Round 3, on the merged draft: the claims check found 0 again; the story editor raised 3 more.
  - Report: `room-g2.md`.
- **The session's merges** of the room's notes into Fable's draft are listed below. No spine line was changed, and no
  fact was added.

## Every change from v1, and why

Fable's change table is in `changes-v2.md`: 66 rows, each with its rule or note. It also has the escalation ladder, the
loopholes closed on screen, the laugh in each section and the one tender beat. In short:

- **The middle is a ladder of clever uses that escalate (#20):**
  - the mirror (a backfire);
  - the coin ("it saw you reach");
  - reading the lunch queue for half rent (new section, Your Stall);
  - the pickpocket's bag (a narrow escape);
  - the whole city copying you, until the football goes nil-nil on the news (the new Newsreader role).
  - The world reacts wider each time: your bathroom, your stall, the platform, the city, the television.
- **Loopholes said and answered on screen (#21):**
  - do the opposite;
  - let a coin choose;
  - tear the tag off;
  - call the police;
  - bet on it;
  - everyone hand over the key.
- **A laugh in every section (#22).** The sister thread ("Someone's at my sister's. Tonight."), the joke not told
  (TELLS JOKE 62%), the date couple and the face in hands are cut. The one tender beat is the coffee on the crate in Red
  (about 15 s, with "That cost you." inside it), well before the last two minutes.
- **The peak is a triumph (#18).** At the thumbnail's frame you hold out the key, his card climbs 94, 96, 98 and goes
  blank: the first blank card the city has made. Your bubble is the running gag, "Trust me?". The court is stunned, the
  coffee seller drops her phone, and the kid says "Do it again." The city's score flaps down for the first time.
- **The ending is a twist and a cliffhanger, never a goodbye.** By breakfast the city has a card for your trick (the
  copycat queue, "Confidence is back to ninety-nine."), and the kid on the train has a card with nothing on it. The
  closing question is a choice put to the viewer: "would you pay full price to make your card go blank?"
- **The open notes from the v1 cut:**
  1. The title question is spoken at about 0:11 on the cut (v1: 19.6 s). The question card is at 0:07 in the script;
     the narration's 2.4 s lead-in and the skit's holds land it at 11.1 s.
  2. A tag is on the opening frame: both cards drop over the key held out across the box in the first half second.
  3. The stakes ("Obey your tag, and your rent halves. Break it...") follow the question, before 0:30.
  4. One number per sentence: the c04/c05, c07, c09, c17, c20 and c24 lines are split.
  5. Every card on screen is a `> TAG:` line. The invented "CALLS MUM 94%" is gone with the tourist's table.
  6. The sounds are named where they happen. The cup's scrape on steel, the shutter's rattle and clank, the hinge, the
     clatter of the dropped phone and the key's clink are written into the directions and placed in the scenes.
  7. From the G2 room: the key is held out in the opening; c24 stays at The Board, with each sentence cited; Merton's
     "can"; c18 is cited on the Goodhart line.
- **Keep lines and darlings:** all three darlings stay, word for word. The room's report lists two keep lines as "lost";
  both were split into one-number sentences (the room's own round-1 note 3), not cut.
- **New role:** Newsreader (`voices.yaml`: a crisp female alto, a TV newsreader in her thirties). The Worker, the Date
  and the Sister no longer speak.

## The room's notes on v2, and where each went

| Round | Seat | Note | Taken? |
|---|---|---|---|
| 2 | story editor, blocker | The train: passengers shifting away is rejection in the last two minutes (#22) | Taken: they lean over to read your crimson cards, their own cards flap to NOSY 99%, and they snap back to their phones, caught |
| 2 | story editor, blocker | "So, would your tag be blank?" asks for an outcome, not a choice (#19) | Taken: "So, would you pay full price to make your card go blank?" |
| 2 | story editor, blocker | "Morning. A queue at your stall..." says what the shot shows (#11) | Taken: "By breakfast, your one surprise is the city's newest half-price trick." |
| 2 | story editor, suggestion | Cut the hundred and sixty teams (c24) | Not taken: the G1 room asked for it at The Board. Owner's call |
| 2 | story editor, suggestions | Two rewordings in The City Plays | Not taken: longer lines for the same beat |
| 2 | claims check, suggestions | Cite c24 and c07 once per passage instead of per sentence | Not taken: the citations are not spoken, and per sentence keeps each number traceable |
| 3 | story editor, blocker | Red runs sad: the coffee refused, the platform, the diagrams (#22) | Taken: one comic chase. The coffee seller slides the cup away each time his card predicts the reach; the commuters squeeze onto the pickpocket's bench ("Plenty of room, everyone."). "Landlord: Nothing personal." is cut. The facts and the keep line stay |
| 3 | story editor, blocker | Reorder The City Plays: kid, magician, pickpocket, football, train (#20) | Not taken, for the owner: the pickpocket comes first because it is your own first use on a stranger; the kid, the magician and the football are the city copying you, and they widen to the news |
| 3 | story editor, blocker | The narration repeats the kid's scene at the end (#11) | Taken: that line is cut, and the last line is "And the city hasn't noticed yet." |
| 4 | story editor, blocker | The coin loophole: predicting the flip does not predict the coin's result (#21) | Open, for the owner. Its fix: the card waits for the coin to land, then forecasts what you do with the result ("It doesn't have to guess the coin. It waits for it to land."). A one-line change at the next draft |
| 4 | story editor, blocker | UNPREDICTABLE as a lasting crimson label (thirty days) is a new mechanic after the midpoint | Open, for the owner. Its fix: show the blank card instead of UNPREDICTABLE after the peak, and drop the thirty days |
| 4 | story editor, blocker | Length: cut to about 750 words and compress The Board and The Queue | Not taken: it measures at 115 words a minute (the channel's pace is 155, owner 2026-11-11), and the owner removed the length cap (2026-11-08). The owner's watch decides |

Round 4 ran on the final script so that `room verify` matches what was voiced and cut; its notes were not merged, so the
room does not loop. The claims check found 0 blockers in every round.

## Thumbnail (K17)

The writer's verdict (`thumbnail.md` in the change set) is to keep pair a's frame. It fails K17 as drawn: your best
friend looking down at the box reads as shame, nobody is stunned, and the key was a brass dot at feed size. Changes
made in `brand/thumbs/predict/`:
- your friend is stunned, his eyes coming up to you (brows raised, mouth open);
- the key is drawn 2.3 times larger, about 12% of the frame width;
- you stay shocked.

Two tags are rendered for the owner to pick: "TRUST HIM?" (the G1 pick) and "TRUST ME?" (the running gag and the peak's
bubble; the writer recommends it). The film's key shot stages the same frame. **This is a change to the approved G1
packaging, for the owner to accept or reject.**

## Main merged mid-round (2026-11-15)

Main brought #57 (already carried here), #58 (the qc opening check is a warning) and #59. #59 gives the channel voice B
as its narrator (owner, 2026-11-15) and adds new owner notes for every film. What changed here because of it:
- The narration is re-voiced with voice B (`voices.yaml`, `brand/voice/narrator-b-cool.wav`). The characters keep
  their own voices.
- Click mutes are measured again on the new takes and placed after speech, never inside a word (the AI-rents film's
  "voice at 5:58 broken").
- The builders were given these notes:
  - a new action every 2-4 s;
  - jokes performed on screen;
  - a role tag at each recurring character's first close-up;
  - no card on a face;
  - no anonymous foreground head.
- The script needed no change for #57: its peak is a triumph and it ends on a twist and a cliffhanger. The thumbnail's
  promise is in the first 7 s: the key held out under two tags at 0:00.

## The 720p first cut (v2)

`renders/firstcut/firstcut-720p.mp4` (git-ignored): 1280x720, 10:24, built on v2 as merged. The v1 cut is kept in
`renders/firstcut-v1/`. qc story_script passes on the cut: claims and clicks.

- **Voices:** all free and local. The narrator is voice B (83 takes re-made); the characters keep their designed
  voices, plus the new Newsreader. Six click mutes (`mutes.txt`), each before the first word or after the last, never
  inside speech.
- **Score:** one cue per section (`scenes/sound.ts`).
  - Sixty Per Cent is now on mischief; the sad "warm" cue is retired.
  - At the key, the thinned theme runs under 94, 96, 98, then 1.7 s of nothing for the blank card, then the light
    theme in full for the triumph.
- **Sound fixes on this cut:**
  - The wonder cue had a drum hit that landed in a narration gap and failed the clicks check. The cues now go through
    `scenes/soften_cues.py`, and the originals are kept as `.orig.wav`.
  - The tag's flap and the paper tear have softer attacks.
- **New effects** (`scenes/make_sfx.sh`): a cup or plate scrape on steel, a paper tear, the train doors, the shutter's
  rattle and clank, and a cup set down. They are placed where the script names them.
- **Scenes:** built by four builder agents on the shared kit, each checked on contact sheets through the render queue.
  - The opening frame is the thumbnail counter with the key held out, and the first tag drops by frame 6.
  - Role tags (YOU, BEST FRIEND, COFFEE SELLER, LANDLORD, PICKPOCKET, KID, MAGICIAN, NEWSREADER) sit at each
    character's first close-up, off the face.

What the builders and the session flagged:
- A hinge creak has no sound of its own: a slow scrape stands in.
- The title ident card (C) is not drawn in the scenes build.
- In Sixty Per Cent, his rate board's middle values, 106 and 112, are the builder's in-betweens; the script says only
  118.
- In the court wide at The Key, the other people's teal cards reuse v2's TAG texts (WIPES COUNTER, STARES).
- A few fixes made after the builders' last contact sheet were not seen in a still: the kid's fist, the pickpocket
  tag, the landlord card, and his arm at the torn tag.
