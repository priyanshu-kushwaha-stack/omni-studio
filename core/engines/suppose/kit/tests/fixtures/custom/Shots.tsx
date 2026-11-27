// A dummy custom shot, shaped like videos/<id>/remotion/custom/Shots.tsx. Type-checked only (tsc), never rendered.
import React from 'react';
import type {Shot} from '@suppose/kit';

export const S2: Shot = ({t, l, film}) => <div>{film.film} {t.toFixed(2)} {l.toFixed(2)}</div>;
