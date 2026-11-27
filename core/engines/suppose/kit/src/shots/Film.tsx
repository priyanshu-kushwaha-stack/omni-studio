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

// Final-narration seconds -> voice B (sheet) seconds through film-luc.json's warp knots (timewarp.py), linear between
// knots; past the last knot time runs 1:1, as the pilot's toOld did. With no warp (film.json) time is unchanged.
export const unwarp = (t: number, warp?: FilmData['warp']): number => {
  if (!warp || warp.new.length < 2 || t <= 0) return t;
  const {old, new: nu} = warp;
  for (let i = 1; i < nu.length; i++) {
    if (t <= nu[i]) return nu[i] === nu[i - 1] ? old[i] : old[i - 1] + ((t - nu[i - 1]) / (nu[i] - nu[i - 1])) * (old[i] - old[i - 1]);
  }
  return old[old.length - 1] + (t - nu[nu.length - 1]);
};

export const FilmFrame: React.FC<FilmProps & {frame: number}> = ({customs, frame, ...film}) => {
  const t = frame / film.fps;
  const shot = shotAt(film.shots, t);
  const Custom = shot?.custom ? customs[shot.custom] : undefined;
  let body: React.ReactNode = null;
  // Custom shots are written on the voice B clock: unwarp t and the shot's start, so after G3 they still see it.
  const T = unwarp(t, film.warp);
  if (shot && Custom) body = <Custom t={T} l={T - unwarp(shot.from, film.warp)} film={film} />;
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
