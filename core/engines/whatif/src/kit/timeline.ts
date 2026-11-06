import { alignWords, type AsrWord } from "./align";

export interface VoiceSpec { model: string; variant?: string; voiceType: string; voiceId: string }
export interface ScriptLine {
  text: string;
  gapAfterSec: number;
  /** What the voice speaks, when it differs from the script (numbers spelled out, a direction like "[whispers]"). */
  say?: string;
  /** The light for this line's scene (kit/stage/moods). */
  mood?: string;
  /** Ledger ids cited on this line; their sources show as a tag. */
  claims?: string[];
}
export interface CueAnchor { line: number; word: string }

export interface VideoScript {
  id: string;
  voice?: VoiceSpec;
  leadInSec: number;
  tailSec: number;
  lines: ScriptLine[];
  cues: Record<string, CueAnchor>;
  /** Claim id -> source URL, for on-screen source tags. */
  sources?: Record<string, string>;
  /** Speed applied to takes when tightening; 1 unless the story says otherwise. */
  tempo?: number;
}

export interface Silence { start: number; end: number }
export interface LineAudio { file: string; seconds: number; asr: AsrWord[]; silences?: Silence[] }
export interface Clip { file: string; from: number; frames: number }
export interface Timeline { totalFrames: number; clips: Clip[]; cues: Record<string, number> }

const normal = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

export function buildTimeline(script: VideoScript, audio: LineAudio[], fps: number): Timeline {
  if (audio.length !== script.lines.length) {
    throw new Error(`script has ${script.lines.length} lines but ${audio.length} audio clips`);
  }
  const clips: Clip[] = [];
  let at = Math.round(script.leadInSec * fps);
  script.lines.forEach((line, i) => {
    const frames = Math.ceil(audio[i].seconds * fps);
    clips.push({ file: audio[i].file, from: at, frames });
    at += frames + Math.round(line.gapAfterSec * fps);
  });

  const cues: Record<string, number> = {};
  for (const [id, { line, word }] of Object.entries(script.cues)) {
    const source = script.lines[line];
    if (!source) throw new Error(`cue ${id}: no line ${line}`);
    const words = source.text.split(/\s+/);
    const index = words.findIndex((w) => normal(w) === normal(word));
    if (index < 0) throw new Error(`cue ${id}: "${word}" is not in line ${line}: ${source.text}`);
    const times = alignWords(words, audio[line].asr, audio[line].seconds);
    // Whisper's word starts can land in the pause before the word; the audio itself is the better clock.
    const start = times[index].start;
    const silence = audio[line].silences?.find((g) => start >= g.start && start < g.end);
    cues[id] = clips[line].from + Math.round((silence ? silence.end : start) * fps);
  }

  return { totalFrames: at + Math.round(script.tailSec * fps), clips, cues };
}
