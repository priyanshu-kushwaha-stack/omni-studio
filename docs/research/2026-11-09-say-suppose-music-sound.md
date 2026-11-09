# Music and sound craft for Say Suppose: rules from composers, sound designers and editors

Research note, 2026-11-09. For the channel's next videos after "What If You Could Pause Time for 10 Seconds a Day?".
No repo file was changed. No paid call was made.

**Method.** Every lesson below comes from a page that was opened and read during this session; the URL is the page
read. Quotes are a few words at most; everything else is paraphrase. Some sources I wanted could not be opened
(HTTP 403 or a paywall), so the lessons they would have given are **left out**: Variety on Hisaishi's single heron
note, The Open Notebook on Joss Fong (Vox) cutting to music, Uncut's Morricone interview, the Netflix mix spec, the
Hunter et al. 2010 abstract (the Schellenberg lab page was used instead), and the Springer paper on BBC audibility.
Several mixing figures come from vendor blogs, and the table marks them as such.

**What we have now** (read from the repo):
- `style.md`, Voice and sound: a score per video ("a theme for you, a cold cue for the catch, silence before the
  twist"); music "rises to near voice level in `> HOLD:` beats and ducks under the voice elsewhere"; effects made with
  ffmpeg; -14 LUFS, -1 dBTP. Story craft: wordless peaks of 8 to 10 s where the music swells or drops.
- Pause-time score (`build_score.py`, `scenes/Film.tsx`, git log for 2026-11-07 and 11-08). The first mix was too loud
  and monotonous. A sparse pass was "still too much", and the next sparse pass with long silences "looks off". The
  result: light music through the whole film, scene by scene, from the two themes and five local ACE-Step cues, with
  two short silences (1.2 s as the bus screams through, and about 1 s before "And then you notice something").
  Under speech the music sits **26 dB under Arthur** (gain 0.039). In holds it rises to **0.3, about 8 dB under him**.
  The duck ramps over 8 frames in and 18 frames out. Countdown ticks play at 0.15 and the bubble pop at 0.1.
- Cue briefs in `make_music.py`: you 100 BPM C major, tension 120 BPM D minor, catch 70 BPM A minor, long run 80 BPM
  F major, twist 60 BPM E minor.
- Brand themes: light-1 (C major, 100 BPM, opens with a four-note motif "that works as a sting") and dark-1 (the
  motif in A minor, 70 BPM). They were bought once as ElevenLabs Music v2.5 output through Higgsfield. The local cues
  use them as ACE-Step `reference_audio` at strength 0.2.
- The repo's own reference study (`docs/research/2026-11-06-say-suppose-reference-study.md`): in Ifverse's wordless
  stretches the music plays within about 1.4 LU of the voice, and at the biggest beats the loudness drops 3 to 4 LU.

---

## 1. Rules

Each rule can be applied with what we have: the two themes, ACE-Step cues, ffmpeg sound effects, the -14 LUFS mix
and per-scene score rebuilds. Each one has a one-line test. Where a test could become an `omni qc` check, it says
"(qc candidate)".

### A. Themes and motifs

| # | Rule | Test | Source | URL |
|---|---|---|---|---|
| A1 | **One channel motif, used as a signal, not a tune.** The light theme's four-note opening is the Say Suppose signal. Play it at the ident, at each use of the rule device (the pause), and at the end card. Spielberg's brief for the Close Encounters five notes was that it be a signal, not a melody. | The cue sheet's `motif` column shows `signal` at the ident, at every rule-device beat and at the end card. A reviewer can hum it after one watch. | John Williams (NEA *Art Works* interview) | https://www.arts.gov/stories/podcast/john-williams |
| A2 | **Keep the sting at 2 to 3 s and identical in every video.** Sonic-logo practice is a short, distinctive phrase repeated without change. | The ident sting's file hash matches the brand kit, and it lasts 2.0 to 3.0 s. | SoundOut research as reported by A-Mnemonic (an agency claim, with no data shown) | https://a-mnemonic.com/how-does-music-influence-brand-perception-the-science-of-sonic-branding/ |
| A3 | **Transform the theme; don't swap it for an unrelated cue.** In Up, the "Married Life" theme comes back through the film in new colours. In the montage, instruments drop out until a solo piano is left as Ellie dies. Our version: the same motif goes light (C major) to dark (A minor) to one instrument at the loss to resolved under the end card. | Every cue's row names its motif variant (`light`, `dark`, `solo`, `fragment`, `resolved`). The cost beat (about 60% of the runtime) carries the motif thinned to one instrument. | Michael Giacchino (Up) | https://en.wikipedia.org/wiki/Up_opening_sequence · https://www.willbakermusic.com/giacchino-up-sequence/ |
| A4 | **Ensemble size follows how alone "you" are.** In Oppenheimer one violin plays at the first lecture, and more strings join as his world grows. For us: frozen-world beats, where only you move, get a solo or duo; the busy unfrozen world gets the fuller texture. | The cue sheet's `ensemble` column reads `solo` or `duo` on every `MOOD: frozen` hold. A reviewer hears the texture thin when the world stops. | Ludwig Göransson (TheWrap) | https://www.thewrap.com/oppenheimer-music-composer-ludwig-goransson-interview/ |
| A5 | **A motif can announce a character before the picture does.** Williams: we can sense Vader approaching because we hear his tune. Plant the stranger's (twist) motif faintly once or twice before the reveal, so the ending re-reads them. | The twist motif appears at least once before the reveal, inside another cue's texture and at least 6 dB under that cue. | John Williams (NEA) | https://www.arts.gov/stories/podcast/john-williams |
| A6 | **Few notes, given space.** Zimmer: simple devices become "incredibly epic just by giving them space"; the Inception refrain is only four notes. Keep the motif to 4 or 5 notes, and when it plays, nothing else plays a melody. | Motif of 5 notes or fewer. No second melodic line in the same bar (by ear). | Hans Zimmer (Complex) | https://www.complex.com/pop-culture/a/nathan-reese/hans-zimmer-interstellar-interview |
| A7 | **Give motifs only to "you", the rule device and the person to lose; every other cue is mood.** Hisaishi says none of his cues are tied to a character. He scores what the director wants the scene to convey. That keeps leitmotifs few, so each one stays meaningful. | No more than 3 named motifs per video (plus the stranger's plant from A5). Every other cue has motif `none` and an intent word. | Joe Hisaishi (AWN profile, quoting *Keyboard*, 1999) | https://www.awn.com/animationworld/will-real-joe-hisaishi-please-stand |
| A8 | **Have the peak music before the peak animation.** Leone had Morricone write the score before shooting and played it on set. Generate and pick the music for the 8 to 10 s wordless peak first, then time the motion in that hold to its bars (named cues in `timing.yaml`). | The peak hold's music file exists and is chosen before that scene's motion cues are locked (by date in git). | Ennio Morricone and Sergio Leone (Wikipedia) | https://en.wikipedia.org/wiki/Once_Upon_a_Time_in_the_West_(soundtrack) |
| A9 | **Tempo and mode carry valence; mixed cues make bittersweet.** Fast and major reads as happy, slow and minor as sad. Conflicting cues (slow major, fast minor) make listeners feel both at once. Our briefs already follow this. Keep "long run" slow and major (bittersweet), and use fast minor only for urgency. | Each cue row lists BPM and key, and its intent word fits the table: happy = fast major, sad = slow minor, bittersweet or urgent = mixed. | E. Glenn Schellenberg lab (Hunter, Schellenberg et al. 2008/2010; Gagnon and Peretz 2003) | https://sites.utm.utoronto.ca/glenn_website/content/music-and-emotion |

### B. Spotting: where music starts, stops and changes

| # | Rule | Test | Source | URL |
|---|---|---|---|---|
| B1 | **Do a spotting pass before generating any music.** The spotting session decides which scenes get music and where each cue starts and stops, and records the intent and the director's own words. For us it is a cue sheet (section 2), written at G2 next to the script and read by `build_score.py`. | `cues.yaml` exists before `make_music.py` runs. Every cue has IN and OUT on named cues, an intent word and the owner's words where given. | Spotting practice (Spot Sheet Post guide) | https://spotsheetpost.com/blog/spotting-session-guide.html |
| B2 | **Music channels emotion the story has already built; it doesn't make it.** Change the music at or just after a reveal, never before it, so the score doesn't give the beat away. | For every reveal, the music change sits on the reveal word, the face reaction or later, never earlier. A reviewer checks the cue sheet against `timing.yaml`. | Walter Murch (*The Conversations*, as quoted by Kaedrin; Transom essay) | https://kaedrin.com/weblog/2022/05/walter-murch-and-the-art-of-editing-film-part-1/ · https://transom.org/2005/walter-murch/ |
| B3 | **Hold the music back at the biggest beat, then release it.** In the Godfather restaurant scene there is no score until after the killing, which saves everything for "those big chords". Murch says holding back the channeling builds an almost unbearable charge. Peak recipe: the bed drops to one held note or nothing, then one entry on a single marked frame. | The peak hold shows a step in the music's state (drop or entry) on one named cue, not a flat bed. | Walter Murch (Kaedrin; Transom) | https://kaedrin.com/weblog/2022/05/walter-murch-and-the-art-of-editing-film-part-1/ · https://transom.org/2005/walter-murch/ |
| B4 | **Don't mickey-mouse. Play through, and pick two or three hits per scene.** Tight sync on every action sounds mechanical, tires the viewer and makes the score generic. Sound effects can take the small hits. | No more than 3 musical hits per scene in the cue sheet. No musical hit on steps, blinks or tag stamps (those belong to effects). | StudioBinder | https://www.studiobinder.com/blog/mickey-mousing/ |
| B5 | **The edit sets the tempo; cue changes land on picture changes.** Williams says the cut gives the composer tempo, rhythm and length. Every IN, OUT and change sits on a named cue (a cut, a snap, a word), never at a fixed time, so a new take re-times the score just as it re-times the picture. | Every cue boundary in `cues.yaml` is a `{line, word}` or a named cue, with no raw seconds (lint). | John Williams (NEA) | https://www.arts.gov/stories/podcast/john-williams |
| B6 | **Vary density. Monotony is the enemy, not loudness.** Murch: a monotonously dense track is as wearing as a monotonously loud one. The owner's first G5 note was "monotonous". Change the music's state (cue, ensemble, level or tempo) at least every 45 to 60 s, and never keep the same state across two acts. | The longest stretch with one unchanged music state is 60 s or less (from the cue sheet). (qc candidate: short-term loudness range of the score stem per minute.) | Walter Murch (Transom) | https://transom.org/2005/walter-murch/ |
| B7 | **For this audience, keep music gaps short.** Hisaishi re-scored Laputa for outside Japan because non-Japanese viewers felt uneasy after more than three minutes without music; the original had silent stretches of seven to eight minutes. Leone said much the same of a two-hour film of silences. This backs the owner's "keep sound in the complete video": gaps are deliberate and short. | Apart from the planned silences (C1), no stretch of 2 s or more has the score below -50 dBFS (qc candidate). | Joe Hisaishi (AWN); Sergio Leone (Il Bo Live, Univ. of Padua) | https://www.awn.com/animationworld/will-real-joe-hisaishi-please-stand · https://ilbolive.unipd.it/it/news/ennio-morricone-musica-sergio-leone |
| B8 | **At emotional peaks, write simpler, not bigger.** Giacchino says the urge is to pour on more and more; he learned the opposite works. He prefers simple music or even silence at the most emotional moments. ACE-Step briefs for peak cues ask for fewer instruments, not "epic". | Briefs for cues at the cost and choice beats name at most 2 instruments and no build. | Michael Giacchino (Screen Rant, via Wikipedia; WillBakerMusic report of his talk at the SF Symphony screening) | https://en.wikipedia.org/wiki/Inside_Out_(soundtrack) · https://www.willbakermusic.com/giacchino-up-sequence/ |

### C. Silence and contrast

| # | Rule | Test | Source | URL |
|---|---|---|---|---|
| C1 | **Silence is the strongest sound; spend it once or twice.** Murch calls silence the ultimate metaphoric sound, because the audience fills it. Plan at most two per film, each with a reason (shock, dread), in the cue sheet. | No more than 2 `silence` rows, each with an intent. No other planned silence. | Walter Murch (Transom) | https://transom.org/2005/walter-murch/ |
| C2 | **Choose the slope into each silence.** Murch: a sudden drop jolts, a gradual one builds tension. Shock (the bus screaming through) gets a cut. Dread (before the twist) gets a fade of 1.5 s or more. | Each silence row has `slope: cut` or `slope: fade <s>`, and the slope fits the intent (shock = cut, dread = fade). | Walter Murch (Transom) | https://transom.org/2005/walter-murch/ |
| C3 | **Drop the level before a peak so the peak lands.** Ifverse drops 3 to 4 LU at its biggest beats. Trailer practice cuts everything for a held frame after a riser, which can hit harder than any hit. | The 5 s before the peak hold measures 3 to 4 LU under the minute's average (qc candidate). | Repo reference study (Ifverse); Duende Sounds | `docs/research/2026-11-06-say-suppose-reference-study.md` · https://duendesounds.com/trailer-sound-design-elements/ |
| C4 | **Starve the eye and let the ear lead.** Thom: dark, ambiguous frames invite sound in. Our `frozen` and `lamp` moods are those frames. Give each one a named sound idea (the tick that stops, your breath, the paper rustle of frozen air), not only music. | Every `MOOD: frozen` or `lamp` scene has a non-music sound named in the cue sheet. | Randy Thom ("Designing a Movie for Sound") | http://filmsound.org/articles/designing_for_sound.htm |
| C5 | **Leave room after the action for sound to land.** Thom asks editors to stay a moment after the obvious action has passed, so the audience can listen. After each reveal, a beat of 0.5 s or more without narration lets the sound or music answer. | Each reveal row has a gap of 0.5 s or more before the next line (`timing.yaml` "+N s"). | Randy Thom | http://filmsound.org/articles/designing_for_sound.htm |
| C6 | **Silence isn't a digital hole.** Thom says sound works as a continuum, and the owner said long dead silences "look off". Inside a planned silence, keep a low floor (room tone, paper grain or the held note's decay) so it reads as the world holding its breath, not as a dropout. | Inside a silence the full mix stays above -60 dBFS (RMS over 100 ms) unless the row says `floor: none`. | Randy Thom; owner's G5 note (git log, 2026-11-08) | http://filmsound.org/articles/designing_for_sound.htm |

### D. Sound design

| # | Rule | Test | Source | URL |
|---|---|---|---|---|
| D1 | **Two and a half layers per colour, five at most across the spectrum, in any 5 s.** Murch places speech (encoded) at one end and music (embodied) at the other, with effects between. Past 2.5 layers of one kind, the ear hears a lump; layers spread across the spectrum can reach 5. With Arthur speaking, allow at most 2 effects layers plus the music. | For each beat, the cue sheet's layer count is 5 or fewer, and effects layers under narration are 2 or fewer (a reviewer checks the busiest beats, e.g. the countdown). | Walter Murch (Transom) | https://transom.org/2005/walter-murch/ |
| D2 | **Every visible event gets a quiet sound that motivates it.** A Vox producer won't let anything happen on screen without a sound effect motivating it; he uses a click between photos and a pencil for writing, so it feels "tactile". For us: tags, the split-flap counter and props landing all get a sound, kept quiet and inside D1's budget. | A reviewer finds no silent prop entrance or tag stamp, and every such sound passes the clicks check (15 dB rule). | Nate Krieger, Vox (Press Club Institute) | https://www.pressclubinstitute.org/2026/07/21/vox-video-producer-nate-krieger-on-how-to-create-engaging-visual-journalism/ |
| D3 | **Build effects from real recordings: familiar but unrecognisable.** Burtt starts from organic recordings (motors, animals, a TV buzz) because they bring credibility. Ours are pure ffmpeg synthesis. Record paper, card, pencil, a clock tick and breath (free, any phone) and process them with ffmpeg. Synthesis stays for tones and drones. | The cue sheet's `sfx.source` column says `recorded`, `library:<licence>` or `synth`. Paper-cut actions (tags, flaps, page) are not `synth`. | Ben Burtt (filmsound.org Q&A) | http://www.filmsound.org/starwars/starwars-AQ.htm |
| D4 | **Signature sounds come back unchanged.** Burtt reuses and builds on the sounds of recurring characters and objects, so a ship still sounds like its earlier self. The freeze (the rule-device sound), the snap and the ident sting become brand assets reused by every video. | These sound files are imported from `brand/` (hash check), not regenerated per video. | Ben Burtt | http://www.filmsound.org/starwars/starwars-AQ.htm |
| D5 | **Give each element a sonic character, and write down why.** Mangini gave each Fury Road vehicle its own sound, tracked Max's state of mind through sound, and says to ask "why, not how". You, the person to lose and the stranger each get one sound trait (for example: you a soft felt tick, the stranger a dry wooden one). | Each recurring character or device has a `why` word in the cue sheet. | Mark Mangini (postPerspective keynote) | https://postperspective.com/mark-mangini-keynotes-art-sound-design-sony-studios/ |
| D6 | **Let characters listen.** Thom: characters need moments to listen, and the audience learns who they are through what they hear. At least once per act, a sound comes first and the figure's face reacts to it (this pairs with the 2 s face-reaction rule). | At least one row per act shows `sfx → reaction` in that order. | Randy Thom | http://filmsound.org/articles/designing_for_sound.htm |
| D7 | **Worldize music that comes from inside the world, and move it between foreground and "mist".** Murch replayed the radio show through a speaker in a real space and re-recorded it, then moved it between a clear veil behind the dialogue and in your face. A phone, radio or busker in our stories gets a space treatment (a band-pass and a short reverb in ffmpeg), not the clean score. | Every `diegetic` music row has a `space` treatment. A reviewer hears it as coming from the object. | Walter Murch (Lucasfilm; filmsound.org) | https://www.lucasfilm.com/news/walter-murch-american-graffiti/ · http://www.filmsound.org/terminology/worldizing.htm |
| D8 | **Pitched hits and stingers sit in the cue's key.** A stinger in key sounds meant; one a semitone off sounds like a mistake. Pitch synthesised hits to the cue's tonic or fifth. | The stinger's key in the cue sheet equals the cue's key. | Duende Sounds | https://duendesounds.com/trailer-sound-design-elements/ |
| D9 | **Every riser resolves.** A riser that never resolves leaves the audience tense and cheated. It ends in a hit, a downer or a cut to silence (C2). | Each riser row names its resolution, and it lands within 2 frames of the riser's end. | Duende Sounds | https://duendesounds.com/trailer-sound-design-elements/ |
| D10 | **One big hit per act.** "One well-placed hit is powerful; four is a parody." | No more than 1 big hit (boom, braam or downer) per act in the cue sheet. | Duende Sounds | https://duendesounds.com/trailer-sound-design-elements/ |

### E. Mix with narration

| # | Rule | Test | Source | URL |
|---|---|---|---|---|
| E1 | **Under speech, the music sits at least 20 dB below the voice.** WCAG 1.4.7 asks for background sound at least 20 dB under foreground speech, for hard-of-hearing listeners. A vendor guide puts it at 15 to 25 dB (MusicVivo). Listeners over 65 preferred a bigger gap than broadcast mixes gave. Our 26 dB passes. | Short-term loudness of the score stem in speech windows is at least 20 dB under the narration (qc candidate: `score_gap`). | W3C WCAG 2.1 SC 1.4.7; MusicVivo (vendor); study of listeners over 65 (arXiv) | https://www.w3.org/WAI/WCAG21/Understanding/low-or-no-background-audio.html · https://musicvivo.com/blog/music-under-voiceover · https://arxiv.org/abs/2006.14282 |
| E2 | **Carve the speech band instead of pulling the whole score down.** In the Speech Intelligibility Index, the bands from 1250 to 3150 Hz carry about 43% of intelligibility, because consonant cues live there; the lowest bands carry about 11% despite most of the power. A 4 to 6 dB dip around 2 kHz on the score while Arthur speaks (ffmpeg `equalizer` on a ducked branch, or `sidechaincompress` on a band-split) would let the music stay present at about 20 to 22 dB under instead of 26, with the same clarity. | The score stem's spectrum in speech windows shows a dip of 4 dB or more at 1.25 to 3.15 kHz compared with holds. Then an A/B at 20, 22 and 26 dB for the owner. | ANSI S3.5 SII, summarised in the phonometry docs; Boris FX (cut the competing instrument in 1 to 4 kHz; use dynamic EQ when the clash comes and goes) | https://github.com/jmrplens/phonometry/blob/main/docs/perception/speech/speech-intelligibility.md · https://borisfx.com/blog/frequency-masking-explained-and-how-to-fix-it/ |
| E3 | **In the peak holds, bring the music near the voice; in small holds it can stay lower.** The style rule and Ifverse (about 1.4 LU apart) say near voice level. We play holds at 8 dB under. Use two hold levels: `peak` within 3 to 4 dB of the voice's short-term level, and `breath` (short holds) at 8 dB under. | The `peak` hold's score measures within 4 LU of the narration's short-term average, and `breath` holds within 8 to 10 dB (qc candidate). | Repo reference study; `style.md` | `docs/research/2026-11-06-say-suppose-reference-study.md` |
| E4 | **Ramp ducks: dip just before the line and release over 300 to 600 ms.** Vendor guidance gives a 300 to 600 ms release so the music doesn't pump. Ours is 8 frames in (267 ms, lookahead) and 18 frames out (600 ms), so it is supported. | `DUCK_IN` 6 to 10 frames and `DUCK_OUT` 9 to 18 frames at 30 fps; no click at duck edges (clicks check). | MusicVivo (vendor) | https://musicvivo.com/blog/music-under-voiceover |
| E5 | **The motif speaks between lines, not under them.** Murch says speech and music can coexist because they are processed differently, but a melody under a sentence pulls attention. The Veritasium composer aims for feeling without distracting from the learning. Under narration the score is pulse, pad or rhythm; motif statements go in gaps and holds. | The `motif` column is empty or `under` on beats with narration, and full statements fall only in holds or gaps of 1.5 s or more. | Walter Murch (Transom); Jonny Hyman (Veritasium scores) | https://transom.org/2005/walter-murch/ · https://jonnyhyman.com/projects/music/veritasiums |
| E6 | **Narration stays clear and on top of an immersive mix, and every video gets its own score.** Epic Mountain composes a soundtrack for each Kurzgesagt video and balances it so the narration stays clear. That backs "a score per video" and the cue-by-cue rebuilds. | Each video has its own `cues.yaml` and score. E1 passes. | Epic Mountain (studio site); Kurzgesagt production order | https://www.epic-mountain.com/ |
| E7 | **Check on a phone speaker at low volume.** The audibility rule exists for hard-of-hearing and older listeners, and a phone is where most viewers hear us. | At G5 and G6 the owner or reviewer listens once on a phone speaker at about 30% volume, and every word is clear. | W3C 1.4.7 rationale; arXiv (65+) | https://www.w3.org/WAI/WCAG21/Understanding/low-or-no-background-audio.html · https://arxiv.org/abs/2006.14282 |

### F. The opening seconds

| # | Rule | Test | Source | URL |
|---|---|---|---|---|
| F1 | **The first 30 s must sound like the promise of the title and thumbnail.** YouTube's "Intro" metric is the share still watching at 30 s, and YouTube reads a high value as the opening matching the title and thumbnail. The hook's sound should already carry the what-if's mood (frozen, uncanny) and the channel signal. | The `opening` qc passes (sound by 0.5 s, word by 1 s), and the cue sheet's first 30 s include the channel signal (A1) and the video's main sound idea (C4). | YouTube Help: key moments for audience retention | https://support.google.com/youtube/answer/9314415?hl=en |
| F2 | **Plant in the opening what pays off at the end.** Up's opening themes come back as the emotional anchor of the whole film. The motif variant heard in the first 30 s returns, transformed, in the last minute (the musical half of "plant and pay off"). | The cue sheet's first and last minutes share a motif name, and the variants differ. | Giacchino (Up, Wikipedia) | https://en.wikipedia.org/wiki/Up_opening_sequence |
| F3 | **Read the dips.** YouTube marks spikes and dips in retention. After publishing, line the dips up against the cue sheet (music state changes, silences, hits) and keep a note in the video folder. | `analytics/` has a dips-vs-cues note within 7 days of release. | YouTube Help | https://support.google.com/youtube/answer/9314415?hl=en |

### G. The end card

| # | Rule | Test | Source | URL |
|---|---|---|---|---|
| G1 | **Land the question in near-silence, then release into the resolved theme.** Murch's "expectation and release": the twist question builds the charge, a short gap holds it, and the theme's resolved ending grounds it. | A gap of 0.8 s or more (score below -40 dBFS) between the last spoken word and the theme's entry. | Walter Murch (Transom) | https://transom.org/2005/walter-murch/ |
| G2 | **The end card closes the loop with the light theme, coloured by the ending.** If the twist is eerie, the end theme can be slow and major (mixed cues: bittersweet) rather than the bright 100 BPM version. | The end card's cue row names `motif: signal, variant: resolved`, and its BPM and key fit the ending's intent (A9). | Schellenberg lab; Giacchino (Up) | https://sites.utm.utoronto.ca/glenn_website/content/music-and-emotion · https://en.wikipedia.org/wiki/Up_opening_sequence |
| G3 | **The last note decays; it never stops.** This is already enforced: the clicks check wants the tail at least 20 dB lower before the file ends. | The clicks check's tail test passes. | Repo `core/studio/rules/no-audio-clicks.md` | (internal) |

### H. Rights

| # | Rule | Test | Source | URL |
|---|---|---|---|---|
| H1 | **Every source in the score has its licence on file, with proof.** ElevenLabs Music on paid self-serve plans allows online and offline commercial use, except film, TV, radio and studio games, and you keep your rights in the output. Starter does not allow streaming distribution. Starter, Creator and Pro are for individual use only. Library creation and model resale are not allowed. ACE-Step 1.5 is MIT, and its model card says generated music can be used commercially. Pixabay content is free to use and adapt without attribution, but not as a standalone resale; it may carry third-party rights, and checking them is the user's job. | Every music and effects row has `rights: {source, licence_url, proof}`, e.g. a job id, date and plan, or a Pixabay page link. | ElevenLabs Eleven Music model terms; ACE-Step model card; Pixabay licence | https://elevenlabs.io/eleven-music-model-specific-terms · https://huggingface.co/ACE-Step/Ace-Step1.5 · https://pixabay.com/service/license-summary/ |
| H2 | **"Royalty-free" doesn't mean "claim-free"; keep what a dispute needs.** Content ID matches fingerprints whether a human or an AI made the track, and some AI tools register their own outputs. Keep the terms as they stood at publish time, the plan you were on, the track and the publish date. | `publish.md` lists, for each cue, the licence snapshot and plan. | Thematic (a music-licensing vendor) | https://hellothematic.com/ai-music-for-youtube/ |
| H3 | **Never prompt with artist names, song titles or lyrics.** The Eleven Music terms limit prompts that name artists, songs, labels or lyrics. Keep the same discipline for ACE-Step briefs. | A lint finds no proper names in the `make_music.py` briefs. | ElevenLabs model terms | https://elevenlabs.io/eleven-music-model-specific-terms |

---

## 2. Proposed cue sheet

A per-video `cues.yaml` written at G2 next to the script, replacing the hard-coded `SCENES` list in `build_score.py`.
The script gains one optional line type, `> CUE: <id>`, at the line where a cue starts, so a reader of the script
sees the music too. Boundaries are named cues or `{line, word}` anchors, never seconds (B5). Levels are relative to
the voice, so they survive a new take and a dub.

```yaml
# cues.yaml — spotting notes for one video (B1). Read by build_score.py and by `omni qc` (cue-sheet lint).
video: 2026-11-06_pause-time-for-10-seconds-a-day
motifs:                          # A7: three named motifs at most
  signal:   {source: brand/music/theme-light.mp3, bars: "0-1", notes: 4}     # A1, A6
  person:   {source: generated, notes: 5, who: "your mother"}
  stranger: {source: generated, notes: 3, planted_at: [c07]}                 # A5
levels:                          # dB relative to Arthur's short-term loudness
  under_voice: -26               # E1: -20 or lower
  hold_breath: -8                # E3
  hold_peak: -3                  # E3
  carve: {band_hz: [1250, 3150], depth_db: -5}   # E2, applied under speech only
duck: {in_frames: 8, out_frames: 18}             # E4

cues:
  - id: c01                      # one cue per row (cue numbers like a spotting list)
    in:  {cue: flash}            # named cue or {line: 0, word: "seconds"}
    out: {line: 1, word: "pause"}
    intent: uncanny              # one word (B1)
    state: single-note           # theme | underscore | pulse | single-note | room | silence
    motif: none
    ensemble: solo               # solo | duo | small | full (A4)
    tempo_key: "— / E minor"
    source: {kind: synth, file: assets/sfx/low-note.wav}
    sfx:
      - {what: split-flap 7, source: recorded, why: "the clock is the rule", level: -18}
    layers: 3                    # voice + note + flap (D1: 5 or fewer, effects under voice 2 or fewer)
    hits: []                     # B4: 3 or fewer per scene
    rights: {licence: own, proof: "made in ffmpeg"}

  - id: c02
    in:  {cue: ident}
    out: {clip: 1}
    intent: signal
    state: theme
    motif: {name: signal, variant: light}        # A1, F1
    ensemble: small
    tempo_key: "100 / C major"
    source: {kind: brand, file: brand/music/theme-light.mp3, at_s: 0.0}
    rights: {licence: "Eleven Music paid self-serve via Higgsfield", proof: "job e7d9677a, 2026-11-07"}

  - id: c11
    in:  {line: 33, word: "<bus>"}
    out: {line: 33, word: "<mother>"}
    intent: shock
    state: silence
    slope: cut                   # C2: cut = shock, fade N = dread
    floor: room                  # C6: room | none
    reason: "the bus screams through"   # C1: two silences at most

  - id: c14                      # the cost beat (~60%): the wordless peak
    in:  {cue: fall}
    out: {cue: kneel}
    intent: loss
    state: single-note           # B3: drop to one held note, then one entry
    motif: {name: person, variant: solo}         # A3: thinned to one instrument
    ensemble: solo
    level: hold_peak             # E3
    tempo_key: "70 / A minor"
    entry: {on: kneel, what: "motif, felt piano, 5 notes"}   # B2: on or after the reveal
    sfx:
      - {what: three soft steps, source: recorded, why: "she falls", level: -14}
    hits: [{on: fall, what: "piano low A, in key"}]          # D8
    rights: {licence: "ACE-Step 1.5 MIT", proof: "make_music.py seed 11, 2026-11-07"}

  - id: c19
    in:  {cue: notice}
    out: {cue: endcard}
    intent: dread
    state: underscore
    motif: {name: stranger, variant: full}       # the plant from c07 pays off (A5)
    pre_silence: {slope: fade 1.5, floor: room}  # C2
    risers: [{from: notice, resolves: {on: endcard, into: cut}}]   # D9

  - id: c20
    in:  {cue: endcard}
    out: {end: true}
    intent: release
    state: theme
    motif: {name: signal, variant: resolved}     # G1, G2, F2
    gap_before_s: 0.8                            # G1
    tail: decay                                  # G3
```

**Lint the cue sheet (qc candidates, not built).** Boundaries are named, never raw seconds (B5). There are 3 named
motifs at most, plus the stranger's plant (A7). There are 2 `silence` rows at most, each with a slope and a reason
(C1, C2). `layers` is 5 or fewer, and effects under voice are 2 or fewer (D1). There are 3 hits per scene at most
(B4) and 1 big hit per act at most (D10). Every riser has a `resolves` (D9). Every row has `rights` (H1). The longest
unchanged state is 60 s or less (B6). Then on the render: `score_gap` checks E1 and E3, a spectrum dip check covers
E2, and the opening, clicks and loudness checks run as today.

---

## 3. What the sources say about our existing rules

**Supported**
- **"A theme for you, a cold cue for the catch, silence before the twist"** (`style.md`). Williams (motifs mark
  characters), Giacchino (one theme transformed) and Murch (silence as metaphor) all back it. The sources sharpen
  it: it should be **one motif transformed** (A3), not separate pieces that merely share a reference style.
- **Wordless peaks where "the music swells or drops"** (`style.md`). This is Murch's hold-back-then-release (B3) and
  Giacchino's simpler-at-the-peak (B8). The mother's-fall hold in the script ("a single held note, then nothing")
  already does this.
- **Under-voice level, 26 dB.** It is deeper than the WCAG minimum of 20 and at the deep end of vendor ranges (15 to
  25). That is safe for intelligibility.
- **Duck ramps** of 8 frames in and 18 out fit vendor release guidance (E4).
- **Quieter ticks and pops** (owner, G5). Murch's layer limit (D1) and "monotonous density is wearing" (B6) support
  this, and so does StudioBinder's warning against hitting every action (B4).
- **Light music through the whole film, with two short silences** (owner, G5). Hisaishi's account of non-Japanese
  audiences and Leone's remark both support continuous light music for this audience (B7). Murch supports keeping
  the silences few and purposeful (C1).
- **Cue tempo and key briefs** in `make_music.py` follow the tempo and mode findings (A9). The long run at 80 BPM in
  F major is the "slow major" mixed cue for bittersweet.
- **No empty opening** (`opening` qc). YouTube's Intro metric (F1) supports it.
- **A score per video, ducked so the narration stays clear.** This is Epic Mountain's practice for Kurzgesagt (E6).
- **Keep each Pixabay track's page link to dispute a claim** (`music-shortlist.md`). H2 supports it.

**Sharpened**
- **Spotting.** The `SCENES` list in `build_score.py` is a cue sheet written after the fact, in code. Move it to a
  `cues.yaml` written at G2, with intent, motif, ensemble and level per cue (B1, section 2).
- **"Music rises to near voice level in `> HOLD:` beats."** Split it into `peak` (within 3 to 4 dB) and `breath`
  (about 8 dB) holds (E3).
- **Silence slopes.** Our two silences already differ (a cut at the bus, a fade before the twist). Make the slope an
  explicit choice per silence (C2), and keep a room-tone floor (C6).
- **Sound effects.** "Synthesised with ffmpeg" becomes "recorded or library, processed with ffmpeg; synthesis for
  tones" (D3). The freeze, snap and ident sting become reused brand assets (D4).

**Contradicted, or in tension**
1. **Hold level: `style.md` against the code.** The style rule says near voice level in holds. `Film.tsx` plays holds
   at 0.3, about 8 dB under, after the owner said the mix was too loud. The sources (and Ifverse) side with the style
   rule for **peak** holds only. Owner's call, by A/B (E3).
2. **Synthesised effects against Burtt's organic sound** (D3). This is a style change, so the owner decides. It is
   free: a phone recording of paper and pencil.
3. **Silence-heavy masters against the owner's continuous light score.** Murch (withholding music), Hisaishi (long
   Ghibli silences) and Leone ("I live in silence") prize silence. The owner rejected long silences. Hisaishi's own
   *Keyboard* remark and Leone's two-hour comment explain why: the owner's call fits a Western, YouTube audience.
   Keep the score continuous but **modulated** (B6, A4), and keep silence for one or two planned moments.
4. **Leitmotif (Williams) against cues not tied to characters (Hisaishi).** Resolved by A7: three motifs at most, and
   every other cue is mood.
5. **A sound for every on-screen event (Vox) against Murch's layer limit and the owner's "quieter pops".** Resolved by
   D1 and D2: every event gets a sound, but quietly and inside the layer budget.
6. **E2 could reopen the 26 dB decision.** With a 2 kHz carve, the music might sit at 20 to 22 dB under and still keep
   the words clear. That is a new A/B for the owner, not a change to make without asking.

**Open rights questions (not answered by the sources read)**
- The channel themes were bought **through Higgsfield**, not on an ElevenLabs plan. The Eleven Music terms above
  cover ElevenLabs' own plans. Higgsfield's terms for Eleven Music output were not researched; read and record them
  before relying on H1 for the themes.
- The Eleven Music terms don't address using output as **reference audio** for another model (ACE-Step). Section 2.2
  requires rights in any input; we hold the output's rights "as between you and ElevenLabs". This is probably fine,
  but not confirmed.
- Whether YouTube counts as "streaming distribution" under the Starter restriction is not defined on the page read.
  Record which plan applies.
