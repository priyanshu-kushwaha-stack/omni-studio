// Beat "Back to you" (script.md, ## [..] Back to you), from narration line 110. STUB: replace with the scene.
import { Placeholder } from "./Placeholder";
import type { Beat } from "../shared";

export const back: Beat = {
  id: "back",
  firstLine: 110,
  Component: ({ shot }) => <Placeholder shot={shot} title="Back to you" />,
};
