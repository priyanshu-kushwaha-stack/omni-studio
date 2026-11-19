// Dumps the candidates, with the hero's head on screen, as JSON for ../check.py.
//   cd core/engines/whatif && pnpm exec tsx ../../../channels/say-suppose/brand/thumbs/brainrent/manifest.ts > <out.json>
// The hero lies on his back, so the head comes from data.ts (HEAD), not from the standing rig's headOf.
import { CANDIDATES, HEAD } from "./data";

console.log(JSON.stringify(CANDIDATES.map((c) => ({ ...c, head: HEAD })), null, 1));
