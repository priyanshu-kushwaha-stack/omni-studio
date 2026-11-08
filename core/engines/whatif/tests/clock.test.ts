import { describe, expect, it } from "vitest";
import { worldClock } from "../src/kit/world/clock";

describe("worldClock", () => {
  const pauses = [{ from: 10, to: 20 }, { from: 30, to: 35 }];

  it("runs with the frame before any pause", () => {
    expect(worldClock(5, pauses)).toBe(5);
  });

  it("holds at the pause's first frame while paused", () => {
    expect(worldClock(10, pauses)).toBe(10);
    expect(worldClock(19, pauses)).toBe(10);
  });

  it("resumes without jumping after a pause", () => {
    expect(worldClock(20, pauses)).toBe(10);
    expect(worldClock(25, pauses)).toBe(15);
  });

  it("subtracts every finished pause", () => {
    expect(worldClock(40, pauses)).toBe(25);
  });
});
