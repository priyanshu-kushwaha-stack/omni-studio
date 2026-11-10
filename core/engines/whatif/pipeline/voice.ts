import { spawn } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { VoiceSpec } from "../src/kit/timeline";

const HERE = dirname(fileURLToPath(import.meta.url));
/** faster-whisper lives in the studio's media venv; the studio tool passes WHISPER_PY when it runs from a worktree. */
const WHISPER_PY = process.env.WHISPER_PY ?? resolve(HERE, "../../../../.venv-media/bin/python");

function run(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    // stdin closed: the Higgsfield CLI otherwise waits on it and never returns.
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0 ? resolve(out) : reject(new Error(`${cmd} exited ${code}: ${(err || out).slice(-500)}`)),
    );
  });
}

/** Higgsfield CLI arguments for one take. Eleven v4 takes a one-turn dialogue (direction such as "[whispers]" goes in
 *  the text); text2speech_v2 takes a prompt and an engine variant. */
export function args(cmd: "create" | "cost", v: VoiceSpec, text: string): string[] {
  if (v.model === "elevenlabs_v4" || v.model === "elevenlabs_v4_turbo") {
    const turn = [{ text, voice_type: v.voiceType, voice_id: v.voiceId }];
    return ["generate", cmd, v.model, "--dialogue", JSON.stringify(turn), "--json"];
  }
  if (!v.variant) throw new Error(`voice model ${v.model} needs a variant`);
  // This route takes no direction: "[whispers]" would be spoken as a word.
  const plain = text.replace(/\s*\[[^\]]*\]\s*/g, " ").trim();
  return ["generate", cmd, v.model, "--prompt", plain, "--variant", v.variant,
    "--voice_type", v.voiceType, "--voice_id", v.voiceId, "--json"];
}

function find(json: unknown, key: string): unknown {
  if (Array.isArray(json)) {
    for (const item of json) {
      const found = find(item, key);
      if (found !== undefined) return found;
    }
  } else if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    if (key in obj) return obj[key];
    for (const value of Object.values(obj)) {
      const found = find(value, key);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

/** A free voice made on this Mac (story.py writes model "local:<engine>"), not a paid Higgsfield take. */
export const isLocal = (v: VoiceSpec) => v.model.startsWith("local:");

/** What a local engine reads: delivery directions in square brackets would be spoken as words, so they go. */
export const localText = (text: string) => text.replace(/\s*\[[^\]]*\]\s*/g, " ").replace(/\s+/g, " ").trim();

/** One media-venv process for every pending local take, so the model loads once. Each take becomes mono 44.1 kHz
 *  like a paid one. refBase is story.json's folder, which the reference clip path is relative to. */
export async function synthesizeLocal(jobs: { text: string; out: string }[], v: VoiceSpec, refBase: string): Promise<void> {
  if (!jobs.length) return;
  if (!v.ref) throw new Error(`local voice ${v.model} has no reference clip`);
  const raw = jobs.map((j) => ({ text: localText(j.text), tmp: `${j.out}.local.wav`, out: j.out }));
  const spec = join(tmpdir(), `what-if-local-${process.pid}.json`);
  writeFileSync(spec, JSON.stringify({
    engine: v.model.slice("local:".length), ref: resolve(refBase, v.ref), ref_text: v.refText ?? "",
    jobs: raw.map((j) => [j.text, j.tmp]),
  }));
  await run(WHISPER_PY, [join(HERE, "local_tts.py"), spec]);
  for (const j of raw) {
    await run("ffmpeg", ["-v", "error", "-y", "-i", j.tmp, "-ac", "1", "-ar", "44100", j.out]);
    rmSync(j.tmp, { force: true });
  }
  rmSync(spec, { force: true });
}

export async function cost(text: string, v: VoiceSpec): Promise<number> {
  if (isLocal(v)) return 0;
  const out = await run("higgsfield", args("cost", v, text));
  const credits = Number(find(JSON.parse(out), "credits"));
  if (!Number.isFinite(credits)) throw new Error(`no credits in cost output: ${out.slice(0, 200)}`);
  return credits;
}

/** Writes a mono WAV to outWav whatever format the engine returns. */
export async function synthesize(text: string, v: VoiceSpec, outWav: string): Promise<void> {
  const created = JSON.parse(await run("higgsfield", args("create", v, text)));
  const id = Array.isArray(created) && typeof created[0] === "string" ? created[0] : find(created, "id");
  if (typeof id !== "string") throw new Error(`no job id in: ${JSON.stringify(created).slice(0, 200)}`);
  const done = JSON.parse(await run("higgsfield", ["generate", "wait", id, "--quiet", "--json"]));
  const url = find(done, "result_url");
  if (typeof url !== "string") throw new Error(`job ${id} finished without a result_url`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed for job ${id}: HTTP ${res.status}`);
  const tmp = join(tmpdir(), `what-if-${id}`);
  writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  await run("ffmpeg", ["-v", "error", "-y", "-i", tmp, "-ac", "1", "-ar", "44100", outWav]);
}

/** Caps pauses inside a raw clip (and changes its speed if tempo is not 1), so raw takes stay untouched and are
 *  never re-billed. The channel's slow pace means tempo 1; the owner's sample used 1.1. */
/** The tightened take's file name. A take at another tempo is another file, so changing the tempo re-tightens. */
export const tightName = (name: string, tempo: number) =>
  tempo === 1 ? `${name}.tight.wav` : `${name}.x${Math.round(tempo * 100)}.tight.wav`;

export async function tighten(rawWav: string, outWav: string, tempo = 1): Promise<void> {
  const filter = [
    "silenceremove=start_periods=1:start_threshold=-40dB:stop_periods=-1:stop_duration=0.3:stop_silence=0.3:stop_threshold=-40dB",
    ...(tempo !== 1 ? [`atempo=${tempo}`] : []),
    "afade=t=in:d=0.01",
  ].join(",");
  await run("ffmpeg", ["-v", "error", "-y", "-i", rawWav, "-af", filter, outWav]);
}

/** Pauses of at least 0.1 s in a clip, measured from the audio. */
export async function silences(wav: string): Promise<{ start: number; end: number }[]> {
  const p = spawn("ffmpeg", ["-i", wav, "-af", "silencedetect=noise=-40dB:d=0.1", "-f", "null", "-"]);
  let log = "";
  p.stderr.on("data", (d) => (log += d));
  await new Promise((resolve) => p.on("close", resolve));
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  return ends.map((end, i) => ({ start: starts[i], end }));
}

export async function probeSeconds(file: string): Promise<number> {
  const out = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  const s = Number(out.trim());
  if (!Number.isFinite(s) || s <= 0) throw new Error(`ffprobe gave no duration for ${file}`);
  return s;
}

/** Word timings via faster-whisper; writes <wav>.words.json next to each WAV. */
export async function transcribe(wavs: string[]): Promise<void> {
  if (wavs.length) await run(WHISPER_PY, [join(HERE, "transcribe.py"), ...wavs]);
}
