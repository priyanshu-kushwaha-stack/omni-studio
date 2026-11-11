// Beat "The clerk" (script.md, ## [..] The clerk), from narration line 36. STUB: replace with the scene.
import { Placeholder } from "./Placeholder";
import type { Beat } from "../shared";

export const clerk: Beat = {
  id: "clerk",
  firstLine: 36,
  Component: ({ shot }) => <Placeholder shot={shot} title="The clerk" />,
};
