// Beat "The stage" (script.md, ## [..] The stage), from narration line 91. STUB: replace with the scene.
import { Placeholder } from "./Placeholder";
import type { Beat } from "../shared";

export const stage: Beat = {
  id: "stage",
  firstLine: 91,
  Component: ({ shot }) => <Placeholder shot={shot} title="The stage" />,
};
