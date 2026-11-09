# Publish: What If You Could Pause Time for 10 Seconds a Day?

status: live 2026-11-09 18:30 IST (https://youtu.be/-si5nCzgQl8). G7 awaits the owner.

- **File:** `renders/edit-v6.mp4` (5:14, -14.0 LUFS), passed G5 and G6.
- **Title, description, tags:** `upload.yaml`. Title and thumbnail are G1 pair A. Sources from `claims.md` (c04, c05,
  c09, c14: every claim the narration speaks) are in the description, not on screen (owner, 2026-11-07).
- **Thumbnail:** `renders/packaging/thumb-film-7.jpg`, the film's own frame at the counter's 7 (owner's pick,
  2026-11-08), set through the API: `omni upload ... --thumbnail-only --run --confirm <slug>/<video>`.
- **Thumbnail A/B test** (Studio Test & Compare, set 2026-11-08, starts when the video is public; owner's call):
  `thumb-film-7-day12.jpg` (stakes, DAY 12), `thumb-a.jpg` (face close-up, no text), `thumb-fun-cat-day1.jpg` (fun,
  DAY 1). Text tags by `channels/say-suppose/brand/thumb_tag.py`.
- **Live:** public since Mon 9 Nov 2026, 18:30 IST, as scheduled by the owner (https://youtu.be/-si5nCzgQl8). Checked
  on the public page: Hindi audio track, English and Hindi subtitles, end screen, chapters; Studio shows Public, no
  notices, thumbnail A/B test Running. Pinned comment posted as @SaySuppose. G7 awaits the owner.
- **Subtitles:** English and Hindi tracks from the scripts (`subtitles/en.srt`, `subtitles/hi.srt`), added through the
  API 2026-11-08 (`omni upload ... --captions-only`); ids in `upload_log.json`.
- **End screen:** set in Studio 2026-11-08, 5:06:03 to the end: Subscribe (top right) and a Video element on "Most
  recent upload" (bottom right), both in the right third the end card leaves empty. Shows once the video is public.
- **Audience:** not made for kids.
- **Studio check, 2026-11-08:** AI use (Studio's new name for altered content) reads No; not made for kids.
- **Altered or synthetic content:** no (owner confirmed, 2026-11-08). The disclosure covers realistic content; this is a
  stylised cartoon with a fictional narrator. The narration and music are AI-made, which the description says.
- **Pinned comment:** "What would you do with your ten seconds? The best answers become videos." Post and pin it right
  after the video goes public: YouTube does not allow comments on private videos (checked 2026-11-08).
- **Hindi audio track:** added 2026-11-08 in Studio (Languages, Hindi, Audio: `dub/hi/pause-time-hi-dub-192k.mp3`,
  the same mix at 192 kbps; no auto-dubs were there). Steps for later videos, in Studio: Languages, this video, Add language, Hindi, Dub, upload
  `dub/hi/pause-time-hi-dub.mp3` (built per `dub/README.md`). Delete any auto-dub YouTube made first.
- **Upload:** `omni upload say-suppose 2026-11-06_pause-time-for-10-seconds-a-day` is the dry run. The real upload is
  `--run --confirm say-suppose/2026-11-06_pause-time-for-10-seconds-a-day`, private, only when the owner asks. The
  public flip is the owner's, by hand in YouTube Studio.
