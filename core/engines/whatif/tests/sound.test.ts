import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Figure } from "../src/kit/rig/Figure";
import { SoundOnly } from "../src/kit/sound";
import { Light } from "../src/kit/stage/Look";
import { PauseBars } from "../src/kit/stage/PauseBars";
import { Finish, Stage } from "../src/kit/stage/Stage";

const sound = (el: ReactElement) => renderToStaticMarkup(createElement(SoundOnly.Provider, { value: true }, el));

describe("the sound composition", () => {
  const cam = { x: 960, y: 540, zoom: 1 };
  const drawn = (): ReactElement[] => [
    createElement(Stage, { cam, radius: 0, origin: { x: 0, y: 0 }, back: null, actors: null }),
    createElement(Finish),
    createElement(Figure, { x: 0, y: 0, head: "#fc0" }),
    createElement(PauseBars, { frame: 5, pauses: [{ from: 0, to: 30 }] }),
    createElement(Light, { pass: "over" }),
  ];

  it("draws nothing", () => {
    for (const el of drawn()) expect(sound(el)).toBe("");
  });

  it("draws as before outside it", () => {
    for (const el of drawn()) expect(renderToStaticMarkup(el)).not.toBe("");
  });
});
