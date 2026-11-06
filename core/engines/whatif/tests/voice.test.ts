import { describe, expect, it } from "vitest";
import { args } from "../pipeline/voice";

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
});
