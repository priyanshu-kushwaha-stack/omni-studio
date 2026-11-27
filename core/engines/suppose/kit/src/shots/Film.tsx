// The whole film from film.json: the shot covering the current frame (sheet or custom), the grade in that shot's mood,
// and the mix. FilmFrame is the pure part (frame in, picture out) so it renders in tests without a Remotion player.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Grade} from '../film/Grade';
import {Placeholder} from './frames';
import {ShotView} from './ShotView';
import type {FilmData, Shot, ShotData} from './types';

export type FilmProps = FilmData & {customs: Record<string, Shot>};

// The shot covering t; in a gap between shots (or after the last) the previous shot holds, never a black frame.
export const shotAt = (shots: ShotData[], t: number): ShotData | undefined =>
  shots.find((s) => t >= s.from && t < s.to) ?? shots.filter((s) => s.from <= t).sort((a, b) => b.from - a.from)[0];

export const FilmFrame: React.FC<FilmProps & {frame: number}> = ({customs, frame, ...film}) => {
  const t = frame / film.fps;
  const shot = shotAt(film.shots, t);
  const Custom = shot?.custom ? customs[shot.custom] : undefined;
  let body: React.ReactNode = null;
  if (shot && Custom) body = <Custom t={t} l={t - shot.from} film={film} />;
  else if (shot?.custom) body = <Placeholder shot={shot} what={`custom shot ${shot.custom}`} />;
  else if (shot) body = <ShotView shot={shot} film={film} t={t} />;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {body}
      <Grade frame={frame} mood={shot?.mood} />
    </AbsoluteFill>
  );
};

export const Film: React.FC<FilmProps> = (props) => {
  const frame = useCurrentFrame();
  return (
    <>
      <FilmFrame {...props} frame={frame} />
      {props.audio && <Audio src={staticFile(props.audio)} />}
    </>
  );
};
