// film.json as sheetcheck.emit writes it (format: core/engines/suppose/scripts/sheet.py), and the type a hand-built
// shot exports: `export const S2: Shot = ({t, l, film}) => ...` in videos/<id>/custom/Shots.tsx (or a sibling file it
// imports), which the film's entry videos/<id>/remotion/index.ts imports as `../custom/Shots`.
//
// Time: every `at` and `to` in a shot (acts, labels, lines, sfx, readout) is on the narration timeline, in film seconds,
// like the shot's own `from` and `to`; sheetcheck's hold check compares act `at` against `from`/`to` on that clock.
// ShotView shifts acts to shot time (shotActs) before poseAt, so idle blinks restart with each shot.
import type React from 'react';
import type {Act} from '../actions/acts';
import type {CastMember} from '../rig/types';
import type {SetAngle} from '../film/Set';
import type {CameraSpec} from '../toolkit/camera';
import type {GradeMood} from '../film/Grade';
import type {AtmosphereKind} from '../toolkit/Atmosphere';

export type CastIn = {who: string; at: [number, number]; acts?: Act[]; focus?: boolean; seed?: number};
export type CrowdIn = {band: string; n: number; speed: number; seed?: number; kinds?: string[]}; // kinds: cast ids, weighted by repeats

// Labels (W5). Positions are optional; each kind has a default spot clear of the pill and the readout.
export const LABEL_KINDS = ['data', 'dim', 'callout', 'pill'] as const; // sheet.py LABEL_KINDS (vocab.test.ts)
export type LabelIn = {
  kind: (typeof LABEL_KINDS)[number];
  text: string;
  says?: string;
  at: number;
  to?: number; // default at + 3, as sheetcheck assumes
  title?: string; // data: the line under the number
  unit?: string; // pill: shown after the text in `accent`
  accent?: string;
  source?: string;
  x?: number; y?: number; // data/pill corner; dim start; callout dot
  x2?: number; y2?: number; // dim end
  lx?: number; ly?: number; // callout label
};

export type ShotData = {
  id: string;
  from: number;
  to: number;
  type: string; // one of SHOT_TYPES in sheet.py
  set?: string;
  angle?: string;
  camera?: CameraSpec;
  mood?: GradeMood;
  cast?: CastIn[];
  crowd?: CrowdIn[];
  lines?: {who: string; at: number}[];
  labels?: LabelIn[];
  readout?: {text: string; at: number; x?: number; y?: number};
  sfx?: {name: string; at: number; gain?: number}[];
  letterbox?: 'scope' | null;
  atmosphere?: AtmosphereKind | {kind: AtmosphereKind; seed?: number; strength?: number};
  rim?: boolean; // rim light from the angle's key; off by default so a pilot rebuild stays unlit
  hold?: string;
  custom?: string;
  text?: string; // title: the words; end: the closing question
  badge?: string; // freeze: the corner badge
};

export type SetData = {id: string; place?: string; ambience?: string; angles: Record<string, SetAngle>};

export type FilmData = {
  film: string;
  fps: number;
  size: [number, number];
  duration: number; // seconds: the last shot's `to`
  audio: string; // video-relative (audio/mix.wav); the render stages it into the one public dir
  beats: {at: number; name: string}[];
  shots: ShotData[];
  cast: Record<string, CastMember>;
  crowd: Record<string, CastMember>; // library cast with the crowd role
  sets: Record<string, SetData>;
  props: Record<string, unknown>;
  warp?: {old: number[]; new: number[]}; // film-luc.json only (timewarp.py): knots, voice B seconds -> final seconds
};

// t: film seconds; l: seconds into the shot. A custom shot always gets voice B (sheet) seconds: on film-luc.json
// FilmFrame unwarps t and the shot's start through `warp`, so a body written against shots.yaml times stays in sync.
export type Shot = React.FC<{t: number; l: number; film: FilmData}>;
