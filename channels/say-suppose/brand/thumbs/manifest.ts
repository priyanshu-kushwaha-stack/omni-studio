// Dumps the candidates, with the hero's head on screen, as JSON for check.py and the review page.
//   cd core/engines/whatif && pnpm exec tsx ../../../channels/say-suppose/brand/thumbs/manifest.ts > <out.json>
import { CANDIDATES, headOf } from "./batch1";

console.log(JSON.stringify(CANDIDATES.map((c) => ({ ...c, head: headOf(c.hero) })), null, 1));
