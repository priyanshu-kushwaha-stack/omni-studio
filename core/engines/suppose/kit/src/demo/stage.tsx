// Staging helpers for the toolkit demo: the station set and cast from the channel library, an acting puppet, and a
// shot frame that applies a camera move (zoom, focus and roll). Paths are library-relative, for staticFile.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import castJson from '../../../../../../channels/say-suppose/library/cast/cast.json';
import stationJson from '../../../../../../channels/say-suppose/library/sets/station/set.json';
import type {CastMember, Parts} from '../rig/types';
import type {PersonPose} from '../rig/Person';
import {Person, strideAt} from '../rig/Person';
import {Shadow} from '../rig/Puppet';
import {personH, SCARF_H} from '../rig/scale';
import {View} from '../film/Cam';
import {scaleFor} from '../shots/people';
import {hAtFor, type SetAngle} from '../film/Set';
import {poseAt, type Act} from '../actions/index';
import type {RimSpec} from '../toolkit/Rim';
import type {CamState} from '../toolkit/camera';

export const CAST = castJson as unknown as Record<string, CastMember>;
export const STATION = stationJson.angles as unknown as Record<'wide' | 'high' | 'close', SetAngle>;
export const KINDS: Parts[] = ['salary', 'office', 'student', 'gent', 'gran', 'salary', 'office', 'packer', 'gran', 'worker'].map((k) => CAST[k]);

// Scale for a cast member whose feet are at y on an angle, matched to Scarf at the same depth.
// Scarf on his mark uses angle.scarf.s.
export const scaleAt = (angle: SetAngle, parts: Parts, y: number) => hAtFor(angle, SCARF_H)(y) / personH(parts);

// Scarf's scale on an angle: the renderer's own scaleFor (the set's legacy s at SCARF_H, shrunk or grown with depth
// from his mark), so the demo draws him as the film does. y defaults to his mark.
export const scarfScale = (angle: SetAngle, y: number = angle.scarf.y) => scaleFor(angle, CAST.scarf, y);

// A puppet acting from a list of acts; (x, y) is the centre of its feet on its mark.
export const Actor: React.FC<{parts: Parts; x: number; y: number; s: number; t: number; acts: Act[]; seed?: number; base?: Partial<PersonPose>; rim?: RimSpec; farShade?: number; shadow?: boolean}> = ({
  parts, x, y, s, t, acts, seed = 0, base = {}, rim, farShade, shadow = true,
}) => {
  const {pose, dx} = poseAt(acts, t, base, seed, {torsoH: parts.torso.h, stride: strideAt(parts, s)});
  const cx = x + dx;
  return (
    <>
      {shadow && <Shadow x={cx} y={y} w={parts.torso.w * s * 1.4} />}
      <Person parts={parts} x={cx} y={y} s={s} p={pose} rim={rim} farShade={farShade} />
    </>
  );
};

// One shot through the camera: background plate on the parallax layer, the action on the near one, rolled about the
// centre (scaled a touch so the corners never show).
export const Shot: React.FC<{cam: CamState; bg: React.ReactNode; children: React.ReactNode}> = ({cam, bg, children}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
    <AbsoluteFill style={{transform: `rotate(${cam.roll}deg) scale(${1 + Math.abs(cam.roll) * 0.03})`}}>
      <View z={cam.z} fx={cam.fx} fy={cam.fy} bg={bg}>
        {children}
      </View>
    </AbsoluteFill>
  </AbsoluteFill>
);
