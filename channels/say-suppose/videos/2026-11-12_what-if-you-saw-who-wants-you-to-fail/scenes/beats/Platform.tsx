import type { Beat, Shot } from "../shared";
import { Placeholder } from "./Placeholder";

/** The Platform (script.md "## [00:00] The Platform"), the opening skit, line 0 and the holds around it. */
const Scene: React.FC<{ shot: Shot }> = ({ shot }) => <Placeholder shot={shot} title="The Platform" />;

export const platform: Beat = { id: "Platform", firstLine: 0, Component: Scene };
