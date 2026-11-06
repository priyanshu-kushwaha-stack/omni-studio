import { describe, expect, it } from "vitest";
import { layerBlur } from "../src/kit/stage/Look";
import { MOODS, moodLook, type MoodName } from "../src/kit/stage/moods";
import { barHeight, BARS_FULL, BARS_SLIDE } from "../src/kit/stage/bars";
import { sourceLabel } from "../src/kit/ui/source";

describe("depth of field", () => {
  it("is sharp at the focus depth and softer with distance", () => {
    const look = { dof: 8, focus: 1 };
    expect(layerBlur(look, 1)).toBe(0);
    expect(layerBlur(look, 0.5)).toBeGreaterThan(0);
    expect(layerBlur(look, 0.25)).toBeGreaterThan(layerBlur(look, 0.5));
    expect(layerBlur({}, 0.25)).toBe(0);
  });
});

describe("moods", () => {
  it("every named mood is a full look", () => {
    const names: MoodName[] = ["morning", "day", "dusk", "night", "lamp", "frozen"];
    for (const name of names) {
      const look = moodLook(name);
      expect(look.rim, name).toBeDefined();
      expect(look.vignette, name).toBeGreaterThan(0);
      if (name !== "day") expect(look.grade, name).toBeDefined();
    }
    expect(Object.keys(MOODS).sort()).toEqual([...names].sort());
  });
  it("refuses an unknown mood", () => {
    expect(() => moodLook("noon" as MoodName)).toThrow(/unknown mood/);
  });
});

describe("pause bars", () => {
  const pauses = [{ from: 100, to: 400 }];
  it("are absent outside a pause and full inside it", () => {
    expect(barHeight(50, pauses)).toBe(0);
    expect(barHeight(100 + BARS_SLIDE, pauses)).toBe(BARS_FULL);
    expect(barHeight(250, pauses)).toBe(BARS_FULL);
    expect(barHeight(450, pauses)).toBe(0);
  });
  it("slide in and out", () => {
    const entering = barHeight(100 + BARS_SLIDE / 2, pauses);
    const leaving = barHeight(400 - BARS_SLIDE / 2, pauses);
    expect(entering).toBeGreaterThan(0);
    expect(entering).toBeLessThan(BARS_FULL);
    expect(leaving).toBeGreaterThan(0);
    expect(leaving).toBeLessThan(BARS_FULL);
  });
});

describe("source tags", () => {
  const ledger = {
    c13: "https://completestreetdesignmanual.engineering.lacity.gov/e-400/e-442",
    c14: "https://assets.publishing.service.gov.uk/media/x/the-highway-code-stopping-distances.pdf",
    c04: "https://www.openstax.org/books/college-physics-2e/pages/2-7",
  };
  it("names the site each cited row comes from, once each", () => {
    expect(sourceLabel(["c04"], ledger)).toBe("Source: openstax.org");
    expect(sourceLabel(["c13", "c14", "c14"], ledger)).toBe(
      "Sources: completestreetdesignmanual.engineering.lacity.gov · assets.publishing.service.gov.uk");
  });
  it("shows nothing for a line with no citation and refuses an unknown id", () => {
    expect(sourceLabel([], ledger)).toBe("");
    expect(() => sourceLabel(["c99"], ledger)).toThrow(/c99/);
  });
});
