/**
 * Narration build: story -> one voice take per line -> tightened takes -> word timings -> props.json for Remotion.
 *
 *   tsx pipeline/build.ts --story <story.json> --out <public dir>/<subdir> [--max-credits N]
 *
 * Takes are cached by a hash of the voice and the spoken text, so an unchanged line is never bought twice. Lines with
 * no cached take are paid calls: the build quotes them first and refuses to run without --max-credits, or when the
 * quote is over it. Only the studio tool passes --max-credits, and only with the owner's approval.
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseArgs } from "node:util";
import { buildTimeline, type LineAudio, type VideoScript } from "../src/kit/timeline";
import { FPS } from "../src/kit/theme";
import { cost, probeSeconds, silences, synthesize, tighten, transcribe } from "./voice";

const { values } = parseArgs({
  options: { story: { type: "string" }, out: { type: "string" }, "max-credits": { type: "string" } },
});
if (!values.story || !values.out) throw new Error("usage: build.ts --story <story.json> --out <dir> [--max-credits N]");
const maxCredits = values["max-credits"] === undefined ? undefined : Number(values["max-credits"]);
const script = JSON.parse(readFileSync(values.story, "utf8")) as VideoScript;
if (!script.voice) throw new Error("story has no voice");
const voice = script.voice;
const out = values.out;
const sub = basename(out);

mkdirSync(out, { recursive: true });
const clips = script.lines.map((line, i) => {
  const spoken = line.say ?? line.text;
  // Hash voice+spoken text into the name so edits re-generate (and re-bill) only the lines that changed.
  const hash = createHash("sha256").update(`${JSON.stringify(voice)}\n${spoken}`).digest("hex").slice(0, 8);
  const name = `line-${String(i + 1).padStart(2, "0")}-${hash}`;
  return { spoken, raw: join(out, `${name}.wav`), file: `${sub}/${name}.tight.wav`, path: join(out, `${name}.tight.wav`) };
});

// A take bought under another line number (a test run, a reordered script) is the same take: reuse it by its hash.
const onDisk = readdirSync(out);
for (const c of clips) {
  if (existsSync(c.raw)) continue;
  const hash = basename(c.raw, ".wav").split("-").pop();
  const twin = onDisk.find((f) => f.endsWith(`-${hash}.wav`) && !f.endsWith(".tight.wav"));
  if (twin) copyFileSync(join(out, twin), c.raw);
}
const pending = clips.filter((c) => !existsSync(c.raw));
if (pending.length) {
  let credits = 0;
  for (const c of pending) credits += await cost(c.spoken, voice);
  console.log(`${pending.length} new take(s), quoted ${credits.toFixed(2)} credits`);
  if (maxCredits === undefined) throw new Error("new takes are paid calls: pass --max-credits with the owner's approval");
  // Credits are priced in hundredths; compare in hundredths so 0.46 + 0.23 is not 0.6900000000000001 > 0.69.
  if (Math.round(credits * 100) > Math.round(maxCredits * 100)) throw new Error(`quote ${credits.toFixed(2)} is over the approved ${maxCredits} credits`);
}
for (const c of pending) {
  await synthesize(c.spoken, voice, c.raw);
  console.log(`voice: ${c.spoken}`);
}
for (const c of clips) if (!existsSync(c.path)) await tighten(c.raw, c.path, script.tempo ?? 1);
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
writeFileSync(join(out, "props.json"), JSON.stringify({ timeline, lines: script.lines, sources: script.sources ?? {} }, null, 2));
console.log(`${(timeline.totalFrames / FPS).toFixed(1)}s`);
for (const [id, f] of Object.entries(timeline.cues)) console.log(`${id}: ${f} (${(f / FPS).toFixed(2)}s)`);
