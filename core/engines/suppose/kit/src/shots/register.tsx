// A film's Remotion entry: videos/<id>/remotion/index.ts is
//   import {registerRoot} from 'remotion'; import {filmRoot} from '@suppose/kit'; import * as shots from './custom/Shots';
//   registerRoot(filmRoot(shots));
// registerRoot stays in the entry file itself: the Remotion CLI refuses an entry whose text lacks the word.
// and the render passes film.json as the input props; length, rate and size come from it.
import React from 'react';
import {Composition, type CalculateMetadataFunction} from 'remotion';
import {Film} from './Film';
import type {FilmData, Shot} from './types';

export const EMPTY_FILM: FilmData = {
  film: '', fps: 30, size: [1280, 720], duration: 1, audio: '', beats: [], shots: [], cast: {}, crowd: {}, sets: {}, props: {},
};

export const filmMetadata: CalculateMetadataFunction<FilmData> = ({props}) => ({
  durationInFrames: Math.max(1, Math.ceil(props.duration * props.fps)),
  fps: props.fps,
  width: props.size[0],
  height: props.size[1],
});

// Module namespaces (`import * as shots`) carry non-shot exports too; keep the functions.
const onlyShots = (customs: Record<string, unknown>): Record<string, Shot> =>
  Object.fromEntries(Object.entries(customs).filter(([, v]) => typeof v === 'function')) as Record<string, Shot>;

export const filmRoot = (customs: Record<string, unknown>): React.FC => {
  const shots = onlyShots(customs);
  const FilmWithShots: React.FC<FilmData> = (p) => <Film {...p} customs={shots} />;
  return () => <Composition id="Film" component={FilmWithShots} defaultProps={EMPTY_FILM} calculateMetadata={filmMetadata} />;
};
