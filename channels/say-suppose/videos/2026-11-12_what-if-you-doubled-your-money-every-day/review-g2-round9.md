# G2 round 9: the wants-you-to-fail notes, applied here, and an emotional score (2026-11-13)

The owner, on the v3 cut: "Take the feedback shared in Film: What If You Saw Who Wants You to Fail? this session and
whatever is common apply it here also." and "This is a little EMOTIONAL angle story. I don't know if this will go big.
Maybe with music we can make it better."

## The other film's notes, and what each became here

From `channels/say-suppose/taste.md` (2026-11-13) and that film's `review-g2-rounds12-15.md`:

| Note on the other film | Common? | Here |
|---|---|---|
| "A text, A call, nothing opens. Remember that. This is not needed here"; "dialogues can be a little slower" | Yes | The rule is said once, without "Remember that." ("Exactly zero at midnight. Not a cent more. Not a cent less."), with a card; its later echo is plain ("And there's only one way out. Exactly zero, at midnight.") instead of "the number you were told to remember on day two". `timing.yaml`: 0.3 s more air after every line, 0.7 s where a card lands; takes still at 1x |
| Introduce characters so people remember them: name, role, one thing they do | Yes | The four recurring tags get a third line: Lotte "slips you a free roll every day", Jonas "pays for your roll every morning", Herr Brandt "checks every cent", Karl "brings Lotte her flour"; on screen 2-2.5 s |
| Text to emphasise, only where it makes sense, one at a time | Yes | Eight cards: THE RULE; IT'S TRUE (the chessboard's wheat, c11); PROBLEM 1 You can't spend it; WHERE THE MONEY LANDS; PROBLEM 2 You can't give it away; IT'S TRUE · 1324 (Mansa Musa, c06); PROBLEM 3 Whoever holds it makes the bread cost more; IT'S TRUE (the world's $128 trillion, c09, IMF 2026) |
| When the narrator says "you ask", the hero asks | Yes | Your bubble as you hold the phone out to Jonas: "Take it. All of it.", so his "Not me." answers something on screen |
| A choice needs its stakes both ways and the reason it is taken | Yes | The stakes were there; the reason is now said: "You call Herr Brandt. Now. Lotte's flour can wait. The street can't." |
| A fact that sounds made up gets "it's true", its year and a card | Yes | "This has happened before. For real. In 1324, a king from Mali, Mansa Musa, gave away so much gold in Cairo that gold stayed cheap there for at least twelve years." and its card |
| Never close on a choice the story has already made; turn the film on the viewer | Yes | "So, would you have erased it?" (the film had answered it) is now "Be honest. If one cent started doubling in your account tonight, which day would you stop it? Tell us the day in the comments. And subscribe. Jonas might need you." (a number to type; Jonas's phone is the open loop) |
| Voices not clear | Yes, checked | Every take was transcribed back. Misheard and fixed: Lotte's "Counted?" (heard "Count it." three times) is now "All counted?"; "Day-old. Free." (heard "Stay old") is "Yesterday's. Free."; Karl's "the mill wants more" (heard "the meal", "once more") is "the mill charges more"; "Lotte bakes what Lotte bakes" (read as a question) is "Lotte's oven makes eighty rolls a morning. No more."; "Your wages too" (heard "your wage is two") is "Your wages as well"; "To the cent." and Lotte's "Same rolls." re-voiced. The cast's voices are unchanged (the owner heard them on v2 and v3 and kept them); the ElevenLabs A/B stays last |
| A stranger's line heard right; her own voice | Already | Frau Weber and Mehmet have voices made for them |
| Name the thing the viewer knows before the local word | Already | No local words in the telling |
| Say what is confirmed and what it depends on; scenes in the order they happen | Already | Nothing found |
| One theme looping is monotonous; a score cue per section; an ambience bed per set; the peak drops to a floor | Partly done in v3 | v3 had a cue per section. v4 adds a bed per set and the props' sounds (below); the peak keeps its planned silence, now over the door bed's room tone (sound #5), and the score's one entry after it is Lotte's theme |

## The emotional score

Lotte has a theme of her own, made first (`make_music.py`, LOTTE): a short waltz on felt piano with a cello answering.
The four heart moments are made with it as the reference, so the same tune comes back each time:

- **ache**, her savings book after closing: slow, minor, solo piano; it blooms in the 5 s hold.
- **notme**, Jonas putting the roll back: the tune on a lone cello.
- **door**, the cent at the glass door: very soft piano, gone by the end of the line before the silence.
- **resolve**, after "Zero, doubled, is zero.": the tune whole, piano and strings, into the morning.

The rest re-made at v4's longer sections: wonder, giddy, uneasy, awe, spree, then **price** (a climbing ostinato under
Karl's triple price), **giving** (hope souring as the envelopes go out), dread (the planet), countdown. Fourteen cues,
all local (ACE-Step 1.5), no paid call.

Beds (`make_ambience.py`, synthesised): the bakery by day, the bakery after closing, the flat at midnight, the flat at
eleven with the clock near, the street, the party crowd, the tram, the quiet street, the bank by day and by night, the
football ground, the back door with the van idling, the wheat at night, the glass door. Effects (`make_sfx.sh`): the
reader's tap and declined buzz, the midnight rip at every doubling (the rule's sound, sound #8), the day tags' flutter,
the billion cents pouring, the stamp, the form torn, the phone buzzing, the cent into her palm, the key and the lamp,
a snap on each card. `cues.yaml` is the cue sheet.

Also fixed: the end card's comment tag still read "your ten seconds" (copied from the pause film's end tags, on screen
in v3 too); it now reads "your day", matching the closing question.

Cut: `renders/firstcut/firstcut-v4-720p.mp4`, 1280x720, 10:59 (v3 10:03: the extra air and the new lines), -16.1 LUFS,
true peak -2.8 dBTP. `omni qc story_script --media` passes (claims, clicks). The full-mix check found a vocal click
before Jonas's "Then it's me" (muted, `99@0.280:0.100`). Free throughout: 20 local takes, 15 ACE-Step cues.
