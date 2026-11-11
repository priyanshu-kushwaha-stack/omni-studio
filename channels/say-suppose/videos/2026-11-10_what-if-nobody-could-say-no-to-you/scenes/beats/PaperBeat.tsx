// Beat "The paper" (script.md, ## [..] The paper), from narration line 106. STUB: replace with the scene.
import { Placeholder } from "./Placeholder";
import type { Beat } from "../shared";

export const paper: Beat = {
  id: "paper",
  firstLine: 106,
  Component: ({ shot }) => <Placeholder shot={shot} title="The paper" />,
};
