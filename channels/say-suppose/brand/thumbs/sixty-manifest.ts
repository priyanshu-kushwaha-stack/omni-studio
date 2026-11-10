// Dumps the sixty-seconds candidates, with the hero's head on screen, as JSON for check.py.
//   cd core/engines/whatif && pnpm exec tsx ../../../channels/say-suppose/brand/thumbs/sixty-manifest.ts > <out.json>
import { headOf } from "./batch1";
import { SIXTY } from "./sixty";

console.log(JSON.stringify(SIXTY.map((c) => ({ ...c, head: headOf(c.hero) })), null, 1));
