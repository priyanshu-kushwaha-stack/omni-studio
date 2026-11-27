// One shot of a film from its sheet entry. A set shot is the plate on the parallax layer (k 0.6) and the people on the
// near one, through the shot's camera; then labels, readout, atmosphere and scope bars in screen space. Shots without a
// set draw their toolkit frame full screen. The grade is Film's, so custom shots get it too.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {View} from '../film/Cam';
import {SetPlate, type SetAngle} from '../film/Set';
import {camAt} from '../toolkit/camera';
import {FreezeFrame} from '../toolkit/FreezeFrame';
import {FullFrame, Placeholder} from './frames';
import {Air, Labels, Scope} from './overlays';
import {People} from './people';
import type {FilmData, ShotData} from './types';

// View pins the focus to the frame centre at z = 1 (clampF), which would make drift, pan, track and crane stand still.
// Every shot moves (W3), so the camera never goes wider than this.
export const Z_FLOOR = 1.03;
const FULL_FRAME = ['data', 'blueprint', 'title', 'end'];

const SetScene: React.FC<{shot: ShotData; film: FilmData; angle: SetAngle; t: number}> = ({shot, film, angle, t}) => {
  const l = (t - shot.from) / Math.max(1e-6, shot.to - shot.from);
  const cam = camAt(shot.camera ?? {move: 'still'}, l, t);
  const z = Math.min(angle.bounds?.zmax ?? Infinity, Math.max(Z_FLOOR, cam.z));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `rotate(${cam.roll}deg) scale(${1 + Math.abs(cam.roll) * 0.03})`}}>
        <View z={z} fx={cam.fx} fy={cam.fy} bg={<SetPlate angle={angle} />}>
          <People shot={shot} film={film} angle={angle} t={t} />
        </View>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ShotView: React.FC<{shot: ShotData; film: FilmData; t: number}> = ({shot, film, t}) => {
  if (FULL_FRAME.includes(shot.type)) return <FullFrame shot={shot} t={t} />;
  if (shot.custom || shot.type === 'custom') return <Placeholder shot={shot} what={`custom shot ${shot.custom ?? '(no name)'}`} />;
  const angle = film.sets?.[shot.set ?? '']?.angles?.[shot.angle ?? ''];
  if (!angle) return <Placeholder shot={shot} what={`set ${shot.set ?? '?'} / ${shot.angle ?? '?'}`} />;
  // A freeze holds the picture as it was at the cut; labels and the badge still run.
  const scene = <SetScene shot={shot} film={film} angle={angle} t={shot.type === 'freeze' ? shot.from : t} />;
  return (
    <>
      {shot.type === 'freeze' ? <FreezeFrame t={t} t0={shot.from} t1={shot.to} badge={shot.badge}>{scene}</FreezeFrame> : scene}
      <Air shot={shot} t={t} />
      <Labels shot={shot} t={t} />
      <Scope shot={shot} t={t} />
    </>
  );
};
