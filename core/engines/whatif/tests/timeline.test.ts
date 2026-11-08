import { describe, expect, it } from "vitest";
import { buildTimeline, type LineAudio, type VideoScript } from "../src/kit/timeline";

const script: VideoScript = {
  id: "t",
  leadInSec: 1,
  tailSec: 2,
  lines: [
    { text: "You hit pause.", gapAfterSec: 0.5 },
    { text: "Nine. Eight.", gapAfterSec: 0 },
  ],
  cues: {
    pause: { line: 0, word: "pause" },
    eight: { line: 1, word: "Eight" },
  },
};

const audio: LineAudio[] = [
  { file: "a.wav", seconds: 2, asr: [
    { word: "You", start: 0.1, end: 0.3 },
    { word: "hit", start: 0.4, end: 0.6 },
    { word: "pause.", start: 1, end: 1.6 },
  ] },
  { file: "b.wav", seconds: 3, asr: [
    { word: "Nine.", start: 0.2, end: 0.8 },
    { word: "Eight.", start: 1.5, end: 2.2 },
  ] },
];

describe("buildTimeline", () => {
  it("places clips after the lead-in with each line's gap", () => {
    const t = buildTimeline(script, audio, 30);
    expect(t.clips).toEqual([
      { file: "a.wav", from: 30, frames: 60 },
      { file: "b.wav", from: 105, frames: 90 },
    ]);
  });

  it("ends after the last clip plus the tail", () => {
    expect(buildTimeline(script, audio, 30).totalFrames).toBe(105 + 90 + 60);
  });

  it("puts each cue on the frame its word starts", () => {
    const { cues } = buildTimeline(script, audio, 30);
    expect(cues.pause).toBe(30 + 30);
    expect(cues.eight).toBe(105 + 45);
  });

  it("matches cue words without regard to case or punctuation", () => {
    const s = { ...script, cues: { nine: { line: 1, word: "nine" } } };
    expect(buildTimeline(s, audio, 30).cues.nine).toBe(105 + 6);
  });

  it("rejects a cue word the line does not contain", () => {
    const s = { ...script, cues: { nope: { line: 0, word: "bus" } } };
    expect(() => buildTimeline(s, audio, 30)).toThrow(/nope.*bus/);
  });

  it("rejects a cue on a line that does not exist", () => {
    const s = { ...script, cues: { nope: { line: 9, word: "bus" } } };
    expect(() => buildTimeline(s, audio, 30)).toThrow(/nope/);
  });

  it("rejects audio that does not match the script's lines", () => {
    expect(() => buildTimeline(script, audio.slice(0, 1), 30)).toThrow(/2 lines.*1 audio/);
  });
});

describe("cue word timing", () => {
  const countdown: VideoScript = {
    id: "c", leadInSec: 0, tailSec: 0,
    lines: [{ text: "Nine. Eight. Seven.", gapAfterSec: 0 }],
    cues: { eight: { line: 0, word: "Eight" }, seven: { line: 0, word: "Seven" } },
  };

  it("maps words one to one when the transcript has the same word count, even with digits", () => {
    const { cues } = buildTimeline(countdown, [{ file: "a.wav", seconds: 3, asr: [
      { word: "9,", start: 0, end: 0.5 }, { word: "8,", start: 1, end: 1.5 }, { word: "7,", start: 2, end: 2.5 },
    ] }], 30);
    expect(cues.eight).toBe(30);
    expect(cues.seven).toBe(60);
  });

  it("moves a cue that lands in silence forward to where the speech resumes", () => {
    const { cues } = buildTimeline(countdown, [{ file: "a.wav", seconds: 3, silences: [{ start: 0.6, end: 1.2 }], asr: [
      { word: "9,", start: 0, end: 0.5 }, { word: "8,", start: 0.7, end: 1.5 }, { word: "7,", start: 2, end: 2.5 },
    ] }], 30);
    expect(cues.eight).toBe(36);
  });
});
