// The per-film entry pattern (videos/<id>/remotion/index.ts), kept here so tsc proves it type-checks.
import {registerFilm} from '@suppose/kit';
import * as shots from './custom/Shots';
registerFilm(shots);
