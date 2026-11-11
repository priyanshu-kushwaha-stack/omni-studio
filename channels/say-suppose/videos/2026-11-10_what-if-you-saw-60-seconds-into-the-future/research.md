# Research: sixty seconds into the future

Fetched and read on 2026-11-11 (G2). Every spoken claim, its exact quote and its source are in `claims.md`; each quote
was checked by script against the saved page text. This file is the reading behind them, and what was looked at and not
used. PubMed abstracts and PMC full text were read through NCBI E-utilities (the PubMed site served a bot check), and
the eLife Insight through the eLife API; the text is the same as on the cited pages.

## What the sources say

- **Seeing is late (c01).** eLife Insight by Koevoet, Sahakian and Chota (19 Jan 2023), on Johnson et al. 2023: "it
  takes the brain about 80–100 milliseconds to process visual information". In the EEG study, objects flashed at
  random places took about 80 ms to show up as a location signal. Objects moving predictably were represented near
  where they really were at that moment, so the brain had made up at least 80 ms of movement, already in visual
  cortex. Hogendoorn's 2020 review opens the same way: neural transmission delays mean the brain needs time to
  process what comes in. "About a tenth of a second" rounds 80–100 ms up; the delay belongs to the visual system,
  not the eyes.
- **Flash-lag (c02, c03).** Nijhawan (Trends Cogn Sci, 2002) defines it: a flashed object looks as if it lags behind
  a moving object when the two are at the same place at the moment of the flash. He first proposed in 1994 (Nature,
  "Motion extrapolation in catching"; PubMed has no abstract) that the brain extrapolates moving objects forward to
  make up the delay. Eagleman and Sejnowski (Science, 2000) report data that fit neither extrapolation nor latency
  difference, and propose postdiction: what you see at the moment of the flash depends on what happens in about the
  80 ms after it. Whitney, Murakami and Cavanagh (Vision Research, 2000) put it down to differential latency:
  moving things are processed faster than flashes. Patel, Ogmen, Bedell and Sampath answered Eagleman in Science
  (Nov 2000) with "differential latency, not postdiction". Hogendoorn (J Neurosci, 2020), looking back over 25
  years, argues the evidence now supports extrapolation mechanisms and their part in the effect. The debate is open,
  so c03 is `contested` and the script says "some scientists think".
- **Cricket (c04, c05).** A University of Sydney study by Rene Ferdinands and Gerard Dias, unpublished when ABC News
  reported it (22 Aug 2019): a ball leaving the hand at 150 kph reaches the batter in 0.48 s; picking up its flight
  takes 0.2 s, leaving 0.28 s to decide and move. Their table: 130 kph 0.55 s, 140 kph 0.51 s, 160 kph 0.45 s. So
  "under half a second" holds and 0.44 s does not. A rough sum agrees: 150 km/h is 41.7 m/s, and about 20 m from
  hand to bat takes about 0.48 s. On reading the bowler: Müller, Abernethy and Farrow (2006) found highly skilled
  batters pick up early cues from the bowling hand and arm that less skilled players miss. Noorbhai's 2020
  systematic review says these skills let batters predict the delivery before release and "may aid in preparing
  movement coordination at an earlier point in time". Land and McLeod (Nature Neuroscience, 2000): the batter sees
  the ball for "little more than half a second" and makes a predictive eye movement to where it will bounce.
- **The Eudaemons (c06 to c09; c10 dropped).** Doyne Farmer's own page: in graduate school he and his childhood
  friend Norman Packard formed Eudaemonic Enterprises to beat roulette and fund a science commune. They studied a
  wheel they bought, and built a wearable computer, first hidden under the armpits, later in a shoe; a toe switch
  timed ball and rotor, and a second person placed the bets. They made "over eleven trips to Las Vegas, Reno and
  Tahoe, and achieved a 20% advantage over the house, but suffered persistent hardware problems", together with
  "fear of violence at the hands of the casinos", so they never played for high stakes. Kirkus's 1985 review of
  Thomas Bass's The Eudaemonic Pie (the book that tells the story) gives the computer "a 44 percent advantage on the
  house" "in theory, and sometimes in practice", says they lacked capital and "never got all the glitches out", tells
  of a woman burned when overheated wires seized up, and says the project fell apart seven years after it began. So
  the 44% is the book's figure and 20% is Farmer's own; the script uses Farmer's. Why it ended is not settled (see
  "Looked at, not used").
- **Self-defeating prophecy (c11).** Merton, "The Self-Fulfilling Prophecy" (Antioch Review, 1948), footnote 1: the
  counterpart of the self-fulfilling prophecy is the "suicidal prophecy", which changes behaviour so that it "fails
  to be borne out. The prophecy destroys itself." He points back to his 1936 essay on unanticipated consequences.
  "Self-defeating prophecy" is the later name (Wikipedia: "a prediction that prevents what it predicts from
  happening"; also "self-destroying" or "self-denying"). If the script names Merton, his word is "suicidal".
- **Japan's warnings (c12, c13).** JMA's leaflet for the start of the service (1 October 2007): the system spots the
  P-wave near the focus, estimates intensity, and warns "a few seconds to a few tens of seconds" before strong shaking;
  close to the focus, the shaking can arrive with the warning. Bullet trains have their own system. Umehara Jun
  (Discuss Japan, 2015): Compact UrEDAS detects the first P-wave tremors and cuts the power to the overhead lines when
  it expects intensity 4 or more, and the train's ATC then tries to stop it. In the 2004 Niigata-Chuetsu earthquake
  it cut Toki 325's power one second after the P-wave and the brakes went on 1.5 s later, 1.2 s before the main
  shaking; the train still derailed, with no deaths. Since then JR East calls it the Earthquake Early Detection System
  for Shinkansen; JR Tokai, JR West and JR Kyushu use other names.
- **Lorenz (c14, c15).** APS News (Jan 2003): in winter 1961 Lorenz restarted a 12-equation weather model from the
  middle, typing numbers from the printout. The memory held .506127 and the printout showed .506. Within a few
  simulated months the two runs had nothing in common. Lorenz's own words, quoted in Motter and Campbell's "Chaos at
  Fifty" (Physics Today, 2013): the differences roughly doubled every four days until the resemblance was gone in the
  second month, because he had typed the rounded values. This became sensitive dependence on initial conditions; the
  name "butterfly effect" comes from his 1972 AAAS talk. It was a computer model, not the real weather, and none of
  it gives a one-minute limit.
- **Reward prediction error (c16).** Schultz (Dialogues Clin Neurosci, 2016): most midbrain dopamine neurons in
  humans, monkeys and rodents fire for more reward than predicted, stay at baseline for fully predicted rewards, and
  dip for less. Schultz (J Neurophysiol, 1998): they "remain uninfluenced by events that are as good as predicted".
  Schultz, Dayan and Montague (Science, 1997) tie this to theories of learning from prediction errors.
- **Held in reserve (c17, dropped).** Budish, Cramton and Shim (NBER conference draft, 2013): in 2010 Spread Networks
  finished a nearly straight fibre cable from Chicago to New York, which cost an estimated $300 million and cut the
  round trip from 16 ms to 13 ms.

## Looked at, not used

- **"Not because a casino caught them" (c10, dropped).** Not supported. Farmer gives hardware problems plus fear of
  the casinos; Kirkus gives too little capital, constant glitches, and collapse after seven years; the Heinz Nixdorf
  MuseumsForum's object page (German) says the group reportedly won over $10,000 until casino staff noticed the
  irregularities, and dates the first real casino test to November 1981 (Wikipedia has the system working by 1978).
  The script can say the hardware kept failing; it cannot say no casino noticed.
- **Electric shocks.** Wikipedia's Eudaemons page tells of failed insulation shocking the bettor, but cites nothing for
  it. Kirkus's account of Bass is a burn from overheated wires, so the script says "burned".
- **Wikipedia's 44% "average profit".** No citation. The arXiv paper by Small and Tse (1204.6412) credits +44% to
  Edward Thorp's 1969 work with a pocket computer (from a search summary only; the PDF was not read). Farmer's 20% is
  used.
- **0.44 s at 150 km/h.** Found only on a coaching blog and a model page, not a study. The Sydney figure (0.48 s) is
  used, said as "under half a second".
- **Batters and context.** Müller et al. (2021, Eur J Sport Sci, from a search summary only) found one group of skilled
  batters relied on match context more than on the bowler's body in an occlusion task. This is why c05 says "read",
  not that batting is all body-reading.
- **Shinkansen in 2011.** Railway Technology (27 June 2011) reports that a JR East seismometer at Kinkazan sent a stop
  signal 12-15 s before the shaking and braked 33 trains. The page blocked direct fetching and the fetch tool would
  only paraphrase it, so it is not cited.
- **Hogendoorn 2020 full text.** The J Neurosci page and the Melbourne PDF refused the fetch; only the abstract is used.
- **Predictive coding**, **sunlight's eight minutes twenty seconds**, **Libet's half-second** and **driver reaction
  time** (packaging "Research for G2"): not researched, as none is planned for the script.

## Sources read

| Source | Used for |
|---|---|
| eLife Insight 85301, Koevoet, Sahakian & Chota 2023 (via eLife API) | c01 |
| PubMed 12200181, Nijhawan 2002, Trends Cogn Sci (abstract) | c02 |
| PubMed 32699152, Hogendoorn 2020, J Neurosci (abstract) | c03 |
| PubMed 10720334, Eagleman & Sejnowski 2000, Science (abstract) | c03 note |
| PubMed 10793892, Whitney, Murakami & Cavanagh 2000, Vision Res (abstract); 11184992, Patel et al. 2000 (record); 10196580, Whitney & Murakami 1998 (record); 8035873, Nijhawan 1994 (record) | c03 note |
| Cricket Namibia, "Batting against fast bowling" (3 June 2020), reprint of ABC News 22 Aug 2019; ABC page header read | c04 |
| PMC7706682, Noorbhai 2020, J Hum Kinet (full text) | c05 |
| PubMed 17095494, Müller, Abernethy & Farrow 2006; 11100157, Land & McLeod 2000; 20507831, Mann et al. 2010; 22808703, Müller & Abernethy 2012 (abstracts) | c05 note, research |
| doynefarmer.com/roulette (J. Doyne Farmer) | c06, c07, c08 |
| Kirkus review of The Eudaemonic Pie (1985) | c09, c10 note |
| Heinz Nixdorf MuseumsForum object 3778 (museum-digital) | c10 note |
| Wikipedia, Eudaemons (wikitext); wearcam.org, "The Eudaemons' shoe computer" (Steve Mann, 1998); thomasbass.com book page | background, not cited |
| Merton 1948, Antioch Review (JSTOR scan, course copy) | c11 |
| Wikipedia, Self-defeating prophecy (wikitext) | c11 note |
| JMA leaflet, Earthquake Early Warning starting 1 October 2007 | c12 |
| Japan Policy Forum, Discuss Japan No. 26, Umehara 2015 | c13 |
| APS News, Circa January 1961: Lorenz and the Butterfly Effect (2003) | c14 |
| arXiv 1306.5777, Motter & Campbell, Chaos at Fifty (PDF) | c14 note, c15 |
| PubMed 27069377, Schultz 2016; 9658025, Schultz 1998; 9054347, Schultz, Dayan & Montague 1997 (abstracts) | c16 |
| NBER 2013 conference draft, Budish, Cramton & Shim | c17 |
