/**
 * Narration build: story -> one voice take per line -> tightened takes -> word timings -> props.json for Remotion.
 *
 *   tsx pipeline/build.ts --story <story.json> --out <public dir>/<subdir> [--max-credits N]
 *
 * Each line is spoken by its speaker's voice: the narrator's, or a character's own (story.json "voices"). A local voice
 * (model "local:<engine>") is made free on this Mac. Takes are cached by a hash of the line's voice and its spoken
 * text, direction included, so an unchanged line is never made, or bought, twice. Lines with
 * no cached take are paid calls: the build quotes them first and refuses to run without --max-credits, or when the
 * quote is over it. Only the studio tool passes --max-credits, and only with the owner's approval.
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { buildTimeline, type LineAudio, type VideoScript } from "../src/kit/timeline";
import { FPS } from "../src/kit/theme";
import { cost, isLocal, lineVoice, probeSeconds, silences, synthesize, synthesizeLocal, tighten, tightName, transcribe } from "./voice";

const { values } = parseArgs({
  options: { story: { type: "string" }, out: { type: "string" }, "max-credits": { type: "string" } },
});
if (!values.story || !values.out) throw new Error("usage: build.ts --story <story.json> --out <dir> [--max-credits N]");
const maxCredits = values["max-credits"] === undefined ? undefined : Number(values["max-credits"]);
const script = JSON.parse(readFileSync(values.story, "utf8")) as VideoScript;
const out = values.out;
const sub = basename(out);

mkdirSync(out, { recursive: true });
const clips = script.lines.map((line, i) => {
  const spoken = line.say ?? line.text;
  const voice = lineVoice(script, line);
  // Hash voice+spoken text (its [direction] too) into the name so edits re-generate (and re-bill) only the lines
  // that changed. A narrator line hashes as it did before characters had voices, so its takes are kept.
  const hash = createHash("sha256").update(`${JSON.stringify(voice)}\n${spoken}`).digest("hex").slice(0, 8);
  const name = `line-${String(i + 1).padStart(2, "0")}-${hash}`;
  // Tempo is applied when tightening, so a new tempo re-uses the paid take and never re-bills it.
  const tempo = line.tempo ?? script.tempo ?? 1;
  const tight = tightName(name, tempo);
  return { spoken, voice, tempo, raw: join(out, `${name}.wav`), file: `${sub}/${tight}`, path: join(out, tight) };
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
const local = pending.filter((c) => isLocal(c.voice));
const paid = pending.filter((c) => !isLocal(c.voice));
if (paid.length) {
  let credits = 0;
  for (const c of paid) credits += await cost(c.spoken, c.voice);
  console.log(`${paid.length} new take(s), quoted ${credits.toFixed(2)} credits`);
  if (maxCredits === undefined) throw new Error("new takes are paid calls: pass --max-credits with the owner's approval");
  // Credits are priced in hundredths; compare in hundredths so 0.46 + 0.23 is not 0.6900000000000001 > 0.69.
  if (Math.round(credits * 100) > Math.round(maxCredits * 100)) throw new Error(`quote ${credits.toFixed(2)} is over the approved ${maxCredits} credits`);
}
if (local.length) {
  // Free: made on this Mac, no quote and no credit cap (spec 2026-11-10: local narration before any paid take).
  console.log(`${local.length} local take(s), free`);
  await synthesizeLocal(local.map((c) => ({ text: c.spoken, out: c.raw, voice: c.voice })), dirname(values.story));
}
for (const c of paid) {
  await synthesize(c.spoken, c.voice, c.raw);
  console.log(`voice: ${c.spoken}`);
}
for (const c of clips) if (!existsSync(c.path)) await tighten(c.raw, c.path, c.tempo);
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
writeFileSync(join(out, "props.json"), JSON.stringify({ timeline, lines: script.lines, sources: script.sources ?? {}, tempo: script.tempo ?? 1 }, null, 2));
console.log(`${(timeline.totalFrames / FPS).toFixed(1)}s`);
for (const [id, f] of Object.entries(timeline.cues)) console.log(`${id}: ${f} (${(f / FPS).toFixed(2)}s)`);
