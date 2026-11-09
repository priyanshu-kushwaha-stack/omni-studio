# Say Suppose: topic scoring, research and first run

2026-11-09. A score the agent can run each week to rank what-if topics. The owner picks; this only ranks and
recommends. Nothing in the repo was edited and no paid call was made.

**How the data was collected.** View counts, channel medians and search results come from YouTube's public pages
(channel `/videos` tabs and `results?search_query=`), read logged out with curl and parsed from the page's own
`ytInitialData`. Autocomplete is Google's public suggest endpoint with `ds=yt`. Daily trends come from the Google
Trends RSS feed. No API, no credentials, no yt-dlp, nothing under `~/.config/omni-studio`. YouTube served these
pages normally, with no block or consent wall, so nothing had to be worked around. Owner: if you count reading
YouTube's public HTML as too close to the yt-dlp rule, say so. The weekly run can do the same reading through the
browser pane instead. All counts are as of 2026-11-08/09. A channel's median is taken over its last 30 long uploads
(fewer for young channels) as they stand today. That median includes very young videos, so ratios are rough.

---

## Part 1. How great creators pick topics

### 1. The outlier method
- **The formula:** a video's views divided by its channel's typical views. Most write-ups use the median, because
  one hit distorts the average. vidIQ uses the channel's average over a similar timeframe. Outlier.so subtracts 1.
  ([OverseerOS](https://www.overseeros.com/blog/youtube-outlier-analysis),
  [vidIQ help](https://support.vidiq.com/en/articles/9660010-outliers),
  [CreatorSignal](https://www.creatorsignal.io/blog/outlier-method-youtube-video-ideas/))
- **Why it works:** raw views mix the channel's reach with the topic's pull. A 40K-view video on a channel that
  usually gets 2K says more about the topic than a 2M video on a channel that always gets 2M.
- **Thresholds are conventions, not rules.** 1of10 treats under 2x as noise, 3 to 5x as worth noting, 10x and up as
  a trend or format the niche rewards, and 50x on a small channel as the strongest signal. It scores the past week's
  top search results against each channel's last ten uploads ([1of10](https://1of10.com/blog/trending-on-youtube/)).
  CreatorSignal: 10 to 30x suggests the topic, not the packaging, drove the views.
- **Look for repeats across channels.** One outlier can be luck or promotion. The same core topic winning on several
  channels is demand. Weight the last 6 to 12 months more, and adapt the topic rather than copying the video
  ([CreatorSignal](https://www.creatorsignal.io/blog/outlier-method-youtube-video-ideas/)).
- **Velocity catches outliers early.** In OverseerOS's 3,844 breakout videos, the early ones (median age 8 days) ran
  at 15x their channel's normal views per hour while their total views still looked small. Caveat: the sample is
  their own users' research, and the company sells the tool
  ([OverseerOS breakout study](https://www.overseeros.com/blog/youtube-breakout-videos)).
- **Formats outlast topics.** If one title pattern wins across unrelated topics, the pattern is the trend. 1of10
  splits signals into spikes (hours to 3 days: publish within 48 h or skip), trends (weeks to months) and formats
  (months to years) ([1of10](https://1of10.com/blog/trending-on-youtube/)).

**What the method shows in our niche this week** (measured, details in Part 3):
- The second-person what-if format is a live trend. Small new channels are hitting 10 to 175x: The If Lab's read
  minds 298K on a 1.7K median, IFinity's invisible 679K on 8K, Ifsphere's breathe underwater 322K on 4.9K.
- **The niche is flooded with copies.** For most plain titles ("What If You Stopped Aging at 25?", "...Never Lie
  Again?", "...Speak Every Language?") the search page is a wall of uploads from the last two weeks, nearly all under
  1K views and many under 100. The plain title is a commodity. The winners add a twist: an inversion ("Everyone
  Could Hear Your Thoughts"), a stake ("...to Save Your Sister") or a precise rule.
- **Copies of an outlier fail.** Awaken's "Can 2 People Really Restart Humanity?" (5.2M, 15x its median) was
  re-uploaded under the same title by at least four channels within two weeks, at 62 to 1,605 views each.

### 2. Paddy Galloway (topic and packaging)
- **Packaging is the idea.** Title and thumbnail. His rule: an idea that can't be packaged gets scrapped, "if we
  can't package an idea, it's not an idea anymore" ([Creator Science #152](https://creatorscience.com/podcast/paddy-galloway/)).
- **Give ideas time.** Top creators spend about 30% of their time on ideation and packaging. Most small creators
  spend about 5% and pour 95% into filming and editing
  ([Colin and Samir](https://www.colinandsamir.com/resources/the-new-rules-of-youtube-from-paddy-galloway)).
- **Criteria before ideas:** it excites the team, it is feasible, and there is evidence it can reach the target
  views (experiments excepted). It must appeal to core and new or casual viewers alike, or growth stalls
  ([Creator Science](https://creatorscience.com/podcast/paddy-galloway/)).
- **Familiar but unexpected:** recognisable in the niche, plus a twist that stops the scroll. Borrow proven formats
  from other niches. About 80% of videos should serve the core audience and 20% experiment
  ([Colin and Samir](https://www.colinandsamir.com/resources/the-new-rules-of-youtube-from-paddy-galloway)).
- **Titles** about 50 characters, plain words that a non-native speaker gets, no puns. **Thumbnails** are 80 to 90%
  click psychology, pass a one-to-two-second glance test, and carry two to four words of text at most. Sketch about
  three really different concepts ([Creator Science](https://creatorscience.com/podcast/paddy-galloway/)).
- **Quality over frequency.** He cites a client who cut uploads to a few a month and grew. He skips videos below the
  channel's standard. This bears on the daily target: a daily slot should never be filled with a sub-par topic.

### 3. MrBeast's memo (ideas and clickability)
The leaked onboarding memo "How to Succeed in MrBeast Production"
([text](https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/);
coverage: [Tubefilter](https://www.tubefilter.com/2024/09/17/mrbeast-internal-production-guide-leaked-key-points/),
[Sherwood](https://sherwood.news/culture/mrbeast-youtube-leaked-internal-success-document/)):
- **Three numbers:** CTR, average view duration and average view percentage. The idea sets the CTR before any
  production starts.
- **The ketchup example (paraphrased):** "50 hours in my front yard" and "50 hours in ketchup" take the same effort,
  but the second is vastly more clickable. A more extreme verb ("survived" over "spent") adds intrigue.
- **Title and thumbnail come first.** Everyone working on the video must know them before production, because they
  set the viewer's expectation. A thumbnail that promises one thing and a video that shows another loses the viewer.
- **The first minute** is where most viewers leave, so it must deliver the title's promise at once.
- **"Wow factor":** something no other creator could make. For us, that is a sourced fact drawn in paper-cut that
  nobody else shows.
- **Formats decay.** Audiences ask for more of the same but want freshness. Never run the same format back to back.

### 4. Packaging first
Write the title and thumbnail before the script. Thomas Frank: make at least one strong thumbnail before scripting
([thomasjfrank.com](https://thomasjfrank.com/creator/youtube-thumbnail-design-the-ultimate-guide/)). The playbook at
[howtoyoutube.dev](https://howtoyoutube.dev/): write the title, then ask whether the video can deliver it. OverseerOS's
order is topic, promise, title, thumbnail, hook, first 30 seconds, then delivery
([OverseerOS](https://www.overseeros.com/blog/youtube-packaging-strategy)). Our G1 (packaging) before G2 (script)
already follows this. The scorer adds a packaging test as gate 0: no clean title and no three-word tag means the
topic is not scored.

### 5. Evergreen vs trending
Trend videos earn most of their lifetime views in the first week and then die. Evergreen videos keep collecting views
through search and suggestions for years ([HookLab](https://hooklab.co.uk/blog/evergreen-vs-trend-content-on-youtube-which-should-you-make),
[Subscribr](https://subscribr.ai/youtube-strategy/evergreen-vs-trending-youtube-topics)). A common rule of thumb is
about 70% evergreen and 20% timely, and giving a trend an evergreen angle. These figures come from creator-tool blogs,
not YouTube data. For a what-if channel the best topic is **evergreen with a news peg**: "AI takes the jobs" is
timeless as a daydream, and the news this month makes it urgent.

### 6. Google Trends and YouTube autocomplete
- **Autocomplete** suggestions are weighted by recent search frequency, so rising phrasings show up there before any
  dashboard does ([vidIQ](https://vidiq.com/blog/post/find-trending-topics-youtube-videos/)). Seeding "what if you
  could" today returns ConChaser's and IFNation's premises ("see how long everyone has left", "see everyone's
  future wealth", "everyone could hear your thoughts"). This week's outliers are what people now type.
- **Google Trends** set to **YouTube Search** shows relative interest from 0 to 100 inside YouTube. Use 5 years for
  seasonality and 7 days with "Rising" for momentum. It confirms a trend; it doesn't discover one
  ([1of10](https://1of10.com/blog/trending-on-youtube/), [Semrush](https://www.semrush.com/blog/google-trends/)).
  The daily-trends feed for India and the US is almost all sport and TV (checked 2026-11-09; one real-world item:
  "aqi rajkot"), so news spikes rarely fit us. Use Trends to compare our candidates, not to find them.
- **Search volume has nothing to say about angles.** The angle wins the video
  ([Mrktcorrect](https://mrktcorrect.com/blog/youtube-keyword-research)).

### 7. Sequels decay
No published study turned up ([search](https://vidpros.com/youtube-returning-viewers/)), but the reference channels
measure it. Every part 2 below got less than half its original:

| Channel | Original | Follow-ups |
|---|---|---|
| Ifverse | 500 IQ, 1.4M | ...to Disappear 554K, then ...to Save Your Sister 248K |
| Ifverse | One Second Felt Like Ten, 691K | ...Like Forever 388K |
| Ifverse | Reaction Time 10x, 4.7M | Full-movie re-cut 34K |
| IFOLOGY | Zombie Apocalypse, 131K | Part 2 60K, Part 3 51K, Part 4 18K |
| Ifinite | Read Minds, 199K | Part 2 5.3K |

MrBeast's memo says the same: rotate formats and don't put two of the same back to back. **Rule: a follow-up to one
of our topics scores demand at half, and two videos of the same kind (two money topics, two body powers) never run
back to back.**

---

## Part 2. The scoring mechanism

### Gate 0: packaging (Paddy)
Write a title of 50 characters or fewer and a thumbnail tag of three words or fewer, in our style. No clean pair
means no score.

### Gate 1: fit (the owner's nine-point card, adopted 2026-11-08)
Each point is pass or fail, with a one-line reason. **Any fail means not eligible**, though the topic is still scored
so a fix or a later date can be weighed.
1 a daydream people already had; 2 you can live it from an ordinary moment of your week; 3 a wrong belief it breaks;
4 at least three real mechanisms, sourced; 5 one mind-boggle; 6 a ladder of three jumps (you, your city, the planet
or a lifetime); 7 a person to lose; 8 buildable in code-drawn paper-cut; 9 new to us and our neighbours (an exact
premise made in the last 12 months by Ifverse, Awaken, ConChaser or What If fails, and so does a near-duplicate of
one of our own videos).

### The score: 100 points

| Sub-score | Pts | How to measure (public sources only) | Evidence to record |
|---|---|---|---|
| **D Demand** | 30 | Run one YouTube search for the premise (logged out, top 20 results) and open each candidate comparable's channel `/videos` tab. **D1 ceiling** (0-12): best long-form comparable of the same premise, at most 8 years old: 5M+ 12, 1-5M 9, 300K-1M 6, 100-300K 3, else 0. Shorts count one tier lower; an adjacent premise gets half. **D2 outlier** (0-10): best ratio of views to the channel's median of its last 30 long uploads, among comparables at most 12 months old: 10x+ 10, 5-10x 7, 3-5x 5, 1.5-3x 2, else 0. **D3 autocomplete** (0-4): premise appears in YouTube autocomplete for a 3-word seed 4; related phrasing 2. **D4 India** (0-4): an Indian or Hindi comparable at 1M+, or India-specific autocomplete 4; 100K-1M 2 | Best comparable: title, channel, views, age, URL; the outlier video and its channel median; the autocomplete string |
| **M Momentum** | 15 | **Signals in the last 30 days** (0, 4, 7 or 10 for none, one, two, three or more): a news event, a what-if video at 3x or more, a Google Trends rising query (YouTube Search, 7 days). **Durability** (0-5): evergreen daydream 5, seasonal or recurring 2, one-off spike 0 | Dated links for each signal |
| **N Novelty** | 20 | Start at 20. **Neighbour:** the same premise by a what-if channel with traction in the last 12 months, -6. The exact title or premise by Ifverse, Awaken, ConChaser or What If, or by any channel in the last 30 days, -12 (a fit 9 fail when it is a close reference). **Flood:** same-title uploads under 30 days old in the top 20, 4 to 7 of them -4, 8 or more -8 | Neighbour links, the flood count |
| **P Production** | 20 | **Sets** (0-8): home and street only 8; one new ordinary set (office, shop, metro) or new puppets 6; one exotic set (sea, sky, coast) 3; a new scale or several exotic sets 1. **Research** (0-6): official or peer-reviewed numbers exist 6; mixed or contested 4; mostly speculative 2. **Rule device** (0-6): one obvious drawn visual 6; workable 4; hard to show 2 | The sets list, the three mechanisms with a candidate source each, a one-line device sketch |
| **R Risk** | 15 | Start at 15. Health or body content (explain, never advise) -5. Politics or contested policy needing a neutrality review -5. Death, tragedy or disaster at the centre -5. Advertiser-sensitive (gambling, sex, violence) -3. Floor 0 | Which flags apply, and the plan for each |

**Total = D + M + N + P + R.** Eligible topics rank by total. Ties go to the lower production cost, then the
higher D4 (India).

**Running it each week (about 2 minutes a topic, 25 topics in an hour):**
1. Refresh the pool (10 min). Seed autocomplete with "what if you", "what if you could", "what if everyone",
   "what if the" and "what if ai". Read the last two weeks of uploads from the channels in the tracker list below.
   Note any video at 5x or more, and add its premise in our own second-person angle.
2. For each topic, run one search, open the two best comparables' channels, write the medians down, run one
   autocomplete seed, and run one news search for momentum.
3. Score, then run the fit card. Write one YAML row per topic in the evidence log
   (`what_if, title, tag, D1..D4, M, N, P, R, total, fails, links`).
4. Apply the sequel and no-back-to-back rules to the shortlist, then hand the top 10 to the owner.

**Tracker channels** (all public): Ifverse, Awaken (@Afterimath), ConChaser, IFOLOGY (@IFOLOGYFILMS), IFNation
(@ifnation-f4z), OTHERWISE (@Otherwisetale-b5x), The Hypothetical Room, Ifsphere (@ifspheretales), WHATIFFY, Iflord,
FuturiF, What If (@whatifscienceshow), The Infographics Show, WatchData, Kurzgesagt, Zack D. Films, Primal Space,
and for India FactTechz and FilterCopy.

**Limits.** Medians come from today's last 30 uploads, not the channel at the time of an old hit. YouTube search is
personalised by region even when logged out (these runs were from India). Google Trends comparisons were not pulled
this run (the explore page needs a browser), so momentum here rests on news and fresh outliers. Next week, read
Trends in the browser pane for the top 10.

---

## Part 3. The run: 28 candidates (2026-11-09)

Mechanisms and mind-boggles marked **(seen)** were read in search results this session; fetch the page into
`claims.md` before use. Those marked **(to source)** are leads, not facts.

### Ranked table: eligible topics

| # | What-if (our angle, draft title) | Total | D | M | N | P | R | Wrong belief | Mind-boggle | Person to lose | Key evidence | Fails |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **What If You Could Talk to Animals?** You wake and understand your dog, then the crows outside. Tag: "HE SAID WHAT" | **87** | 23 (9+10+4+0) | 15 | 16 | 18 | 15 | Animals would talk like us, in sentences | Crows remembered a "dangerous" mask for at least 2.7 years and taught their young to scold it (seen, [UW work](https://www.cbc.ca/news/science/crows-share-intelligence-about-enemies-1.1014915)). Sperm whales have a 21-type coda "phonetic alphabet" (seen, [Nature Comms 2024](https://www.nature.com/articles/s41467-024-47221-8)) | Your old dog, who can now tell you it hurts | WatchData "Timeline: Speak to Animals" 1.57M ([I5Xeo7l3meI](https://www.youtube.com/watch?v=I5Xeo7l3meI)). There's An AI For That "We Can Finally Talk To Animals" 980K on a 32K median, **30x**, 3 weeks ([bs0qWWztyP8](https://www.youtube.com/watch?v=bs0qWWztyP8)). Ifsphere 73K on 4.9K, 15x. Autocomplete: "what if you could talk to any animal" | none. Fit 8: new dog and crow puppets (reusable) |
| 2 | **What If AI Took Your Job, and Everyone Else's?** Monday, your laptop has finished your week before chai. Tag: "DONE BY 9AM" | **83** | 30 (12+10+4+4) | 15 | 14 | 14 | 10 | Mass job loss means nobody earns, so the economy just stops. The real question is who buys anything | IMF: about 40% of jobs worldwide exposed, about 60% in rich economies (seen, [Georgieva, Oct 2026](https://www.plataformamedia.com/en/2026/10/12/imf-managing-director-says-ai-could-transform-40-percent-of-jobs-globally/)). The ATM and bank-teller paradox (to source) | A mentor at work whose skill was the job | How Money Works "If AI Takes All Of Our Jobs... Who's Going To Buy Everything?" 3.25M, 4.0x ([MYB0SVTGRj4](https://www.youtube.com/watch?v=MYB0SVTGRj4)). Future of Life Inst. "Economist explains..." 648K on a 4.5K median, **145x**, 8 months ([qflh4GKbmVQ](https://www.youtube.com/watch?v=qflh4GKbmVQ)). Kurzgesagt "AI Just Crossed the Terrifying Line" 23M, 4.3x, 1 month. India: DD News "Will AI eliminate middle-class jobs" 1.38M; CA Rahul Malodia 3.48M. News: Challenger, Gray & Christmas counted 121,401 AI-linked US job-cut announcements to October (Nov 6; seen in a news search, fetch the report itself); Microsoft voluntary departures (Oct 26); live tracker at [TrueUp](https://www.trueup.io/layoffs). Autocomplete: "what if ai took all jobs". Warning: The Infographics Show's "After AI Takes EVERY Job" got 99K on a 544K median, **0.18x**. The plain doom title flopped; the paradox angle won | none. Needs the neutrality review (contested forecasts), and an office set |
| 3 | What would happen if everyone is given UBI? (picked, title gate passed) | 79 | 25 (12+5+4+4) | 12 | 16 | 16 | 10 | Free money makes people stop working | Pilots: 122 US guaranteed-income pilots, average $616 a month; a 0.8-point average employment effect in the randomised ones (seen, [AEI via Daily Economy](https://thedailyeconomy.org/article/what-122-universal-basic-income-experiments-actually-show/)) | (in the script) | Kurzgesagt UBI 10.9M; Dhruv Rathee 1.4M (India); There's An AI For That 108K, 3.4x. News: Ellison's "universal high income" (Oct 27), [Marketplace, Oct 21](https://www.marketplace.org/story/2026/10/21/ubi-universal-basic-income-ai-job-disruptions) | in production. Pairs with #2 through end screens; keep two videos between them |
| 4 | What If You Stopped Aging at 25, and No One Else Did? Your 26th birthday; the candles change, your face doesn't. Tag: "STILL 25" | 76 | 26 (12+10+4+0) | 9 | 6 | 20 | 15 | Without ageing you'd live forever | With ageing gone and today's accident and violence rates, average life comes out around 1,000 to 2,000 years, not forever (seen, [Sci Am, de Magalhães](https://www.scientificamerican.com/article/how-old-can-humans-get/)) | Your mother, who keeps ageing | Lazy Owl "Live as an Immortal" 7.45M on a 102K median, 73x, 3 years ([b1NpuwAKBCk](https://www.youtube.com/watch?v=b1NpuwAKBCk)). Iflord "What If You Were Immortal?" 1.21M on a 71K median, **17x**, 2 weeks ([M_t2ZUz7_pc](https://www.youtube.com/watch?v=M_t2ZUz7_pc)). Flood: at least 9 "Stopped Aging at 25" uploads in 10 days, all under 400 views | none. Use the "no one else did" twist, not the plain title |
| 5 | What If You Could Breathe Underwater? You stay under in the pool; nobody notices for a minute. Tag: "NO AIR NEEDED" | 76 | 23 (9+10+4+0) | 9 | 16 | 13 | 15 | Gills would let a person breathe water like air | Water holds far less oxygen than air (to source); liquid breathing was tried with perfluorocarbon (to source) | A little brother who can't follow you down | What If 1.59M, 7 years ([766V-KZvmP0](https://www.youtube.com/watch?v=766V-KZvmP0)). Peekaboo Kidz 2.36M. Ifsphere 322K on a 4.9K median, **66x**, 2 weeks ([ggRf0ZYzrr8](https://www.youtube.com/watch?v=ggRf0ZYzrr8)). Autocomplete: "what if you could breathe underwater" | none. Fit 8: new pool and sea sets |
| 6 | What If You Met Your Clone? A baby is handed to you: "he's you." Tag: "MY CLONE?" | 74 | 20 (9+7+4+0) | 9 | 10 | 20 | 15 | A clone would be a copy of you, memories and all | A clone is born a baby; identical twins are natural clones (to source) | The clone, who grows up and isn't you | Life Noggin "Cloned Yourself" 2.48M, 8 years. WHATIFFY "100 of You" 47K on a 7.1K median, 6.6x. IFOLOGY "Clone Yourself" 97K, 2x, 12 days. Autocomplete: "what if you could clone yourself" | none. IFOLOGY 12 days ago, so lean on the baby twist |
| 7 | What If the Moon Vanished Tonight? Terrace, chai, the Moon you'd look for at Eid or Karva Chauth is gone. Tag: "WHERE'D IT GO" | 71 | 20 (12+0+4+4) | 5 | 16 | 15 | 15 | Earth would be wrecked at once | Tides shrink rather than stop, because the Sun still raises them (to source); the long-term wobble of the axis (to source) | A fisherman uncle whose tides change | FactTechz (Hindi) "अगर चाँद फट जाये" 13.96M, 8 years ([9Cy4Gl7Hng4](https://www.youtube.com/watch?v=9Cy4Gl7Hng4)). Peekaboo Kidz 3.99M. What If 1.23M. India autocomplete: "what if the moon disappeared tonight" (our exact words) | none. Fit 8: coast set (new). Fit 7 is the weakest point; settle it before G1 |
| 8 | What If You Won the Lottery Tomorrow? Ticket from the corner shop; numbers match. Tag: "ALL SIX" | 70 | 16 (12+0+4+0) | 5 | 17 | 20 | 12 | Winners blow it all and end up miserable | Swedish lottery data: winners don't squander their wealth, and their earnings fall only modestly, for at least ten years (seen, [AER 2017](https://www.aeaweb.org/articles?id=10.1257%2Faer.20151589)) | The friend who asks for a loan | jack pockets "What Happens When You Win The Lottery?" 6.99M ([XO5KrFb9yhM](https://www.youtube.com/watch?v=XO5KrFb9yhM)). Alux 3.27M. TED-Ed 739K. Adjacent: ConChaser "See Winning Lottery Tickets" 286K, 2.1x. Autocomplete: "what if you won the lottery" | none. Gambling: explain, never encourage. Not within two videos of UBI |
| 9 | What If You Were Invisible for a Day? You vanish brushing your teeth, then trip over the dog. Tag: "CAN'T SEE ME" | 68 | 20 (6+10+4+0) | 9 | 6 | 18 | 15 | You'd see everything unseen | A truly invisible eye can't see, because the retina has to absorb light (to source) | A parent who can't find you | IFinity "Turn Invisible at Will" 679K on an 8K median, **85x**, 3 weeks ([jqXG42osQOc](https://www.youtube.com/watch?v=jqXG42osQOc)). The Hypothetical Room 152K, 4 days. Flood: 6+ same-title uploads this month. Autocomplete: "what would you do if you were invisible for a day" | none, but heavily covered; the blindness twist is known |
| 10 | What If You Could Fly? Late for the bus, you just... lift. Tag: "LATE? FLY" | 67 | 18 (9+7+2+0) | 9 | 10 | 15 | 15 | You'd just need wings | Human-powered flight crossed the English Channel by pedal (to source) | — (weak) | Because Science 2.84M. IFOLOGY 238K on a 47K median, 5x, 4 weeks | Fit 7 weak. Fit 8: sky sets |
| 11 | What If You Remembered Everything? You recall every word of a fight from 2014. Tag: "NEVER FORGET" | 64 | 10 (6+0+4+0) | 5 | 16 | 18 | 15 | Perfect memory makes you a genius | Highly superior autobiographical memory is real and rare (to source) | Your sister, after a fight neither of you can forget | Infographics 479K, 7 years. Ifora "Remembered Everything From the Womb" 161K, 5 days. Autocomplete: "what if you could remember everything" | none |
| 12 | What If the Internet Went Off for a Month? Your phone shows one bar of nothing. Tag: "NO SIGNAL" | 64 | 17 (9+0+4+4) | 5 | 12 | 20 | 10 | Life goes back to the 1990s | (to source: payments, logistics, shutdown records) | — | Infographics "First 60 Minutes..." 1.17M. What If 1.0M. India autocomplete: "what if the internet disappeared for 24 hours". Flood: 6+ | India shutdown politics: needs neutrality |
| 13 | What If All Money Vanished Overnight? Your UPI, your notes, gone; the chai stall still opens. Tag: "₹0 EVERYWHERE" | 64 | 12 (6+2+4+0) | 5 | 12 | 20 | 15 | We'd go back to barter | Ireland's 1970 bank strike (to source); UPI cleared 25.47 bn payments in October 2026 (seen, [NPCI via Inc42](https://inc42.com/buzz/upi-transactions-rise-5-8-mom-to-record-25-47-bn-in-october/)) | The chai-wallah who extends credit | What If 586K, 7 years. OTHERWISE "Everything Got 10,000x Cheaper, Except Your Money" 262K, 4.9x. Flood: 5+ | none. Not within two videos of UBI or the lottery. Absorbs the UPI idea (row 24) |
| 14 | What If You Could Teleport Anywhere? Tag: "BLINK. GOA." | 63 | 20 (9+7+4+0) | 9 | 6 | 13 | 15 | Teleporting is just fast travel | Quantum teleportation moves states, not things (to source) | — | Peekaboo Kidz 1.56M. IFOLOGY 355K, 7.5x. Flood: 7+ | Fit 7 weak. Fit 8: many locations |
| 15 | What If Gravity Were Half? Your dropped phone floats down. Tag: "SLOW FALL" | 61 | 11 (9+0+2+0) | 5 | 10 | 20 | 15 | You'd only jump twice as high | (to source) | — (weak) | Life Noggin 1.03M. What If's "Gravity Got 1% Stronger" 315K, 0.8x, 4 weeks | Fit 7 weak |
| 16 | What If You Shrank to the Size of an Ant? Tag: "TINY ME" | 61 | 18 (9+5+4+0) | 9 | 6 | 13 | 15 | Small means weak | The square-cube law (to source) | — | What If "Shrunk 1cm Every Second" 1.19M, 3.1x. IFOLOGY "Shrink 100X" 151K, 3.2x | Fit 8: a whole new scale of sets. Fit 7 weak |
| 17 | What If You Never Had to Sleep Again? Tag: "8 HOURS MORE" | 60 | 13 (9+0+4+0) | 5 | 12 | 20 | 10 | Sleep is wasted time | The brain clears waste in sleep (to source) | A partner on a different clock | Infographics "NEVER Slept (Day by Day)" 811K, 1.5x. Short "What Happens If You Never Sleep" 40.4M. Flood: 5+ | Health: explain only |
| 18 | What If You Could Never Lie Again? Tag: "ONLY TRUTH" | 56 | 4 (0+0+4+0) | 5 | 12 | 20 | 15 | Honesty makes life simpler | People tell about one or two lies a day (to source) | A friend you'd have spared | Nothing above 200 views; flood of 9+ near-zero uploads. Autocomplete: "what if you couldn't lie" | none; demand unproven |
| 19 | What If Your Boss Were an AI? Tag: "MEET YOUR BOSS" | 56 | 5 (4+1+0+0) | 15 | 12 | 14 | 10 | An AI boss would be fair | Algorithmic management already runs some delivery and warehouse jobs (to source) | — | Ryan George's sketch "Your Boss Who Has AI Psychosis" 1.52M, 2.9x (adjacent). Flood: 5 near-zero | demand weak; use as a beat inside #2 |
| 20 | What If You Could Speak Every Language? Tag: "I GET IT ALL" | 52 | 0 | 5 | 12 | 20 | 15 | — | India's census languages (to source) | — | Best comparable 5.8K; flood of 6+ | demand ~0. A Hinglish showcase later, not now |
| 21 | What If Everyone Could See Your Salary? Tag: "₹ ON YOUR HEAD" | 51 | 9 (4+5+0+0) | 5 | 6 | 16 | 15 | Pay transparency makes everyone happier | After Norway put tax records online in 2001, the happiness gap between rich and poor grew 29% (seen, [AER 2020](https://www.aeaweb.org/articles?id=10.1257%2Faer.20160256)) | A colleague who earns less | Adjacent: ConChaser "See Everyone's Future Wealth" 1.6M, 11.5x. The exact premise: 9 near-zero uploads in 2 weeks | Must avoid ConChaser's numbers-over-heads look. Fine facts; weak demand |

### Not eligible (scored, with the failing point)

| What-if | Total | D | M | N | P | R | Fails | Evidence |
|---|---|---|---|---|---|---|---|---|
| What If You Could Hear Everyone's Thoughts? | 78 | 30 | 15 | 0 | 18 | 15 | **9**: Ifverse "If You Could Read Minds..." 9 days ago and "Mentalist" 2 weeks ago; IFNation's inversion 525K, 7.7x, 3 days | India loves it: FilterCopy's "hear thoughts" sketches 29M, 10.5M, 10.4M, 6M, 5M. Revisit in 6+ months with a new angle |
| What If You Were the Last Person on Earth? | 74 | 26 | 15 | 0 | 18 | 15 | **9**: Awaken (our named reference) "Last Girl / Last Guy on Earth" 711K and 662K, and "Restart Humanity" 5.2M, all within 2 weeks | What If 6.33M (7 years); Oddly Elsewhere 930K, 9.3x |
| What If You Knew the Date You'd Die? | 46 | 9 | 9 | 0 | 18 | 10 | **9**: ConChaser "See How Many Days People Have Left", 2 weeks ago, and autocomplete shows "part 4" | Death at the centre (R -5) |
| What If UPI Went Down for a Week? | 61 | 0 | 6 | 20 | 20 | 15 | **1** not a daydream (an outage), **6** no planet rung | UPI 25.47 bn payments in October; outages Feb, Apr and Aug 2026 ([Deccan Herald](https://www.deccanherald.com/india/karnataka/bengaluru/upi-outage-disrupts-digital-payments-nationwide-including-namma-metro-3894421)). Fold it into #13 as the city rung |
| What If You Could See the Air You Breathe? (Delhi smog) | 58 | 0 | 13 | 20 | 20 | 5 | **1** not a daydream | Delhi AQI 371, "severe" forecast from Nov 9 ([The Week](https://www.theweek.in/news/india/2026/11/08/delhi-faces-severe-air-pollution-as-aqi-hits-371-on-diwali.html)). Paper Files' Short "see the air in Delhi" 51K. Better as a **Short** now, health and politics flags |
| What If the Monsoon Never Came? | 54 | 4 | 2 | 20 | 18 | 10 | **1** not a daydream; out of season | Best what-if comparable 747 views |
| What If AI Did Your Job and You Kept the Salary? | — | 30 | 15 | — | 16 | 10 | **9** near-duplicate of our own UBI video | Use it as UBI's closing turn |

### Second-person angles for the owner's AI idea
| Angle | Verdict |
|---|---|
| "What If AI Took Your Job, and Everyone Else's?" | **Recommended.** Personal first, then the paradox (who buys anything?) that made How Money Works's 3.25M |
| "What If AI Took Every Job?" (the plain idea) | The Infographics Show got 0.18x of its median with almost these words; a flood of copies already exists |
| "What If You Were the Last Person With a Job?" | Scores 77 on its own (D 30, M 15, N 8, P 14, R 10; it shares #2's demand), but FuturiF used the exact title 2 weeks ago (49K, [AGz_WJEAWiI](https://www.youtube.com/watch?v=AGz_WJEAWiI)). Keep it as #2's 3:30 reversal scene, not a video |
| "What If AI Did Your Job and You Kept the Pay?" | It is our UBI video; use it as UBI's ending |
| "What If Your Boss Were an AI?" | Weak demand; one beat inside the main video |

---

## Suggested batches

The owner decides; these follow the score plus the no-back-to-back rule, the 80/20 split and kit reuse.

**Batch 1 (after pause-time and UBI)**
1. **What If AI Took Your Job, and Everyone Else's?** (83). The owner's idea at its news peak (IMF, Challenger,
   Microsoft, Kurzgesagt's 23M), with an angle that beat a 0.18x flop. Builds the office set. End screen to UBI;
   two videos between them.
2. **What If You Could Talk to Animals?** (87, top). Fresh 30x signal from the AI animal-translation news, a person
   to lose built in (the old dog), and real research. Builds dog and crow puppets the kit will reuse.
3. **What If You Stopped Aging at 25, and No One Else Did?** (76). Home and street only, proven immortality demand
   (17x, 73x), the strongest person-to-lose of the pool, and a clean mind-boggle (about 1,000 years, not forever).
4. **What If You Met Your Clone?** (74). Cheapest to build (a second you on the existing rig), and the wrong belief
   is sharp.
5. **What If the Moon Vanished Tonight?** (71). The page's own example, India-proof demand (FactTechz 14M; India
   autocomplete uses our exact words), and evergreen. Builds the coast set and the night mood. Settle its person to
   lose at G1.

**Batch 2**
6. **What If You Could Breathe Underwater?** (76). Ifsphere's 66x shows the demand; builds the pool and sea sets.
7. **What If You Won the Lottery Tomorrow?** (70). The Swedish lottery studies give a clean wrong belief; keep it two
   or more videos away from UBI.
8. **What If You Were Invisible for a Day?** (68). Evergreen and high-outlier, but crowded; only with the twist that
   an invisible eye is blind, as the 3:30 reversal.
9. **What If You Remembered Everything?** (64). Cheap, emotional (a fight neither sibling can forget), low flood.
10. **What If All Money Vanished Overnight?** (64). India's UPI as the city rung; spaced from the other money topics.

**Hold:** hear everyone's thoughts (India's favourite, but Ifverse just did mind-reading; revisit in 6+ months with
a new angle). **Make as a Short now:** see the air in Delhi, while the smog is in the news (health and politics
flags).

**Pace note.** Paddy's evidence favours fewer, better videos over a full daily slot. Ten eligible topics at 64+ is
about two weeks of daily uploads. The weekly run should add 5 to 7 fresh candidates to keep the pool ahead.
