// The toolkit demo (Task 13): 24 s on the station set showing W1-W7 in turn, for the owner to watch before any of it
// ships (Task 17). Rendered only through the render queue.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS} from '../film/Cam';
import {Grade, type GradeMood} from '../film/Grade';
import {Letterbox} from '../toolkit/Letterbox';
import {PushRim, TwoShot, FaceClose, DataBeat, type Beat} from './scenes';
import {Freeze, BlueprintCard, End} from './scenes2';

type Shot = {from: number; to: number; Scene: React.FC<Beat>; mood: GradeMood; scope?: boolean};
export const SHOTS: Shot[] = [
  {from: 0, to: 4, Scene: PushRim, mood: 'warm'},
  {from: 4, to: 8, Scene: TwoShot, mood: 'warm'},
  {from: 8, to: 11, Scene: FaceClose, mood: 'cool', scope: true},
  {from: 11, to: 14, Scene: DataBeat, mood: 'warm'},
  {from: 14, to: 17, Scene: Freeze, mood: 'cool', scope: true},
  {from: 17, to: 20.5, Scene: BlueprintCard, mood: 'blueprint'},
  {from: 20.5, to: 24, Scene: End, mood: 'void'},
];
export const TOOLKIT_FRAMES = 24 * FPS;

export const Toolkit: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shot = SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const lt = t - shot.from;
  const {Scene} = shot;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Scene lt={lt} l={lt / (shot.to - shot.from)} />
      <Grade frame={frame} mood={shot.mood} />
      {shot.scope && <Letterbox ratio={2.39} t={t} t0={shot.from} />}
    </AbsoluteFill>
  );
};
