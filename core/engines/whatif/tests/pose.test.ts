import { describe, expect, it } from "vitest";
import { dir, LIMB, reach } from "../src/kit/rig/pose";

const hand = ([upper, fore]: [number, number]) => {
  const a = dir(upper);
  const b = dir(upper + fore);
  return { x: (a.x + b.x) * LIMB, y: (a.y + b.y) * LIMB };
};

describe("reach", () => {
  it.each([[70, 40], [-30, 80], [90, -50], [20, -90]])("puts the hand on (%d, %d)", (x, y) => {
    const h = hand(reach(x, y));
    expect(h.x).toBeCloseTo(x, 3);
    expect(h.y).toBeCloseTo(y, 3);
  });

  it("stretches toward targets out of range rather than failing", () => {
    const h = hand(reach(500, 0));
    expect(h.x).toBeGreaterThan(LIMB * 1.9);
    expect(Math.abs(h.y)).toBeLessThan(5);
  });
});
