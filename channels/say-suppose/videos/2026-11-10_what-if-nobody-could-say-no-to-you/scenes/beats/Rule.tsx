// Beat "The rule" (script.md, ## [..] The rule), from narration line 8. STUB: replace with the scene.
import { Placeholder } from "./Placeholder";
import type { Beat } from "../shared";

export const rule: Beat = {
  id: "rule",
  firstLine: 8,
  Component: ({ shot }) => <Placeholder shot={shot} title="The rule" />,
};
