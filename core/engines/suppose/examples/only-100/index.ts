// The only-100 rebuild's Remotion entry; the render passes film-luc.json as --props.
import {registerRoot} from 'remotion';
import {filmRoot} from '@suppose/kit';
import * as shots from './custom/Shots';
registerRoot(filmRoot(shots));
