// Beat "Sunday" (script.md, ## [..] Sunday), from narration line 45. STUB: replace with the scene.
import { Placeholder } from "./Placeholder";
import type { Beat } from "../shared";

export const sunday: Beat = {
  id: "sunday",
  firstLine: 45,
  Component: ({ shot }) => <Placeholder shot={shot} title="Sunday" />,
};
