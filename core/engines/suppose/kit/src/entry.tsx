// The kit's own Remotion entry (Toolkit demo and Thumb) for the studio and the demo render. src/index.ts stays the
// library export; a film's entry calls registerFilm instead (shots/register.tsx).
import {registerRoot} from 'remotion';
import {Root} from './Root';

registerRoot(Root);
