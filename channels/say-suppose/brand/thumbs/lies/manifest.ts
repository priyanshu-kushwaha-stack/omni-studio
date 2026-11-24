// Dumps the candidates, with the hero's head on screen, as JSON for ../check.py.
//   cd core/engines/whatif && pnpm exec tsx ../../../channels/say-suppose/brand/thumbs/lies/manifest.ts > <out.json>
import { CANDIDATES, headOf } from "./data";

console.log(JSON.stringify(CANDIDATES.map((c) => ({ ...c, head: headOf(c.hero) })), null, 1));
