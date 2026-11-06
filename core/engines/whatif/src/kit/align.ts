export interface AsrWord { word: string; start: number; end: number }
export interface WordTime { start: number; end: number }

const strip = (w: string) => w.replace(/[।?!.,:;"'“”‘’…-]/g, "");
const weight = (w: string) => Math.max(1, strip(w).length);

/**
 * Put the script's own words on the ASR timeline. Whisper's Hindi words rarely match the
 * script one to one (it merges, splits and misspells), so instead of matching text we match
 * position: each script word's cumulative character fraction is looked up on the ASR words'
 * cumulative character fractions and interpolated inside that ASR word's [start, end].
 * Silence between ASR words is skipped because a fraction on a boundary maps to the next
 * word's start. Without ASR words, time is split by word length over the whole speech.
 */
export function alignWords(scriptWords: string[], asr: AsrWord[], speechSec: number): WordTime[] {
  // Same count means the same words, however Whisper spelled them ("Nine." comes back as "9,").
  if (asr.length === scriptWords.length) return asr.map(({ start, end }) => ({ start, end }));

  const total = scriptWords.reduce((n, w) => n + weight(w), 0);
  const fractions: number[] = [0];
  for (const w of scriptWords) fractions.push(fractions[fractions.length - 1] + weight(w) / total);

  const timeAt = asr.length === 0
    ? (f: number) => f * speechSec
    : asrTimeline(asr);

  return scriptWords.map((_, i) => {
    const start = Math.min(speechSec, timeAt(fractions[i]));
    const end = i === scriptWords.length - 1
      ? Math.min(speechSec, asr.length ? asr[asr.length - 1].end : speechSec)
      : Math.min(speechSec, timeAt(fractions[i + 1]));
    return { start, end: Math.max(start, end) };
  });
}

function asrTimeline(asr: AsrWord[]) {
  const total = asr.reduce((n, w) => n + weight(w.word), 0);
  const bounds: number[] = [0];
  for (const w of asr) bounds.push(bounds[bounds.length - 1] + weight(w.word) / total);
  return (f: number) => {
    // Find the ASR word whose fraction range [bounds[i], bounds[i+1]) contains f.
    let i = 0;
    while (i < asr.length - 1 && f >= bounds[i + 1] - 1e-12) i++;
    const span = bounds[i + 1] - bounds[i];
    const local = span > 0 ? Math.min(1, Math.max(0, (f - bounds[i]) / span)) : 0;
    return asr[i].start + local * (asr[i].end - asr[i].start);
  };
}
