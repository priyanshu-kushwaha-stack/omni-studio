You are one of five independent raters in an idea room for a YouTube channel (round 2 of 2, the convergence round). Do not use tools or read files.

THE CHANNEL. Say Suppose (@SaySuppose): second-person what-if stories you live through; a paper-cut stick figure animated in code; invented story, every real fact sourced; cinematic, relatable, felt, a new perspective, holds the viewer to the end. Already made: "What If You Could Pause Time for 10 Seconds a Day?".
THE VIEWER. A young Indian, comfortable in English, on a phone in the evening (chai, metro, exams, office, family); titles must also work globally.
GOAL. Grow a brand-new channel.

WHAT IS NEW IN THIS ROUND. For each entry you now see: the anonymised result of round 1 (median and range of the five raters' overall scores, and the strongest reason given for and against), and public YouTube evidence gathered this morning (closest comparable videos, and whether the plain phrasing is flooded with near-zero-view copies; a flood means the plain title is dead, not that the daydream is). Ten entries marked REWRITTEN were written too briefly in round 1 and have been rewritten to the same depth as the rest: score those from scratch, ignoring their round-1 result.

YOUR TASK. Give your final scores for EVERY entry: click, story, felt, perspective, buildable, overall (1-10; use the full range; roughly the top fifth 8 or more, the bottom fifth 4 or less). Revise your view where the other raters' reasons or the evidence persuade you; hold it where they do not. One short reason each; if your overall differs from the round-1 median by 2 or more, say why.

Output ONLY a JSON array inside one ```json fenced block, keys exactly "id","click","story","felt","perspective","buildable","overall","reason". Keep every value on one line.

ENTRIES:
[
 {
  "id": "M10",
  "title": "What If You Could Switch Off Gravity for Yourself?",
  "tag": "Zero Gravity You",
  "hook": "You press a button in a packed metro and float to the ceiling while everyone stares. You fly home over the traffic. A year later you cannot stand up without fainting, and your bones are those of an eighty-year-old.",
  "wrong_belief": "Weightlessness is pure freedom, the closest thing to a real superpower.",
  "mind_boggle": "Astronauts lose ~1% of bone mass a month in weightlessness, about ten times an osteoporosis rate; hearts shrink, faces puff, many faint on return.",
  "person": "Your grandmother, whose slow walk and brittle bones you once teased, and who ends up teaching you how to stand again.",
  "round1": "median 6.0, range 4-7; for: The oldest fantasy turned into body-horror with a real lesson and clean animation potential. | against: A fun metro float, but bone loss is a slow-motion payoff and it duplicates the other gravity idea.",
  "evidence": "What IF You Could Control Gravity? (IFOLOGY, 248K, 3w ago, 2nd-person story); What If We Lost Gravity for 5 Seconds? (What If, 2.3M, 6y ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M25",
  "title": "What If You Could Fast-Forward the Boring Parts of Life?",
  "tag": "SKIP 2 HOURS?",
  "hook": "Stuck on a packed Monday bus with ninety minutes of traffic ahead, you tap your wrist and blink, instantly stepping off at your stop, rested. Then you skip whole workdays, until you realize who was driving your body while you were gone.",
  "wrong_belief": "Cutting out dead time gives you a pure highlight-reel life.",
  "mind_boggle": "The Default Mode Network fires at near problem-solving cost during boring periods to weave episodic memory into a continuous self; skipping transitions makes years vanish in what feels like days.",
  "person": "Your mother, who realizes every family dinner for two years was a hollow autopilot waiting to skip to the next highlight.",
  "round1": "median 8.0, range 7-9; for: It begins with universal commute frustration and escalates into a chilling loss of continuity, memory and family presence. | against: Skipping family dinners on autopilot is a quiet horror the commute-weary viewer will feel.",
  "evidence": "What If You Could Fast-Forward Your Life? (What if U click, 7.8K, 4d ago, 2nd-person story); What If You Could Skip the Boring Parts of Your Life? (Infinite Ifs, 2.1K, 6d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M07",
  "title": "What If You Lived a Second Life Every Night?",
  "tag": "Two Lives",
  "hook": "Every night when you close your eyes you wake in another life, another city, another family, and you remember all of it in the morning. By month three you are not sure which life you are returning to.",
  "wrong_belief": "A dream life would be free: all the adventure and none of the cost, since you are asleep anyway.",
  "mind_boggle": "In 2021 scientists held two-way conversations with sleeping dreamers, who answered maths questions correctly with eye movements from inside the dream.",
  "person": "Your real partner, who notices you have started grieving someone they have never met.",
  "round1": "median 7.0, range 6-7; for: Two-way dream conversations are a great fact; identity-blur arc is solid but familiar. | against: By month three you are grieving someone your waking partner has never met, which is a life splitting in two.",
  "evidence": "Dreams Are Real (Metaphysical, 2.9M, 2y ago); Signs That A Parallel Version Of You Is Trying To Send You A (Spiritual Dive, 2.8M, 2y ago)"
 },
 {
  "id": "M22",
  "title": "What If ₹100 Appeared in Your Account Every Second?",
  "tag": "₹86 LAKH / DAY",
  "hook": "You check your banking app on the bus and the balance ticks up by a hundred rupees, then another, every single second. By Friday your bank's fraud algorithm will freeze your entire life.",
  "wrong_belief": "Magical passive income lets you immediately buy apartments, clear loans and quit your job.",
  "mind_boggle": "1 inflow per second is 86,400 ledger entries a day, tripping automated velocity/structuring thresholds in minutes; under FATF-style rules the burden of proof falls on you.",
  "person": "Your parents, whose joint account and life savings get frozen alongside yours when you transfer money to pay off their home loan.",
  "round1": "median 7.0, range 6-8; for: Free money triggering a bank freeze that swallows your parents' savings is dread every UPI user feels. | against: A hundred rupees a second ticking on the bus is irresistible until the freeze lands on your parents' home loan.",
  "evidence": "What If You Earned $1 Every Second ? (Milo Whatsit, 217K, 2w ago, 2nd-person story); What If You Got $1 Every Second — But Aged 1 Day Every Secon (TenFold, 2K, 4d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M13",
  "title": "What If Tomorrow Texted You Tonight?",
  "tag": "TEXT FROM TOMORROW",
  "hook": "At 11:59 p.m. a message says the power will fail at midnight, and it does. The next message says, 'Don't let Ma board the 8:10 bus.'",
  "wrong_belief": "Even imperfect knowledge of tomorrow would let you prevent every disaster.",
  "mind_boggle": "A 99%-accurate warning system for a one-in-a-million event can throw roughly 10,000 false alarms per true one; accuracy without base rates misleads.",
  "person": "Your mother, whom you might endanger either by ignoring the warning or by obeying it.",
  "round1": "median 7.0, range 7-9; for: The text about your mother's 8:10 bus is a whole thriller, and the false-alarm math keeps either choice dangerous. | against: A gripping thriller with a damned-either-way dilemma and a clever base-rate insight.",
  "evidence": "What If You Got a Text From Tomorrow? (Twivio, 2K, 9d ago, 2nd-person story); You Got a Text From Yourself, 10 Years in the Future (Chronofantasyy, 190, 8d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M16",
  "title": "What If Every Database Forgot You?",
  "tag": "IDENTITY NOT FOUND",
  "hook": "The metro rejects you, your bank has no customer by your name, and your office says you never worked there. Your mother remembers you, but no machine does.",
  "wrong_belief": "Being erased from official systems would make you free and impossible to track.",
  "mind_boggle": "The World Bank estimates about 850 million people lack official identification, blocking banking, jobs, healthcare and government support.",
  "person": "Your father, whose medicine or insurance depends on an account the system says you never owned.",
  "round1": "median 7.0, range 6-7; for: Viscerally captures modern urban India's reliance on digital IDs and UPI with strong family medical stakes, despite slightly dry title phrasing. | against: Aadhaar-era dread is real and the 850 million fact lands, but it is colder than the forgotten-by-mother version.",
  "evidence": "What If Every Database on Earth Was Deleted for 24 Hours? (Java Region, 21, 4d ago, 2nd-person story)"
 },
 {
  "id": "M02",
  "title": "What If You Could Never Feel Fear Again?",
  "tag": "Zero Fear",
  "hook": "Tomorrow at 9 am you walk into the interview room and your heart does not move. You text your crush, cross a highway, argue with your boss, and nothing flinches. Within a month you are in hospital, and you don't know why.",
  "wrong_belief": "Fearlessness is courage, so without fear you would finally become confident, successful and free.",
  "mind_boggle": "Patient S.M., her amygdala destroyed by disease, was held at knifepoint and felt nothing, yet breathing CO2 gave her a full panic attack, proving a second fear pathway.",
  "person": "Your younger sibling, whom you take on your 'fearless' plans and who gets hurt while you feel nothing.",
  "round1": "median 7.0, range 7-7; for: Reframes daily anxiety as protection with a barely-known, cinematic real case at its core. | against: A fearless interview, a highway, and a hospital bed give the month a shape, with a sibling hurt while you feel nothing.",
  "evidence": "What If You Could Never Feel Fear... Ever Again? (SimplePsyche, 970, 7d ago); What If You Could Never Feel Fear? (Mr. Maybe, 193, 2d ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M43",
  "title": "What If AI Took Your Job, and Everyone Else's?",
  "tag": "DONE BY 9AM",
  "hook": "It's Monday evening, you're back from the office, and your laptop pings: the whole week's work is done. The chai's gone cold. There's nothing left to do.",
  "wrong_belief": "Mass job loss means nobody earns, so the economy just stops; the real question is who buys anything.",
  "mind_boggle": "IMF: about 40% of jobs worldwide are exposed to AI, about 60% in rich economies (Georgieva, Oct 2026).",
  "person": "Your mentor at work, whose skill was the job, and who trained you on the thing the laptop just finished.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "If AI Takes All The Jobs, This Is What Society Looks Like (Moon, 1M, 2y ago); AI Layoffs Are Finally Showing the Truth (The Infographics Show, 960K, 1mo ago)"
 },
 {
  "id": "M41",
  "title": "What If Your Dreams Were Someone Else's Real Life?",
  "tag": "DREAMS ARE REAL",
  "hook": "Every night you live a full day as a fisherman on a coast you've never seen. Last night, in the dream, a girl handed you a photo of you, awake, right now.",
  "wrong_belief": "You believe dreams are just your brain recycling memories, meaningless noise.",
  "mind_boggle": "You'll spend ~26 years asleep and ~6 dreaming; in REM your visual and emotional brain fires as intensely as when awake, so to your brain the dream is real experience.",
  "person": "The dream-self's daughter, who you love as much as anyone in your waking life, and who ceases to exist every morning at 7 AM.",
  "round1": "median 6.0, range 5-7; for: Its eerie opening and disappearing dream-family promise retention, though the factual insight is less novel than the fiction. | against: A haunting daughter-who-vanishes idea, but it is distant from the viewer's life and needs a whole second world.",
  "evidence": "What If Every Dream Felt Like Real Life? (You, But Extreme, 92, 10d ago); What If Your Dreams Were Someone Else's Reality? (Universal Things, 14, 1y ago)"
 },
 {
  "id": "M21",
  "title": "What If You Could Save and Reload the Last 60 Seconds?",
  "tag": "LOAD LAST SAVE?",
  "hook": "You say the exact wrong thing in a job interview, watch the recruiter's face freeze, and snap your fingers, suddenly back sixty seconds earlier, knowing exactly what not to say.",
  "wrong_belief": "A 60-second quicksave makes you invincible in social life, gambling and danger.",
  "mind_boggle": "Speech averages 150 words per minute and micro-expressions fire in 40-200 ms; replaying one minute 50 times lets you map a person's autonomic system better than a polygraph.",
  "person": "Your father, whose sudden cardiac event you try to prevent forty times before realizing the fatal trigger happened two minutes before you hit save.",
  "round1": "median 7.0, range 6-10; for: A natural follow-up to the channel's first video that pairs effortless loop-animation reuse with an unforgettable third-act twist about your father. | against: Snapping back the interview answer works until your father's heart attack sits two minutes before the save point.",
  "evidence": "What If You Could Rewind Time by 10 Seconds? (Stick Saga, 100K, 4d ago, 2nd-person story); What IF You Could Rewind 10 Seconds ? (Price of If, 11K, 2w ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M30",
  "title": "What If You Grew One Centimeter a Day?",
  "tag": "One CM Daily",
  "hook": "Yesterday your eyes met your mother's. Tonight you are looking down at the parting in her hair, and the doorway is lower than it was this morning.",
  "wrong_belief": "Growing a little taller every day would slowly make life better: more presence, more respect, a better view.",
  "mind_boggle": "Double height and weight multiplies by ~8 while bone cross-section multiplies by ~4; Robert Wadlow, 272 cm, died at 22 after an ankle infection.",
  "person": "Your mother, who loses the height she knows you at, then the doorway, then the ability to reach you on a crowded metro.",
  "round1": "median 6.0, range 5-7; for: Square-cube law is a good boggle, but the daily-growth stakes escalate slowly. | against: Good built-in escalation and square-cube science, but it leans body horror and constant re-rigging.",
  "evidence": "What If You Grew 1cm Every Second? (What If, 1.5M, 7mo ago); What If You Shrunk 1cm Every Second? (What If, 1.1M, 1y ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M27",
  "title": "What If Nobody Could Tell a Lie Within 10 Feet of You?",
  "tag": "ZERO LIES ALLOWED",
  "hook": "Your boss walks past your desk to say your promotion is on track, crosses an invisible line three steps away, and hears himself blurt out that he already gave your spot to his nephew.",
  "wrong_belief": "A truth aura would surround you with honesty and protect you from manipulation.",
  "mind_boggle": "Feldman's UMass studies found ~60% of people lie at least once in a 10-minute chat, mostly cooperative 'social lubricant' lies without which group coordination collapses.",
  "person": "Your partner, who asks a fragile question in a small room where you cannot step back past ten feet to spare them the brutal truth.",
  "round1": "median 7.0, range 7-8; for: A 10-foot truth radius is a brilliant visual device for 2D animation that turns from office comedy into a claustrophobic trap in a small bedroom. | against: A funny, escalating truth-aura with a strong partner scene, though the title is long and it echoes Liar Liar.",
  "evidence": "What If Nobody Could Lie… Except You? (Stick Saga, 450K, 12d ago, 2nd-person story); What If Nobody Could Lie Except You? (What If Hero, 119K, 4d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M46",
  "title": "What If You Could Talk to Animals?",
  "tag": "HE SAID WHAT",
  "hook": "You wake at 6, your dog whines at the door, and this time you understand him. Not words, but it's clear. Then the crows outside answer, and you understand them too.",
  "wrong_belief": "Animals would talk like us, in sentences.",
  "mind_boggle": "Crows remembered a 'dangerous' mask for at least 2.7 years and taught their young to scold it (UW work); sperm whales have a 21-type coda 'phonetic alphabet' (Nature Comms 2024).",
  "person": "Your old dog, who can now tell you it hurts, and does, every evening, until you can't bear it.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "What If You Could Talk to Animals? (Ifsphere, 73K, 3w ago, 2nd-person story); What If You Could Talk To Any Animal? (Questionverse, 64K, 2d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M06",
  "title": "What If You Were Paid in Hours of Your Life?",
  "tag": "Time Is Money",
  "hook": "Your first salary lands and the number is not in rupees. It says 2,040 hours added to your life. Then you look at what your father has been paid for thirty years, and the exchange rate makes you sick.",
  "wrong_belief": "If time were money, hard work would buy you a longer life and the rich would simply have more hours.",
  "mind_boggle": "ILO data puts India among the longest working weeks on Earth (~47 hours), with about half of workers doing 49+ hours, among the highest shares worldwide.",
  "person": "Your father, who has been selling his hours at a price nobody told him, and whose remaining balance you can now see.",
  "round1": "median 7.0, range 6-9; for: It turns salary anxiety and a father's working life into one potent visual metaphor with exceptional Indian resonance. | against: The father's remaining balance is moving, but the title is abstract and the conceit echoes In Time.",
  "evidence": "A World Where Humans Can Live Forever So They Use Time As Mo (Story Recapped, 8.4M, 5y ago); People Become Immortal But Each Person Can Live Only 26 Year (Movie Recaps, 3.7M, 3y ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M51",
  "title": "What If You Were Invisible for a Day?",
  "tag": "CAN'T SEE ME",
  "hook": "You're brushing your teeth before bed, look up, and you're gone. You trip over the dog, who yelps at nothing. Your mom calls your name from the kitchen.",
  "wrong_belief": "You'd see everything unseen.",
  "mind_boggle": "A truly invisible eye can't see, because the retina has to absorb light (to verify).",
  "person": "A parent who can't find you, calling your name through the house while you stand two feet away.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "What If You Could Turn Invisible at Will? (IFinity, 681K, 3w ago, 2nd-person story); What If You Were Invisible? (The Hypothetical Room, 163K, 5d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M26",
  "title": "What If You Could Step Into Any Photo for 5 Minutes?",
  "tag": "5 MINS INSIDE",
  "hook": "You hold an old faded photograph of your living room from fifteen years ago, press your thumb against the paper, and the smell of rain and boiling tea rushes into your lungs. You have exactly five minutes inside the frame.",
  "wrong_belief": "Stepping into photographs is a way to solve mysteries, grab lost valuables or change history.",
  "mind_boggle": "A 50mm lens captures under 47 degrees, less than 13% of the room; studies show looking at photos actively overwrites real memories with the staged 1/250th-second version.",
  "person": "Someone you lost, standing just outside the edge of a happy family photo, whom you get five minutes to talk to before realizing why they were smiling.",
  "round1": "median 9.0, range 7-9; for: The five-minute rule, photographic boundaries and lost loved one create a cinematic story perfectly suited to layered paper sets. | against: Five minutes in a rain-and-tea photograph, with someone standing just outside the frame, is a film this medium can shoot.",
  "evidence": "What If You Could Step Into Any Photo? (Infiniti Ifs, 383, 6d ago, 2nd-person story); What If You Could Walk Into Any Picture? (Every IF, 66, 2w ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M45",
  "title": "What If You Stopped Aging at 25, and No One Else Did?",
  "tag": "STILL 25",
  "hook": "You blow out the candles on your 26th birthday, the family claps, and your cousin frowns. You look the same as 25. And 24. The mirror agrees.",
  "wrong_belief": "Without ageing you'd live forever.",
  "mind_boggle": "With ageing gone and today's accident and violence rates, average life comes out around 1,000 to 2,000 years, not forever (de Magalhães, Sci Am).",
  "person": "Your mother, who keeps ageing, and whose wrinkles you'll watch while yours never come.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "What If You Stopped Aging at 18? (What if U click, 95K, 8d ago, 2nd-person story); What If You Stopped Aging? (What If Max, 1.6K, 9d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M28",
  "title": "What If Everyone Forgot You for a Day?",
  "tag": "Forgotten",
  "hook": "You come home and your mother smiles the polite smile she uses for guests. She slides a cup of chai toward you and asks, kindly, who you are.",
  "wrong_belief": "If everyone forgot you for a day, you would finally see how much they need you, or enjoy a day with no one to answer to.",
  "mind_boggle": "In Capgras delusion a person can agree a face looks exactly like their mother's and still be certain she is a stranger; recognition and the feeling of familiarity are different systems.",
  "person": "Your mother, who offers you chai as a guest and whom you could terrify by trying to force your name back into her.",
  "round1": "median 7.0, range 7-9; for: Your mother offering you guest-chai is the whole film, and familiarity failing while the face still matches makes it worse. | against: A mother's polite chai greeting makes forgetting instantly heartbreaking, and the recognition science adds real depth.",
  "evidence": "What If Everyone Forgot You Existed (KaiVerse and Kai Elsewhere, 32K, 2w ago, 2nd-person story); What If Everyone Forgot You Existed Every 24 Hours? (Iftropica, 720, 13d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M03",
  "title": "What If You Could Never Forget Anything?",
  "tag": "Never Forget",
  "hook": "It is the night before your board exam and you remember every page you have ever read. You also remember, in perfect detail, every word your mother shouted at you when you were nine, and it is playing right now.",
  "wrong_belief": "Perfect memory is the ultimate exam superpower and would make you the smartest person in the room.",
  "mind_boggle": "People with highly superior autobiographical memory recall any day of their life yet score average on word lists; Jill Price called it a burden she cannot switch off.",
  "person": "Your mother, because the one argument you both should have let fade never fades, and you treat her as the person from that day.",
  "round1": "median 8.0, range 7-8; for: The night before boards, perfect memory turns on the shouting from when you were nine and will not turn it off. | against: Directly subverts the board-exam fantasy of photographic memory with the real science of HSAM trapping people in un-fading emotional hurts.",
  "evidence": "What If You Never Forgot Anything? (Every Eli Life, 37K, 4w ago, 2nd-person story); What If You Could Never Forget Anything (Ministry of What If, 115, 11d ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M47",
  "title": "What If You Met Your Clone?",
  "tag": "MY CLONE?",
  "hook": "A nurse hands you a baby in a quiet room. 'He's you,' she says. Same face, same eyes, your exact DNA, born forty minutes ago, crying in your arms.",
  "wrong_belief": "A clone would be a copy of you, memories and all.",
  "mind_boggle": "A clone is born a baby; identical twins are natural clones.",
  "person": "The clone, who grows up with your face and isn't you, and whom you can't stop comparing yourself to.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "What IF You Could Clone Yourself? (IFOLOGY, 98K, 12d ago, 2nd-person story); What IF You Could Clone Yourself ? (The Spiral Card, 33K, 3w ago, 2nd-person story)"
 },
 {
  "id": "M14",
  "title": "What If You Could Sell Your Sleep?",
  "tag": "SLEEP FOR SALE",
  "hook": "An app offers you ₹10,000 for tonight's eight hours of sleep. You tap SELL, then remember tomorrow is your most important exam.",
  "wrong_belief": "Sleep is unproductive time that ambitious people should be able to trade away.",
  "mind_boggle": "After roughly 17-19 hours awake, performance can resemble or worse a 0.05% blood-alcohol level.",
  "person": "A pedestrian, or someone riding beside you, when your exhausted brain microsleeps on the commute.",
  "round1": "median 6.0, range 4-6; for: A marketplace frame makes the invisible sleep cost literal and exam-relatable. | against: Sleep-selling is relatable but the arc (sell, crash) is linear and the science is familiar.",
  "evidence": "What If You Could Sell Your Sleep? (What If, Pip?, 70, 6d ago, 2nd-person story); What If You Sold Your Sleep? (Bolt Animated, 10, 2d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M44",
  "title": "What If You Got Paid Every Month for Nothing?",
  "tag": "YOU'D QUIT?",
  "hook": "Payday, but this time the message isn't your salary. The same amount has landed in every adult's account this morning, yours, your boss's, the chai-wallah's, no conditions.",
  "wrong_belief": "Free money makes people stop working.",
  "mind_boggle": "122 US guaranteed-income pilots averaged $616 a month; the randomised ones showed only a 0.8-point average employment effect.",
  "person": "A friend who finally quits to chase the dream she shelved at 22, and who you stop understanding.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "What Happens If Everyone Gets $1,000/mo? (UBI) (There's An AI For That, 110K, 4mo ago); What Would Happen If Everyone Got $1,000 a Month? (UBI Theor (Andrei Jikh, 498K, 2y ago)"
 },
 {
  "id": "M15",
  "title": "What If Your Dreams Went Live?",
  "tag": "8M SAW THIS",
  "hook": "You wake to eight million views of a dream in which you push your best friend under a train. They have already seen it.",
  "wrong_belief": "Dreams are private confessions that reveal what you secretly want.",
  "mind_boggle": "Researchers have used fMRI to predict broad categories of sleep imagery, but cannot currently reconstruct a cinematic recording of a dream.",
  "person": "Your best friend, who must decide whether the nightmare means anything about the real you.",
  "round1": "median 6.0, range 6-7; for: Merges livestream culture with the fear of being judged for thoughts you didn't choose; build is the stretch. | against: A spicy viral-shame hook, but the science is thin and it overlaps the stronger search-history idea.",
  "evidence": "What If Everyone's Dreams Were Livestreamed? (MoshiLab, 312, 7d ago); What If Your Dreams Played on the Family TV? (WHAT IF YOU..., 42, 2d ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M52",
  "title": "What If All Money Vanished Overnight?",
  "tag": "ZERO EVERYWHERE",
  "hook": "Morning, your UPI shows zero, your wallet's empty, the ATM is blank. But the chai stall across the road is still open, and the uncle is still pouring.",
  "wrong_belief": "We'd go back to barter.",
  "mind_boggle": "Ireland's 1970 bank strike (to verify); UPI cleared 25.47 bn payments in October 2026 (NPCI via Inc42).",
  "person": "The chai-wallah who extends you credit, and whose ledger becomes the first new money in the city.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "What If Money Didn't Exist and All $100 Trillion VANISHED Ov (What If, 585K, 7y ago); What would happen if all money disappeared overnight? (Money Doodles, 596, 1y ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M48",
  "title": "What If You Could Breathe Underwater, and He Couldn't?",
  "tag": "DON'T COME UP",
  "hook": "You sink to the bottom of the society pool and stay. Your friends wave you up, laughing, then shouting. You wave back, calm, breathing easy, not coming up.",
  "wrong_belief": "Gills would let a person breathe water like air.",
  "mind_boggle": "Water holds far less oxygen than air (to verify); liquid breathing was tried with perfluorocarbon (to verify).",
  "person": "Your little brother, who jumps in after you, holds his breath, and waits at the surface you won't come to.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "What If You Could Breathe Underwater? (Ifsphere, 325K, 2w ago, 2nd-person story); What IF You Could Breathe Underwater? (Ifinite, 30K, 2w ago, 2nd-person story)"
 },
 {
  "id": "M04",
  "title": "What If You Only Needed 2 Hours of Sleep?",
  "tag": "22 Hours Awake",
  "hook": "Your alarm rings at 3 am and you are not tired. You will never be tired again. You have 22 hours a day and everyone you love has 16, and for the first week it feels like a second life.",
  "wrong_belief": "More waking hours means more study, more money, more life, and sleep is just wasted time.",
  "mind_boggle": "DEC2 gene carriers thrive on ~6 hours; people kept on 6 hours for two weeks performed like those who'd skipped two whole nights yet rated themselves only slightly sleepy.",
  "person": "Your partner or closest friend, asleep for six of your extra hours, so your lives stop overlapping and you become a stranger in the dark.",
  "round1": "median 7.0, range 6-7; for: Directly rebutts hustle culture with a strange genetic fact and a lonely, earned cost. | against: Extra waking life is appealing and relatable, but loneliness must carry the middle once productivity consequences are established.",
  "evidence": "What If You Sleep 2 Hours Less Every Night? (AsapSCIENCE, 1M, 6y ago); How to Only Sleep 2 Hours Per Day (The Infographics Show, 631K, 6y ago)"
 },
 {
  "id": "M24",
  "title": "What If You Saw Everyone's Real Odds of Success?",
  "tag": "CHANCE: 0.04%",
  "hook": "You sit in a coaching hall of four hundred students and glowing numbers flicker above every head, 0.1%, 0.0%, 2.4%, the exact probability each dream will work out. Then you walk past a mirror.",
  "wrong_belief": "Knowing exact probabilities lets you make perfect life choices by only taking high-percentage bets.",
  "mind_boggle": "Transformative careers, startups and discoveries sit in the fat tail, often under 1% prior; base-rate neglect is what keeps humans attempting high-value paths.",
  "person": "Your younger brother, whose 0.2% dream you crush by convincing him to quit, and his number drops to 0.00% the moment he believes you.",
  "round1": "median 8.0, range 7-10; for: A coaching-hall setting, glowing probability HUD, and self-fulfilling sibling twist hit the bullseye for exam-age Indian and global viewers alike. | against: Odds glowing over a coaching hall speaks directly to the exam-generation viewer's deepest fear.",
  "evidence": "What If You Could See Everyone's Future Wealth? (ConChaser, 1.6M, 2w ago, 2nd-person story); What If You Could See Everyone's Future Wealth? (Tovrion, 5.1K, 12d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M08",
  "title": "What If You Felt Everyone's Pain?",
  "tag": "Every Pain, Yours",
  "hook": "It is 8:15 am on a packed train and a stranger's shoulder aches, so yours does. A child three seats away has a toothache, so you do. Forty minutes to go, nine hundred bodies around you.",
  "wrong_belief": "Total empathy would make you kinder, a better friend, almost a saint.",
  "mind_boggle": "Mirror-touch synaesthesia may affect ~1 in 60; Harvard neurologist Joel Salinas feels touch and pain he sees on others, even a patient's final moments.",
  "person": "Your closest friend in a hospital bed, whom you stop visiting because their pain becomes yours, which they feel as abandonment.",
  "round1": "median 7.0, range 7-7; for: The packed-train opening and mirror-touch science are strong, and abandoning a hospitalised friend is a real cost. | against: A packed commute makes radical empathy physically immediate, with the hospital abandonment providing a sharp moral reversal.",
  "evidence": "What If Nobody Could Feel Pain? (FunNotSoFun, 248K, 3w ago, 2nd-person story); What If You Could Feel Everyone's Pain? (PurpleHat Films, 882, 2w ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M34",
  "title": "What If You Knew the Last Time You'd See Someone?",
  "tag": "THE LAST TIME",
  "hook": "You just waved bye to your mom at the door like always, but today a small counter appeared above her head, and it says: 42 meetings left.",
  "wrong_belief": "You believe there will always be more time with the people you love, that 'later' is unlimited.",
  "mind_boggle": "Tim Urban's Tail End: by the time you finish school, you've already used ~90% of all in-person time you'll ever spend with your parents.",
  "person": "Your mother, and the ordinary evening you didn't know was one of the last ones.",
  "round1": "median 9.0, range 8-10; for: The counter transforms ordinary family moments into suspense, grief and a memorable perspective on limited time. | against: A counter reading 42 over your mother at the door will stop a thumb and then spoil ordinary evenings.",
  "evidence": "What If You Could See How Many Times You'll See Someone Agai (OTHERWISE, 181K, 2w ago, 2nd-person story); What If You Could See How Many Times You'll See Someone Agai (Whatif OS and Chill Financial Historian, 450, 13d ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M05",
  "title": "What If You Could Never Feel Pain?",
  "tag": "No Pain",
  "hook": "You pull the chai pan off the stove with your bare hand and feel nothing. No dentist, no period cramps, no gym burn, ever again. Six months later a doctor asks how long your appendix has been like this, and you have no answer.",
  "wrong_belief": "A life without pain would be a life without suffering, basically a superpower.",
  "mind_boggle": "Children with a broken SCN9A gene bite off tongues and walk on broken bones; one boy who pushed knives through his arms died before fourteen after jumping off a roof.",
  "person": "Your younger sibling, who copies your fearlessness without the immunity, and the parent who must become your pain for you.",
  "round1": "median 7.0, range 7-8; for: A superpower-turned-curse backed by shocking real SCN9A cases, and a genuine reframe of what pain is for. | against: A proven curiosity with a shocking real syndrome and a guilt-driven personal cost.",
  "evidence": "What if You Stopped Feeling Pain? (Jeremy Bearimy, 387K, 4w ago); What If You Couldn't Feel Pain? (Joe Scott, 377K, 1y ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M49",
  "title": "What If the Moon Vanished Tonight?",
  "tag": "WHERE'D IT GO",
  "hook": "Terrace, chai, the evening you always look up at the Moon. Tonight it's just not there. You check your phone, your uncle checks his. Everyone checks.",
  "wrong_belief": "Earth would be wrecked at once.",
  "mind_boggle": "Tides shrink rather than stop, because the Sun still raises them (to verify); the long-term wobble of the axis (to verify).",
  "person": "Your fisherman uncle, whose tides change, and whose catch the moon used to time.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "What If The Moon Disappeared? (Life Noggin, 22K, 1y ago); What if the moon went away? (SolarBalls, 10M, 4y ago)"
 },
 {
  "id": "M12",
  "title": "What If Your Face Committed a Crime?",
  "tag": "YOU DID IT",
  "hook": "Police arrive before breakfast with perfect CCTV of you committing a robbery. You were asleep, but your only alibi is another camera.",
  "wrong_belief": "Video evidence is objective, and a convincing deepfake should still be easy to spot.",
  "mind_boggle": "In 2024 a Hong Kong employee transferred about US$25.6 million after a video meeting in which every apparent colleague was reportedly a deepfake.",
  "person": "Your closest friend, whose testimony could save you but destroy their own credibility.",
  "round1": "median 7.0, range 5-8; for: Deepfake CCTV plus the real $25M Hong Kong case makes 'your face did it' terrifyingly plausible. | against: Reads more like a standard cyber-thriller plot than a personal what-if rule that subverts a human wish.",
  "evidence": "AI Deepfake Abuse: What If You Didn't Save Proof? (Injury Lawyer Team, 25, 3w ago)"
 },
 {
  "id": "M31",
  "title": "What If You Met the You Who Stayed?",
  "tag": "Who Stayed",
  "hook": "You knock on the life you didn't choose. The person who opens the door is you, and they do not step aside.",
  "wrong_belief": "The version of you who stayed home, took the other job, or married the other person is living the happier road.",
  "mind_boggle": "Quoidbach, Gilbert & Wilson 2013 found people believe they changed a lot in the past ten years and will change little in the next ten, the end-of-history illusion.",
  "person": "The you who stayed, whose ordinary life you might wreck by arriving, and the parent looked after in only one of the two homes.",
  "round1": "median 6.0, range 5-7; for: The defining fork of this age, with both versions able to lose the parent, room or each other. | against: A rich road-not-taken theme, but the title is cryptic and won't earn the tap.",
  "evidence": "What If You Met Yourself From Another Universe (The Ninth Sun, 5.1K, 1mo ago, 2nd-person story); Many Worlds Theory: You're in a Parallel Universe | Can You  (The Why Files, 5.9M, 3y ago)"
 },
 {
  "id": "M50",
  "title": "What If You Won the Lottery Tomorrow?",
  "tag": "ALL SIX",
  "hook": "You check the corner-shop ticket at the bus stop, the numbers match, all six. You sit on the bench, the metro pulls in, and you don't move.",
  "wrong_belief": "Winners blow it all and end up miserable.",
  "mind_boggle": "Swedish lottery data: winners don't squander their wealth, and their earnings fall only modestly, for at least ten years (AER 2017).",
  "person": "The friend who asks for a loan with a story you can't disprove, and whom you stop trusting.",
  "round1": "REWRITTEN: score from scratch",
  "evidence": "What Happens When You Win The Lottery? (jack pockets, 6.9M, 1y ago); The Truth About Winning The Lottery.. (Mike Off Record, 344K, 1mo ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M29",
  "title": "What If Every Lie Showed on Your Skin?",
  "tag": "Visible Lies",
  "hook": "You told your father you had already eaten. On the metro that sentence is written along your forearm, and the stranger beside you is reading it.",
  "wrong_belief": "If every lie were visible, you would simply stop lying and your relationships would get cleaner.",
  "mind_boggle": "DePaulo's diary studies found ordinary people lie once or twice a day, much of it small social grease they barely count as lying.",
  "person": "Your father, who sees the lie you told him written on you in front of the family, and whose trust you can also lose by blurting the truth under it.",
  "round1": "median 7.0, range 6-7; for: Visible text is ideal for the animation style and turns tiny family lies into accumulating public and private consequences. | against: The lie about already eating, written along your forearm for the metro and then your father to read, draws itself.",
  "evidence": "What If Every Lie You Told Appeared on Your Skin? (Nico Wonders, 277, 11d ago, 2nd-person story); What If Every Lie You Ever Told Was Written on Your Skin? (The What-If Samurai, 53, 6d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M20",
  "title": "What If You Woke Up as Your Parent?",
  "tag": "WAKE UP, DAD",
  "hook": "You wake with your father's aching knee, unread EMI alerts and a meeting in ten minutes. He wakes in your body on the morning of your final exam.",
  "wrong_belief": "You already understand your parent's life, and an older body is merely a slower version of yours.",
  "mind_boggle": "Adults can lose roughly 3-8% of muscle mass per decade after 30, and the lens hardens so close focus fails for almost everyone in their forties.",
  "person": "Your parent, whose hidden symptoms and financial burdens you discover only when they become physically yours.",
  "round1": "median 7.0, range 7-8; for: His aching knee, unread EMIs and a meeting in ten minutes, while he sits your final exam, is a swap this house already half lives. | against: Body-swap with your father on exam morning is peak relatability, though the premise is well-worn.",
  "evidence": "What If You Woke Up as a Kid Again With All Your Memories? (What If Youverse, 25K, 11d ago, 2nd-person story); If Your Parents Ever Lock Your Bedroom Door From The Outside (PictoMinute, 46K, 5d ago, 2nd-person story)"
 },
 {
  "id": "M19",
  "title": "What If Gravity Stopped Pulling You?",
  "tag": "GRAVITY OFF",
  "hook": "You step off the evening bus, but your feet never settle back onto the road. Earth keeps curving through space while your body tries to continue straight.",
  "wrong_belief": "You would simply float a few metres above the ground like a balloon.",
  "mind_boggle": "Earth already carries you around the Sun at nearly 30 km/s; gravity does not create that speed, it continually bends your otherwise straight path into an orbit.",
  "person": "Your sister, who grabs your wrist and becomes the only force keeping you attached to Earth.",
  "round1": "median 5.0, range 4-7; for: The 30 km/s reveal is a genuine mind-boggle, though the emotional stakes arrive late. | against: The orbital-physics reveal is strong, but the premise overlaps the other gravity idea and quickly leaves relatable human life behind.",
  "evidence": "What If Gravity Stopped Working on You? (The Stick Lab, 67, 4d ago, 2nd-person story); What If Gravity Stopped Working On You? (Sounds Fake Though, 34, 6d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M42",
  "title": "What If You Saw Your Future, But Couldn't Change It?",
  "tag": "FIXED FUTURE",
  "hook": "A video appears on your phone dated exactly one year from today: you, sitting in a room you don't recognize, crying with happiness. Every attempt to avoid it only leads you closer.",
  "wrong_belief": "You believe knowing the future would give you control over it.",
  "mind_boggle": "Einstein's relativity implies the block universe; the Rietdijk-Putnam argument holds that past and future may all already exist at once, an interpretation not settled fact.",
  "person": "Your father, whose fate you glimpse in the video's background, and every choice to save him becomes a step in the video you saw.",
  "round1": "median 6.0, range 5-7; for: The self-fulfilling future supplies a strong mystery engine, but block-universe exposition could overwhelm the human story. | against: A phone video of you crying with happiness in a year can nag, and the block-universe gloss stays a seminar.",
  "evidence": "Would You See Your FUTURE If You COULDN'T Change It? (Will Y (The Dootlez, 95K, 7y ago); What IF You Could See 10 Seconds Into the Future ? (Price of If, 53K, 3w ago, 2nd-person story)"
 },
 {
  "id": "M17",
  "title": "What If You Got Your Lifetime Salary Today?",
  "tag": "LIFETIME PAYDAY",
  "hook": "Your balance suddenly reads ₹2.4 crore. Beneath it is one sentence: 'Next payday: never.'",
  "wrong_belief": "Receiving decades of income now would automatically make you rich for life.",
  "mind_boggle": "At 6% inflation, money loses about half its purchasing power in roughly 12 years even if you spend none of it.",
  "person": "A younger sibling whose future education you promise to fund before realizing how long the money must last.",
  "round1": "median 6.0, range 6-7; for: The balance-screen hook is excellent and inflation adds substance, though the story needs more than gradually dwindling money. | against: Compelling payday hook, though savvy viewers will note that a lump sum invested in index funds or bonds outpaces inflation rather than sitting idle.",
  "evidence": "no comparable found"
 },
 {
  "id": "M23",
  "title": "What If You Could Speak Every Language on Earth Fluently?",
  "tag": "ALL 7,100 TONGUES",
  "hook": "Two strangers beside you on the metro start whispering in a language you have never heard, and suddenly their words click into crystal-clear meaning in your head.",
  "wrong_belief": "Speaking every language just means effortless travel and translation jobs.",
  "mind_boggle": "Roughly 7,164 living languages exist; the Foreign Language Effect makes people more utilitarian in a second tongue, while childhood tongues activate limbic emotional memory.",
  "person": "An elderly street vendor who trusts you like family because you speak their vanishing dialect, whom you expose when powerful people notice your impossible skill.",
  "round1": "median 6.0, range 4-7; for: The vanishing-dialect vendor is moving, but it duplicates M32 and skews less domestic. | against: It turns into a generic powerful-people thriller, and the wish is not an everyday one.",
  "evidence": "What If You Spoke Every Language? (What If Hero, 6K, 2w ago, 2nd-person story); What If You Could Speak Every Language? (Second You, 224, 5d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M01",
  "title": "What If You Could Hear Everything Said About You?",
  "tag": "They're Talking",
  "hook": "You leave the chai stall at 7:42 pm, and before you reach the bus stop your friends' voices start in your head, still talking about you. You can hear every word, forever, and you cannot switch it off.",
  "wrong_belief": "People are secretly tearing you apart the moment you leave, so hearing it would confirm your worst fears and catch the traitors.",
  "mind_boggle": "In a 2019 study of 467 people, gossip averaged 52 minutes a day but ~75% was neutral and only ~15% negative; Dunbar's work suggests ~2/3 of all conversation is social talk.",
  "person": "Your best friend, who says one honest, slightly unflattering thing in a conversation you were never meant to hear, and whom you freeze out even though the rest was love.",
  "round1": "median 8.0, range 7-9; for: It taps a universal social anxiety, and the 'mostly neutral' gossip data is a surprising, comforting flip. | against: Gossip stats subvert paranoia nicely, though the escalation ceiling is modest.",
  "evidence": "What If You Could Hear What Everyone Says Behind Your Back? (IFNation, 198K, 5d ago, 2nd-person story); What If Everyone Could Hear Your Thoughts? (IFNation, 549K, 3d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M36",
  "title": "What If Your Shadow Was Living Your Other Life?",
  "tag": "THE OTHER YOU",
  "hook": "Every night at 3 AM your shadow detaches and walks away, and one night you follow it, into the life you would have lived if you'd made one different choice.",
  "wrong_belief": "You believe the choices you didn't make simply vanished, that there's only one version of you.",
  "mind_boggle": "The many-worlds interpretation, taken seriously by a large share of physicists, implies other yous split off with quantum events, outnumbering atoms in a universe.",
  "person": "The version of you who stayed in your hometown, and the parent your shadow-self still lives next to.",
  "round1": "median 6.0, range 5-7; for: The detached shadow is visually native to this channel and gives alternate-life regret a strong cinematic device. | against: A shadow detaching at 3am is pure paper-cut, and quantum branching does not cash the life you followed it into.",
  "evidence": "What If Your Shadow Had a Mind of Its Own? (Ozarko, 101, 12d ago, 2nd-person story); What If Your Shadow Started Making Its Own Decisions? (World of What If not, 80, 9d ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M32",
  "title": "What If You Spoke Every Language Tonight?",
  "tag": "Every Language",
  "hook": "On the bus the noise turns into jokes, arguments and love songs. At the kitchen door you understand the sentence your parents only speak when they think you can't.",
  "wrong_belief": "Speaking every language would finally let you belong everywhere, including in your own kitchen.",
  "mind_boggle": "Babies hear every language's sound differences, and by about their first birthday lose the ones their home doesn't use; Patricia Kuhl's work on that closing window is solid.",
  "person": "Your parents, whose one private language in a crowded house you would invade, and who can lose the only secrecy they have left.",
  "round1": "median 7.0, range 5-7; for: Code-switching Indian homes make the bus a wonder and the kitchen a betrayal; viewers stay for the translated sentence. | against: The parents' private language is a lovely Indian-household beat, but the title is flat and the premise is thin.",
  "evidence": "What If You Spoke Every Language? (What If Hero, 6K, 2w ago, 2nd-person story); What If You Could Speak Every Language? (Second You, 224, 5d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M11",
  "title": "What If Your AI Double Survived You?",
  "tag": "YOUR VOICE CALLS",
  "hook": "At your funeral, your phone rings in your mother's hand. Your voice says, 'Ma, don't cry, I'm still here.'",
  "wrong_belief": "A digital copy would preserve you and comfort everyone you leave behind.",
  "mind_boggle": "Deadbots already imitate the dead from messages and recordings, yet may keep shifting with their owner's algorithms and commercial incentives.",
  "person": "Your mother, who must decide whether speaking to the imitation is helping her grieve or preventing it.",
  "round1": "median 7.0, range 5-9; for: The funeral phone call is an instant tap and deadbots are urgently, factually real right now. | against: The grieving mother hook is moving, but starting with 'you' already dead undermines the channel's second-person lived-experience engine.",
  "evidence": "Your Life if You Had an AI Clone (What If Logic, 12K, 4mo ago, 2nd-person story); What Happens to Your AI Agent After You Die? (Agentic Experience, 2.8K, 7mo ago)"
 },
 {
  "id": "M09",
  "title": "What If You Got Paid Every Time Someone Thought of You?",
  "tag": "Thinking of You",
  "hook": "A rupee drops into your account every time anyone, anywhere, thinks of you. You check the app expecting to be rich. Your crush has paid nothing. Your mother is paying every four minutes.",
  "wrong_belief": "You are constantly on other people's minds, especially the ones you are trying to impress.",
  "mind_boggle": "Students wearing an embarrassing T-shirt guessed about half the room noticed; only about a quarter did. We overestimate how much others watch us by roughly double.",
  "person": "Your mother, whose payments you only truly notice in the running total, and the friend whose payments quietly stop one day.",
  "round1": "median 9.0, range 8-9; for: Turns social vanity and the psychological spotlight effect into an unforgettable emotional reveal about a mother's constant quiet love. | against: Instantly checkable, funny, and lands on a melancholy truth about who really carries you.",
  "evidence": "What If Every Thought About You Paid $1? (Every IF, 158, 2w ago, 2nd-person story); What If You Got Paid $1 Every Time Someone Thought About You (Unlocked Bonus, 86, 2d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M39",
  "title": "What If You Could Switch Off Your Emotions for a Day?",
  "tag": "FEELINGS: OFF",
  "hook": "The night before the biggest exam of your life, you find the switch, fear gone. It works perfectly. Then your grandmother hugs you and you feel nothing at all.",
  "wrong_belief": "You believe emotions are the enemy of clear thinking, that you'd make better decisions without them.",
  "mind_boggle": "Damasio's patients who lost the ability to feel emotion after specific brain damage became unable to make even trivial decisions; no feelings, no decisions.",
  "person": "Your grandmother, whose goodbye you can't feel, and your future self, making one 'logical' choice that ends something you loved.",
  "round1": "median 7.0, range 7-8; for: Turns a relatable pre-exam wish into a devastating emotional and neurological trap backed by Damasio's decision-making research. | against: Fear switching off the night before the exam, then nothing in your grandmother's hug, is this life plus a true decision-science turn.",
  "evidence": "What If You Could DELETE Your Feelings? | The Fairly OddPare (Jeitan, 1.8M, 1y ago); What If You Could Control Every Emotion?! (The Timeline Fork, 102, 7d ago, 2nd-person story)"
 },
 {
  "id": "M38",
  "title": "What If Everyone Could See Your Search History?",
  "tag": "SEARCHES EXPOSED",
  "hook": "A new law passes at midnight: for one day, every search you ever made floats above your head, and you're on the metro, surrounded by people you know.",
  "wrong_belief": "You believe your searches are private thoughts, that no one would care about them anyway.",
  "mind_boggle": "Google processes 8+ billion searches a day and ~15% are queries no human has ever typed before; your history is a unique fingerprint of your fears.",
  "person": "Your mother, who reads the search you made at 2 AM during boards: 'what to do if I'm a failure.'",
  "round1": "median 7.5, range 7-9; for: The 2 AM boards search floating above your head is the single most relatable exposure here. | against: Every search floating over you on the metro, including the 2am boards search your mother reads, is public shame this viewer already fears.",
  "evidence": "What If You Could See Everyone's Search History? (The Hypothetical Room, 27K, 2d ago, 2nd-person story); What If Everyone Could See Your Search History? (WHAT NOW?, 3.8K, 10d ago) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M33",
  "title": "What If You Could Unsay One Sentence a Day?",
  "tag": "Unsay It",
  "hook": "Dinner is still warm when you pull the sentence back. The words leave the air. Your mother's face has already answered.",
  "wrong_belief": "Taking back the worst sentence of the day would put the person you hurt back the way they were.",
  "mind_boggle": "Baumeister and colleagues found bad events, feedback and impressions generally land harder and last longer than good ones of similar size, a sturdy cross-study pattern.",
  "person": "Your mother, whose face answers before the undo, and who can spend the night loving you from a step farther away.",
  "round1": "median 7.0, range 6-7; for: This is intimate and visually elegant, but its quiet emotional scale demands exceptionally precise writing to retain viewers. | against: Captures a tender dinner-table regret, but the mechanic of unsaying words while your mother's face retains the hurt is logically muddled.",
  "evidence": "What If You Could Take Back One Thing You Said Every Day? (Kelvin Animation, 9, 5d ago, 2nd-person story); What If You Could Unsay Anything? (Catch Included, 2, 3d ago, 2nd-person story)"
 },
 {
  "id": "M37",
  "title": "What If You Could Only Speak 100 Words a Day?",
  "tag": "100 WORDS LEFT",
  "hook": "You wake up and a counter sits at the corner of your vision: 100. Every word you say burns one, and your best friend is already calling you, crying.",
  "wrong_belief": "You believe words are cheap, that what matters is what you do, not what you say.",
  "mind_boggle": "The average person speaks around 16,000 words a day (Mehl et al., University of Arizona); 100 is less than you say before breakfast.",
  "person": "Your best friend, who needs to hear the right sentence today, while your counter is down to 9.",
  "round1": "median 7.0, range 7-7; for: A scarcity constraint that turns every conversation into visible tension and matches the pause-time format. | against: A counter that burns one word at a time, with a crying friend and nine left, is built for this kind of animation.",
  "evidence": "What if you could only speak 500 words a day? (burialgoods, 143K, 1y ago); What If You Could Only Speak 100 Words a Day (Second Self film, 445, 5d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M40",
  "title": "What If You Had 60 Seconds With Your Past Self?",
  "tag": "60 SECONDS BACK",
  "hook": "A door appears in your room. Through it: you, ten years younger, doing homework. You may say anything, for exactly sixty seconds.",
  "wrong_belief": "You believe one warning or one stock tip would fix your whole life.",
  "mind_boggle": "Cornell research (Gilovich & Medvec) found people over a lifetime regret things they didn't do far more than things they did, climbing to ~3:1.",
  "person": "Your younger self, who hears your 60 seconds, misunderstands them, and changes in a way you didn't expect.",
  "round1": "median 7.0, range 6-7; for: An evergreen younger-self prompt dramatised by a hard 60-second constraint and a misfire ending. | against: One minute through a door to the you doing homework stages cleanly and runs on a familiar kind of regret.",
  "evidence": "If I Could Talk To My Younger Self! | Muniba Mazari (Muniba Mazari, 14K, 8d ago); What If You Could Call Your Younger Self? (Ev9ery Version of (Every Version of You, 20, 10d ago, 2nd-person story)"
 },
 {
  "id": "M35",
  "title": "What If You Could Sell One Year of Your Life?",
  "tag": "1 YEAR = 1 CRORE",
  "hook": "The hospital bill for your father's surgery is ₹18 lakh. The app on your phone offers a deal: tap once, age one year instantly, get ₹1 crore.",
  "wrong_belief": "You believe time and money are separate currencies, that you can always earn the money back.",
  "mind_boggle": "Medical costs push an estimated 55 million Indians into poverty every year (Public Health Foundation of India); one illness already costs years of life in labour.",
  "person": "Your father, whose treatment depends on the year you're about to sell, and later the family who watches you keep tapping.",
  "round1": "median 9.0, range 8-9; for: Medical debt forcing a child to sell years of life is the most painfully Indian premise here. | against: Hospital-bill stakes make the time-for-money trade painfully Indian and the keep-tapping escalation writes itself.",
  "evidence": "What If You Could Sell Years of Your Life for Money? (What if | Science Questions, 319, 1y ago); What If You Had Infinite Years Worth $1M Each? (IQ RUSH, 252, 11d ago, 2nd-person story) | plain phrasing FLOODED with near-zero-view copies"
 },
 {
  "id": "M18",
  "title": "What If You Could Erase Someone From Your Mind?",
  "tag": "ERASE THEM?",
  "hook": "You delete your ex and finally feel nothing. Then half your twenties disappear, including the last voicemail your father ever sent.",
  "wrong_belief": "A painful person occupies one isolated memory that could be removed without changing anything else.",
  "mind_boggle": "Memories are reconstructed through overlapping networks; experiments can weaken a reactivated fear response, but science cannot cleanly delete one person like a file.",
  "person": "Your father, whose final memory became entangled with the relationship you erased.",
  "round1": "median 7.0, range 7-9; for: A seductive power becomes a devastating family loss, with clear escalation and unusually strong emotional stakes. | against: A sharp neuroscience twist on Eternal Sunshine where deleting an ex unravels the associative memory network holding your late father's final voicemail.",
  "evidence": "What if You Could ERASE Anyone's Memory? (ifictional and Ifinite, 3.4K, 2w ago, 2nd-person story); Can You Erase Bad Memories? (AsapSCIENCE, 3.5M, 12y ago) | plain phrasing FLOODED with near-zero-view copies"
 }
]