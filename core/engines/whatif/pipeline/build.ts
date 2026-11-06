import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildTimeline, type LineAudio, type VideoScript } from "../src/kit/timeline";
import { FPS } from "../src/kit/theme";
import { cost, probeSeconds, silences, synthesize, tighten, transcribe } from "./voice";

const MAX_CREDITS = 5;
const script = JSON.parse(readFileSync("scripts/pause.json", "utf8")) as VideoScript;
if (!script.voice) throw new Error("script has no voice");
const voice = script.voice;

mkdirSync(join("public", script.id), { recursive: true });
const clips = script.lines.map((line, i) => {
  // Hash voice+text into the name so edits re-generate (and re-bill) only the lines that changed.
  const hash = createHash("sha256").update(`${JSON.stringify(voice)}\n${line.text}`).digest("hex").slice(0, 8);
  const base = `${script.id}/line-${String(i + 1).padStart(2, "0")}-${hash}`;
  return { text: line.text, raw: join("public", `${base}.wav`), file: `${base}.tight.wav`, path: join("public", `${base}.tight.wav`) };
});

const pending = clips.filter((c) => !existsSync(c.raw));
if (pending.length) {
  let credits = 0;
  for (const c of pending) credits += await cost(c.text, voice);
  console.log(`${pending.length} new line(s), ~${credits.toFixed(2)} credits`);
  if (credits > MAX_CREDITS) throw new Error(`over the ${MAX_CREDITS}-credit cap`);
}
for (const c of pending) {
  await synthesize(c.text, voice, c.raw);
  console.log(`voice: ${c.text}`);
}
for (const c of clips) await tighten(c.raw, c.path);
await transcribe(clips.map((c) => c.path).filter((p) => !existsSync(`${p}.words.json`)));

const audio: LineAudio[] = [];
for (const c of clips) {
  audio.push({
    file: c.file,
    seconds: await probeSeconds(c.path),
    asr: JSON.parse(readFileSync(`${c.path}.words.json`, "utf8")),
    silences: await silences(c.path),
  });
}
const timeline = buildTimeline(script, audio, FPS);
writeFileSync(join("public", script.id, "props.json"), JSON.stringify({ timeline }, null, 2));
console.log(`${(timeline.totalFrames / FPS).toFixed(1)}s`);
for (const [id, f] of Object.entries(timeline.cues)) console.log(`${id}: ${f} (${(f / FPS).toFixed(2)}s)`);
