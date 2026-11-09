# Say Suppose channel themes: music rights (2026-11-09)

The `rules/sound.md` #11 check for the two channel themes (`README.md`, "Music"). A read-only check of public pages,
snapshotted as text in `rights/snapshots/`. It is not legal advice. Nothing was sent to Higgsfield or ElevenLabs, and
nothing was signed in to.

## In short

| Use | Verdict | Why |
|---|---|---|
| U1 The themes as audio in every video (ident, end card), monetised | **Yes** | Higgsfield §4.4 does not restrict commercial use of Outputs; Max includes commercial use; every Eleven Music tier allows online commercial use |
| U2 The themes as `reference_audio` for ACE-Step 1.5 | **Unclear** | Higgsfield §5.2(iv) bars using Outputs to "otherwise transfer knowledge to any machine-learning model"; ElevenLabs' policy §12 (reaching the owner through Higgsfield §8) bars using Output to "improve any AI model". Neither says whether inference-time conditioning counts |
| U3 Shorts and the Hindi dub track | **Yes** | Same basis as U1 |
| U4 Content ID claims | **Unclear** | Both are silent; Higgsfield §4.4 says another user may get a similar or identical Output |
| U5 Ownership; rights after cancelling the plan | **Yes** (survival), with caveats | Higgsfield §4.4: rights in exported Outputs survive cancellation. The Output is not exclusive, and copyright in AI-made music is a question of law |
| U6 Attribution | **No** requirement | Only ElevenLabs' Free tier needs it; Higgsfield's help says no credit is needed |
| U6 AI disclosure | **Yes, where law or the platform requires it** | Higgsfield §5.5, §5.2(xi); never present the music as human-made or strip provenance marks |

**Already affected: the pause-time video** (public today, 9 Nov 2026 at 18:30 IST, scheduled by the owner). Its
score plays `theme-light` directly (U1, yes) and its five cues were made by ACE-Step with the themes as
`reference_audio` (`videos/2026-11-06_pause-time-for-10-seconds-a-day/make_music.py`, `build_score.py`): U2, unclear.

**What the owner must decide** (sound.md #11: cleared before the next public video uses them, or replaced):

1. **U2, the ACE-Step reference.** Either (a) ask Higgsfield in writing (question 2 below) and keep the route until
   then at the owner's risk; (b) stop using the Eleven themes as model input: condition ACE-Step on owner-made
   material instead (a hand-played sketch of the four-note motif; Higgsfield §5.2(iv)(a) allows models fed your own
   Inputs, "not Outputs"), or make cues without a reference; or (c) keep the themes as finished audio only (U1).
2. **The pause-time video.** Leave it as scheduled (the direct theme use is cleared; the cues are the unclear part),
   or re-score its cues by route (b) before or after release.
3. **Whether to send the support questions** below (to Higgsfield first). Only the owner contacts anyone.
4. **Content ID (U4).** Keep the generation records (job ids, prompts, dates; `README.md`) for any dispute, and do not
   register the themes in Content ID without asking Higgsfield first.

**Route checked:** two 60 s instrumental themes made on 2026-11-07 with ElevenLabs Music v2.5 inside **Higgsfield**,
on the owner's paid Higgsfield **Max** plan (34.88 credits for 4 generations, made through the Higgsfield CLI). The owner
has no ElevenLabs account or plan for these.

**Terms in force when the themes were made:** Higgsfield Terms of Use, last updated 23 Oct 2026. ElevenLabs Terms, Music
Terms and Prohibited Use Policy, all last updated 09 Oct 2026. All of these predate 2026-11-07, so the snapshots are the
versions that applied.

Snapshot folder: `channels/say-suppose/brand/rights/snapshots/` (prefix `2026-11-09_` below is shortened to `…`)

## How the two sets of terms fit together

- **The owner's contract is with Higgsfield only.** Higgsfield's §8 brings in only the provider's *acceptable-use or
  prohibited-use policies*. It does not bring in the provider's licence or music terms. The clause: "When you use a
  feature or model powered by a third party, you agree to comply with that provider's applicable acceptable-use or
  prohibited-use policies … the more restrictive terms govern". (`…higgsfield-terms-of-use.txt`, §8, last paragraph)
- **The ElevenLabs Prohibited Use Policy says it reaches resold use:** "This Policy applies to everyone who accesses or
  uses any ElevenLabs Service … whether directly, through an authorized reseller, or through a product or application
  built with our technology." (`…elevenlabs-prohibited-use-policy.txt`, preamble)
- **The ElevenLabs Music Terms bind ElevenLabs's customer, which here is Higgsfield.** They cover the Music Service
  "whether you use it on its own or as a component of another ElevenLabs Service" (preamble). §4.3 bars Model Resale
  without written authorisation, and §4.6 requires an Authorized Reseller to co-brand. So Higgsfield is presumably an
  Authorized Reseller, or has an Enterprise deal. Neither is public.
- **The policy also caps what a reseller can pass on.** §12 bars "Making our Services or Output available to your own
  end users … on terms more permissive than those that apply to you". In practice, whatever Music tier or agreement
  Higgsfield holds with ElevenLabs is the ceiling on the owner's rights, and that tier is not public.
  (`…elevenlabs-prohibited-use-policy.txt`, §12)
- **What that ceiling looks like.** Under Exhibit A of the Music Terms, every self-serve tier and Enterprise Music Lite
  allows "All online and offline commercial use permitted, except film, TV, radio, and Studio Games". Only Enterprise
  Music allows all uses. Attribution is required on Free only, and Free has no API access, so a reseller cannot be on
  it. Streaming distribution is prohibited on Free and Starter. (`…elevenlabs-music-terms.txt`, Exhibit A)
- **The ElevenLabs Terms §17 ("Purchase Through Reseller") applies only "If you subscribe to Services from an authorized
  ElevenLabs reseller".** The owner subscribed to Higgsfield's own service, so it is unclear whether §17 applies.
  (`…elevenlabs-terms-of-service.txt`, §17)

## Verdicts

### U1: themes in every video (ident and end card), on a monetised channel: **YES**

- Higgsfield §4.4: "Company does not claim ownership of any of your Inputs or Outputs, nor does it restrict your
  commercial use of Outputs." (`…higgsfield-terms-of-use.txt`)
- Higgsfield's pricing page lists "Commercial use: Included" for Basic, Pro and **Max**. (`…higgsfield-pricing.txt`,
  browser excerpt)
- Higgsfield's help article lists "YouTube monetization" as commercial use and answers "Is commercial use of outputs
  restricted to paid plans? No." (`…higgsfield-help-who-owns-generations.txt`; a help article, not the contract)
- Upstream ceiling: ElevenLabs Music Terms Exhibit A, "Media Rights", allows all online commercial use on every tier.
  YouTube is online media. Media Rights include "the right to synchronize Output in timed relation to audiovisual
  content" (§4.8(d)). (`…elevenlabs-music-terms.txt`)
- Residual caveats:
  1. Higgsfield's upstream agreement with ElevenLabs is not public.
  2. The "film, TV, radio" exclusion would matter if a video were ever licensed to a broadcaster or a film. Ordinary
     YouTube is online.

### U2: themes as `reference_audio` for ACE-Step 1.5 (inference-time conditioning, no training): **UNCLEAR**, the main risk

- **Higgsfield §5.2(iv)** bars using "the Service, any Outputs, or any data derived therefrom to train, fine-tune,
  distill, or otherwise transfer knowledge to any machine-learning model … whether or not such system competes".
  (`…higgsfield-terms-of-use.txt`)
- **Higgsfield §5.1(iii)** bars using "the Service or any Outputs to develop, modify, fine-tune, distill, or improve any
  products or services that compete with the Service, including any artificial intelligence or machine-learning
  algorithms or models". ACE-Step is a music-generation model, and Higgsfield sells music generation.
- **ElevenLabs Prohibited Use Policy §12**, which reaches the owner through Higgsfield §8, bars "Using our Services or
  Output to develop, train, fine-tune, or improve any AI model or service, or including Output in a dataset used for any
  of those purposes". (`…elevenlabs-prohibited-use-policy.txt`)
- **Higgsfield's help article** summarises it more broadly still: "You may not use the Service or outputs to train,
  fine-tune, or improve any AI or machine-learning model". (`…higgsfield-help-who-owns-generations.txt`)
- **Why it is unclear rather than a plain no:** conditioning at inference changes no weights, builds no dataset and
  improves no model, so it is arguably not "train / fine-tune / improve". But "otherwise transfer knowledge to any
  machine-learning model" (Higgsfield) has no definition and is broad. A reader could take feeding the theme to steer a
  local model's style as transferring knowledge, or as distillation in substance. No clause says reference or
  conditioning input is allowed.
- **Safer alternatives** (the owner's call):
  - Ask Higgsfield in writing.
  - Or condition ACE-Step on owner-made material instead of the Eleven output, for example a MIDI or piano sketch of the
    four-note motif played by hand. Higgsfield §5.2(iv)(a) carves out models trained "with your own Inputs (not Outputs
    of Company's AI models)".
  - Or use the themes only as finished audio (U1), not as model input.

### U3: Shorts, and a Hindi dub audio track of the same videos: **YES**, same basis as U1

- Both are online audiovisual uses, covered by Higgsfield §4.4 (no restriction on commercial use) and by the ElevenLabs
  Exhibit A Media Rights (online commercial use, sync allowed).
- No clause limits language versions or formats.
- Not covered: if a Short or dub were cut into a *new* derived track by ACE-Step, that is U2, not U3.

### U4: Content ID claim risk: **UNCLEAR**, the terms are silent

- No snapshot mentions Content ID, YouTube's rights-management tools, PROs or collecting societies, or registering
  Output. Searched all snapshots for "Content ID", "YouTube", "register", "collecting" and "PRO".
- There is a real non-uniqueness risk. Higgsfield §4.4: "Outputs generated by the Service may not be unique across
  users. Other users may receive an Output that is similar or possibly identical to yours. Company does not guarantee
  the uniqueness, originality, or exclusivity of any Output." So a third party could get a similar track and register it
  in Content ID. Nothing in the terms protects against that. Higgsfield §13.2 also disclaims all Output liability and
  makes the user responsible for "any necessary rights clearances". (`…higgsfield-terms-of-use.txt`)
- Streaming distribution is a separate question. The ElevenLabs Music Terms §4.4 and Exhibit A allow "Music Streaming
  Distribution" on Creator and higher tiers only, and §4.2 bars building a "Music Library". The owner is not
  distributing the themes to streaming services, so this matters only if someone later wants to release them as tracks.
  Whether Higgsfield users get streaming rights depends on Higgsfield's upstream tier, which is unknown.
- Watermarks: ElevenLabs' help centre says "No other platforms can currently detect ElevenLabs watermarks" and that
  watermarking "is not connected to other platforms' monetization or content policies".
  (`…elevenlabs-help-watermark-youtube.txt`; help article)
- Practical note, not from the terms: keep the generation records (Higgsfield job ids `e7d9677a…` and `df65322c…`, the
  prompts and the dates) as evidence for any dispute. Do not register the themes in Content ID yourself without asking
  first, since rights to do so are not addressed.

### U5: who owns the output, and do rights survive cancelling the Higgsfield plan: **YES** for survival; ownership is yes, with caveats

- Survival. Higgsfield §4.4: "Your rights in Outputs you have generated and exported survive cancellation of your
  subscription or deletion or termination of your Account, and you may transfer or sublicense your rights in Outputs".
  The themes are exported (`brand/music/theme-*.mp3`). (`…higgsfield-terms-of-use.txt`)
- Cancellation itself. §10.4: cancellation "does not delete your Account or Your Content". §16.4 says ownership
  provisions survive termination.
- Ownership. Higgsfield "does not claim ownership" (§4.2, §4.4). ElevenLabs Terms §4(c)(ii): "as between you and
  ElevenLabs, you retain all rights in and to your Output". The Music Terms §2.2 say the same, and §1.5 says Output
  "remains subject to the plan in effect when that Output was created" after a downgrade or termination. That clause
  binds ElevenLabs's customer, but it supports survival.
- Caveats:
  1. "Does not claim ownership" is not a guarantee that copyright exists. Whether purely AI-generated music is
     protected by copyright is a question of law the terms cannot settle.
  2. The output is not exclusive (§4.4).
  3. Higgsfield keeps a licence to use Inputs and Outputs to train its models (§4.4), until the content or account is
     deleted.
  4. §6.6 lets Higgsfield require you to stop using an Output it says in good faith violates a third party's rights.

### U6: attribution or AI disclosure

**Attribution: NO requirement found.**

- Higgsfield's help article: "Do I need to credit Higgsfield when I publish? No. The Terms of Use do not require
  attribution for outputs." (`…higgsfield-help-who-owns-generations.txt`)
- Higgsfield §11.8 (Developer Terms) applies to a "Developer Application", not to videos. It applies because the CLI
  counts as Developer Access (§11.1).
- ElevenLabs Exhibit A requires attribution only on Free ("Required (denote Eleven Music when distributing)"), and Free
  has no API access. ElevenLabs' help centre: "Attribution requirement is subject to the agreement you have with
  ElevenLabs." (`…elevenlabs-help-can-i-publish.txt`)

**AI disclosure: YES, a conditional duty exists.**

- Higgsfield §5.5: "Where required by applicable law, you will disclose that Output is artificially generated or
  manipulated, and you will not remove, alter, or obscure any provenance signals or markings Company applies".
- Higgsfield §5.2(xi): do not "represent that any Output is human-generated when it is not".
- ElevenLabs Prohibited Use Policy §10: disclose AI "where required by law or where failing to do so would materially
  mislead them", and do not "remove, alter, or conceal ElevenLabs watermarks, metadata or other provenance signals for
  the purpose of disguising AI-generated content".
- ElevenLabs Music Terms §4.4: comply with each "content-hosting service['s]" AI-disclosure policies. YouTube's own
  policy was not fetched in this check.
- What this means in practice:
  - Answer YouTube's altered or synthetic content question honestly. `contains_synthetic_media` in upload.yaml is
    already required.
  - Never describe the music as human-composed. For example, do not credit a composer for the themes.
- Open point: Higgsfield §5.5 bars *altering* provenance signals with no purpose qualifier, unlike ElevenLabs' "for the
  purpose of disguising". It is unclear whether normal mixing, ducking and encoding into a video, which may degrade an
  imperceptible watermark, counts. That seems unlikely to be the intent, but the clause does not say.

## Questions only Higgsfield or ElevenLabs could answer (drafts; NOT sent)

**To Higgsfield (support@higgsfield.ai):**

1. ElevenLabs Music v2.5 outputs made on a Max plan: are the ElevenLabs Music Terms limits passed to users? These are
   the exclusion of film, TV, radio and Studio Games, the streaming-distribution limits and the Music Library ban. Which
   ElevenLabs tier or agreement does Higgsfield hold?
2. Under §5.1(iii) and §5.2(iv): may I use a Higgsfield audio Output as inference-time reference or conditioning audio
   for a local open-source music model? There would be no training, no fine-tuning, no change to weights and no dataset.
   Please confirm in writing.
3. Does §5.5 ("not … alter … provenance signals") cover ordinary mixing, editing and encoding of the audio into a video?
4. Does Higgsfield, ElevenLabs or any partner register outputs with YouTube Content ID or a PRO? Will Higgsfield provide
   generation records to support a Content ID dispute? May I register my own outputs?
5. Please confirm that no attribution is required for ElevenLabs Music outputs made through Higgsfield.

**To ElevenLabs (support@elevenlabs.io):**

1. Is Higgsfield an Authorized Reseller of the Music Service? Do end users of a reseller get the Music Commercial Rights
   of the reseller's tier, and does ElevenLabs Terms §17 apply to them?
2. Does Prohibited Use Policy §12 ("develop, train, fine-tune, or improve any AI model") cover using Output as
   inference-time reference audio for another model?
3. Does ElevenLabs, or any music partner, fingerprint or register Eleven Music outputs in YouTube Content ID? What is the
   process if a third party claims an Eleven Music output?
4. Does the "film, TV, radio" exclusion cover YouTube videos watched in a TV app or on a smart TV? (Presumably not, but
   this is not defined.)

## Pages fetched but not snapshotted, or not available

- `https://higgsfield.ai/terms-of-use` and `/terms-of-service` return 404. The live terms are at
  `/terms-of-use-agreement`.
- `https://higgsfield.ai/pricing` and `/audio` are JavaScript-rendered, so curl got no text. Pricing was captured in the
  browser as an excerpt; `/audio` has no terms content.
- No Higgsfield page about music or audio terms or third-party model terms exists beyond §8, as far as was found.
- `https://elevenlabs.io/eleven-music-model-specific-terms` redirects to `/music-terms`. No separate v2.5 terms were
  found.
- `help.elevenlabs.io` returns 403 to curl and says it has moved. Its replacement articles were fetched from
  `elevenlabs.io/docs/help-center`. No ElevenLabs article about Content ID exists in the docs index (`llms.txt`).
- The ElevenLabs OEM Terms were fetched but not snapshotted. They cover bundling ElevenLabs into a product, which is
  Higgsfield's side, not the owner's.
