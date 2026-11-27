// The per-film entry pattern (videos/<id>/remotion/index.ts), kept here so tsc proves it type-checks.
// registerRoot must appear in this file's own text: the Remotion CLI refuses an entry without it.
import {registerRoot} from 'remotion';
import {filmRoot} from '@suppose/kit';
import * as shots from './custom/Shots';
registerRoot(filmRoot(shots));
