// The only-100 rebuild's Remotion entry; the render passes film-luc.json as --props.
// registerFilm calls Remotion's registerRoot. The CLI refuses an entry file whose text lacks the word "registerRoot",
// so this comment carries it.
import {registerFilm} from '@suppose/kit';
import * as shots from './custom/Shots';
registerFilm(shots);
