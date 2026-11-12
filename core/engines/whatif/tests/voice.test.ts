import { describe, expect, it } from "vitest";
import { args, cost, direction, isLocal, lineVoice, localJob, localText, tightName } from "../pipeline/voice";

describe("voice CLI arguments", () => {
  const arthur = { voiceType: "preset", voiceId: "30fc8796-ceb6-4a66-b3a7-4a145ef7f346" };
  it("sends Eleven v4 one dialogue turn with the direction in the text", () => {
    const a = args("cost", { model: "elevenlabs_v4", ...arthur }, "[whispers] Somebody knows.");
    expect(a.slice(0, 3)).toEqual(["generate", "cost", "elevenlabs_v4"]);
    expect(JSON.parse(a[a.indexOf("--dialogue") + 1])).toEqual([{ text: "[whispers] Somebody knows.", voice_type: "preset", voice_id: arthur.voiceId }]);
  });
  it("keeps the sample's text2speech_v2 route and refuses it without a variant", () => {
    expect(args("create", { model: "text2speech_v2", variant: "elevenlabs", ...arthur }, "Hi.")).toContain("--variant");
    expect(() => args("create", { model: "text2speech_v2", ...arthur }, "Hi.")).toThrow(/variant/);
  });
  it("drops bracket directions for text2speech_v2, which would read them aloud", () => {
    const a = args("create", { model: "text2speech_v2", variant: "elevenlabs", ...arthur }, "[quietly] Nobody knows. [beat] Ever.");
    expect(a[a.indexOf("--prompt") + 1]).toBe("Nobody knows. Ever.");
  });
  it("names a sped-up take by its tempo, so a new tempo re-tightens instead of reusing the old file", () => {
    expect(tightName("line-05-ab12cd34", 1)).toBe("line-05-ab12cd34.tight.wav");
    expect(tightName("line-05-ab12cd34", 1.1)).toBe("line-05-ab12cd34.x110.tight.wav");
  });
});

describe("the local voice", () => {
  const local = { model: "local:qwen3", voiceType: "local", voiceId: "abc", ref: "../../brand/voice/ref.wav", refText: "Hi." };
  it("is told apart from the paid routes", () => {
    expect(isLocal(local)).toBe(true);
    expect(isLocal({ model: "elevenlabs_v4", voiceType: "preset", voiceId: "x" })).toBe(false);
  });
  it("drops bracket directions, which a local engine would read aloud", () => {
    expect(localText("[warm, matter-of-fact] Every morning, she waves. [pause] Not looking.")).toBe("Every morning, she waves. Not looking.");
  });
  it("costs nothing and never asks the Higgsfield CLI", async () => {
    expect(await cost("Hi.", local)).toBe(0);
  });
});

describe("character voices", () => {
  const narrator = { model: "local:qwen3", voiceType: "local", voiceId: "abc", ref: "../../brand/voice/ref.wav", refText: "Hi." };
  const lotte = { model: "local:qwen3-design", voiceType: "design", voiceId: "0000002a99999999", describe: "A baker in her fifties." };
  const script = { id: "t", voice: narrator, voices: { Lotte: lotte }, leadInSec: 0, tailSec: 0, lines: [], cues: {} };
  const line = (speaker?: string) => ({ text: "x", gapAfterSec: 0, speaker });

  it("gives a character line the character's own voice and a bare line the narrator's", () => {
    expect(lineVoice(script, line("Lotte"))).toBe(lotte);
    expect(lineVoice(script, line("narrator"))).toBe(narrator);
    expect(lineVoice(script, line())).toBe(narrator); // a story.json from before speakers
  });
  it("refuses a character with no voice rather than falling back to the narrator", () => {
    expect(() => lineVoice(script, line("Jonas"))).toThrow(/no voice for Jonas/);
  });
  it("reads the bracket direction", () => {
    expect(direction("[deadpan, wiping her hands] Sixty-two cakes.")).toBe("deadpan, wiping her hands");
    expect(direction("[warm] One. [beat] Two.")).toBe("warm; beat");
    expect(direction("No direction.")).toBe("");
  });
  it("hands a designed voice its description, the line's direction and a seed of its own", () => {
    const job = localJob("[deadpan, wiping her hands] Sixty-two cakes.", lotte, "/o.wav", "/v");
    expect(job).toEqual({
      engine: "qwen3-design", text: "Sixty-two cakes.", out: "/o.wav",
      instruct: "A baker in her fifties. Delivery: deadpan, wiping her hands.", seed: 42,
    });
    expect(localJob("Plain.", lotte, "/o.wav", "/v").instruct).toBe("A baker in her fifties.");
  });
  it("clones the narrator from its clip and drops the direction it cannot take", () => {
    expect(localJob("[hushed] Two cents.", narrator, "/o.wav", "/c/videos/v")).toEqual({
      engine: "qwen3", text: "Two cents.", out: "/o.wav", ref: "/c/brand/voice/ref.wav", ref_text: "Hi.",
    });
  });
});
