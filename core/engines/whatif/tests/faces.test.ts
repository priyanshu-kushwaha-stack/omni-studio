import { describe, expect, it } from "vitest";
import { EXPRESSIONS } from "../src/kit/rig/expressions";

describe("expressions", () => {
  it("names the faces the style guide asks for", () => {
    for (const name of ["sceptical", "worried", "sad", "shocked", "determined", "relieved", "afraid"]) {
      expect(EXPRESSIONS[name as keyof typeof EXPRESSIONS], name).toBeDefined();
    }
  });
  it("keeps eyelids between open and shut", () => {
    for (const [name, face] of Object.entries(EXPRESSIONS)) {
      expect(face.lids, name).toBeGreaterThanOrEqual(0);
      expect(face.lids, name).toBeLessThanOrEqual(1);
    }
  });
});
