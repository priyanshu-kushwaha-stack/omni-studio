import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MoodName } from "../src/kit/stage/moods";
import { MOOD_NAMES, REF, screenOf, setLook, SETS, SetScene, SET_LIST, worldOf, type SetDef } from "../src/kit/sets";


/** The library the edit skill promises, and the spots each set must keep (films place people by these names). */
const EXPECTED: Record<string, string[]> = {
  "metro-platform": ["hero", "waiting", "door", "bench"],
  "metro-coach": ["window", "seat", "seatLeft", "pole", "aisle"],
  bus: ["window", "seat", "seatLeft", "aisle", "pole"],
  kitchen: ["cook", "counter", "fridge"],
  bedroom: ["bedEdge", "desk", "standing", "door"],
  dining: ["far1", "far2", "far3", "far4", "headLeft", "headRight", "serving"],
  courtyard: ["tulsi", "charpai", "door", "yard"],
  balcony: ["railing", "railingRight", "chair", "door"],
  classroom: ["teacher", "board", "seat1", "seat2", "seat3"],
  "office-desk": ["desk", "behind", "beside", "cabin"],
  "hostel-room": ["cotLeft", "cotRight", "table", "floor"],
  street: ["near", "nearRight", "crossing", "far"],
  bazaar: ["vendor", "customer", "passing", "stall"],
  "chai-stall": ["chaiwala", "customer", "friend", "street"],
  phone: ["face", "shoulder"],
  "school-corridor": ["hero", "friend", "door", "cooler"],
  "exam-hall": ["seat1", "seat2", "seat3", "invigilator"],
  canteen: ["benchLeft", "benchMid", "benchRight", "counter", "standing"],
  rooftop: ["parapet", "parapetRight", "door", "tank"],
  "festival-street": ["hero", "friend", "rangoli", "doorstep"],
  "gully-cricket": ["batter", "bowler", "fielder", "keeper"],
  "hospital-corridor": ["bench1", "bench2", "doors", "pacing"],
  "bank-atm": ["atm", "guard", "door"],
  "wedding-hall": ["groom", "bride", "stage", "guest", "aunty"],
  "train-platform": ["hero", "seeingOff", "door", "vendor"],
  "sleeper-coach": ["lower", "lowerRight", "upper", "aisle"],
  "gaming-desk": ["chair", "behind", "door"],
  stadium: ["seat", "neighbour", "aisle"],
  "city-skyline": ["wall", "wallRight", "walker"],
  "tv-studio": ["anchor", "guest", "presenter"],
};

const draw = (set: SetDef, mood: MoodName, part: "Back" | "Mid" | "Front") => {
  const props = { cam: set.cameras.wide, mood, frame: 12, options: set.defaults };
  const out = set[part]?.(props);
  return out === undefined ? null : renderToStaticMarkup(createElement("svg", null, out));
};

describe("the set library", () => {
  it("has every set the edit skill lists, each once", () => {
    expect(Object.keys(SETS).sort()).toEqual(Object.keys(EXPECTED).sort());
    expect(SET_LIST.length).toBe(Object.keys(EXPECTED).length);
  });

  for (const set of SET_LIST) {
    describe(set.name, () => {
      it("names its spots", () => {
        for (const name of EXPECTED[set.name]) expect(set.spots[name], `${set.name}.${name}`).toBeDefined();
      });

      it("keeps every spot on the set at a sane size", () => {
        for (const [name, s] of Object.entries(set.spots)) {
          expect(s.x, name).toBeGreaterThan(-200);
          expect(s.x, name).toBeLessThan(2120);
          expect(s.y, name).toBeGreaterThan(250);
          expect(s.y, name).toBeLessThan(1400);
          expect(s.scale, name).toBeGreaterThan(0.5);
          expect(s.scale, name).toBeLessThan(4);
          expect([1, -1]).toContain(s.facing);
        }
      });

      it("frames wide at REF and casts its example on spots that exist", () => {
        expect(set.cameras.wide).toEqual(REF);
        expect(set.cameras[set.example.camera], set.example.camera).toBeDefined();
        expect(set.example.cast.length).toBeGreaterThan(0);
        for (const m of set.example.cast) expect(set.spots[m.spot], m.spot).toBeDefined();
      });

      it("mounts in all six moods, and the example composition does too", () => {
        for (const mood of MOOD_NAMES) {
          expect(draw(set, mood, "Back"), mood).toMatch(/<g/);
          for (const part of ["Mid", "Front"] as const) draw(set, mood, part);
          const scene = renderToStaticMarkup(createElement(SetScene, { set, mood, frame: 30 }));
          expect(scene, mood).toMatch(/<svg/);
          expect(scene, `${mood}: a number went missing`).not.toMatch(/NaN/);
        }
      });

      it("changes with the mood: the night is drawn differently from the day", () => {
        expect(draw(set, "night", "Back")).not.toBe(draw(set, "day", "Back"));
      });
    });
  }
});

describe("set lighting", () => {
  it("lights a set's lamps only in the moods they list", () => {
    const lamp = { x: 960, y: 540, r: 300, color: "#ffd27a", moods: ["night" as MoodName] };
    expect(setLook([lamp], "night", REF).glows).toHaveLength(1);
    expect(setLook([lamp], "day", REF).glows ?? []).toHaveLength(0);
  });

  it("glows only where the drawn light is on: the bedroom lamp switched off casts nothing at night", () => {
    const bedroom = SETS.bedroom;
    const lamps = (lamp: boolean | null) => setLook(bedroom.lights({ ...bedroom.defaults, lamp } as never), "night", REF).glows ?? [];
    expect(lamps(false).length).toBe(lamps(null).length - 1);
    expect(lamps(true).length).toBe(lamps(null).length);
  });

  it("puts a layer's point where it was drawn at REF, and moves far layers less as the camera moves", () => {
    expect(worldOf(REF, 300, 200, 0.3)).toEqual({ x: 300, y: 200 });
    const cam = { x: 1260, y: 540, zoom: 1 };
    const near = screenOf(cam, 960, 540, 1).x;
    const far = screenOf(cam, 960, 540, 0.3).x;
    expect(near).toBeLessThan(far);
  });

  it("refuses a spot that does not exist", () => {
    const set = SETS.kitchen;
    expect(() => renderToStaticMarkup(createElement(SetScene, { set, mood: "day", cast: [{ spot: "nowhere", who: { head: "#fc0" } }] })))
      .toThrow(/no spot "nowhere"/);
  });
});
