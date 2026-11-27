// The people in a set shot: crowd bands from the set's angle and the shot's cast, each scaled to Scarf at its depth.
import React from 'react';
import type {Act} from '../actions/acts';
import {poseAt} from '../actions/index';
import {Crowd} from '../film/Crowd';
import {hAtFor, type SetAngle} from '../film/Set';
import {Person, strideAt, type PersonPose} from '../rig/Person';
import {Shadow} from '../rig/Puppet';
import {SCARF_H, personH} from '../rig/scale';
import type {CastMember} from '../rig/types';
import type {RimSpec} from '../toolkit/Rim';
import type {CastIn, FilmData, ShotData} from './types';

export const CHILD = 0.72; // a child stands at this fraction of a peer
const HERO_ROLES = ['hero', 'hero-alt'];

// Acts are written in film time (types.ts); poseAt runs on shot time, so shift `at` and `to` by the shot's start.
export const shotActs = (acts: Act[], from: number): Act[] =>
  acts.map((a) => ({...a, at: a.at === undefined ? undefined : a.at - from, to: a.to === undefined ? undefined : a.to - from}));

// Scarf (and his alternates) at the set's own scale for him, shrunk or grown with depth from his mark; everyone else
// at PEER of Scarf at that depth (hAtFor), children at CHILD of that. angle.scarf.s is the pilot's legacy scale: Scarf
// stands SCARF_H * s px tall on his mark (pilot Cast4.tsx), whatever his pieces' own height, and so does any
// alternate, so the two always match.
export const scaleFor = (angle: SetAngle, m: CastMember, y: number) => {
  const hAt = hAtFor(angle, SCARF_H);
  if (m.roles.some((r) => HERO_ROLES.includes(r))) {
    const mark = hAt(angle.scarf.y);
    const depth = mark > 0 ? hAt(y) / mark : 1;
    return (angle.scarf.s * SCARF_H * depth) / personH(m);
  }
  return (hAt(y) / personH(m)) * (m.roles.includes('child') ? CHILD : 1);
};

const seedOf = (who: string, i: number) => [...who].reduce((s, c) => s + c.charCodeAt(0), i * 17);

const MIN_SCALE = 0.03; // a member above the horizon (hAt <= 0) is drawn this small, tagged, not mirrored or dropped

const Tag: React.FC<{x: number; y: number; text: string}> = ({x, y, text}) => (
  <div style={{position: 'absolute', left: x, top: y - 40, transform: 'translateX(-50%)', whiteSpace: 'nowrap', font: '700 22px sans-serif', color: '#fff', background: '#d9435b', padding: '2px 10px', borderRadius: 8}}>{text}</div>
);

const Member: React.FC<{c: CastIn; i: number; m: CastMember; angle: SetAngle; shot: ShotData; film: FilmData; t: number; rim?: RimSpec}> = ({c, i, m, angle, shot, film, t, rim}) => {
  const [x, y] = c.at;
  const above = hAtFor(angle, SCARF_H)(y) <= 0;
  const s = Math.max(MIN_SCALE, scaleFor(angle, m, y));
  const base = m.roles.some((r) => HERO_ROLES.includes(r)) ? {big: true} : {};
  const acts = shotActs(c.acts ?? [{act: 'idle'}], shot.from);
  const rig = {torsoH: m.torso.h, stride: strideAt(m, s)};
  let pose: PersonPose, dx = 0, bad = above ? `${c.who}: above the horizon` : '';
  try {
    ({pose, dx} = poseAt(acts, t - shot.from, base, c.seed ?? seedOf(c.who, i), rig));
  } catch (e) { // a bad act never fails the frame: base pose and a visible tag naming it
    pose = base;
    bad = `${c.who}: ${(/unknown act "([^"]*)"/.exec(String(e)) ?? [])[1] ?? 'bad act'}`;
  }
  const cx = x + dx;
  return (
    <>
      <Shadow x={cx} y={y} w={m.torso.w * s * 1.4} />
      <Person parts={m} x={cx} y={y} s={s} p={pose} rim={rim} />
      {bad && <Tag x={cx} y={y - personH(m) * s} text={`? ${bad}`} />}
    </>
  );
};

// A band's people: its `kinds` (cast ids, in weighted order: repeat an id to make it common), or every crowd-role
// member of film.crowd. An id missing from the film is skipped.
export const crowdKinds = (film: FilmData, ids?: string[]): CastMember[] =>
  ids ? ids.map((id) => film.crowd?.[id] ?? film.cast?.[id]).filter((m): m is CastMember => !!m) : Object.values(film.crowd ?? {});

// Back bands, then the cast from far to near, then the front band. A cast member missing from film.cast draws nothing.
export const People: React.FC<{shot: ShotData; film: FilmData; angle: SetAngle; t: number}> = ({shot, film, angle, t}) => {
  const hAt = hAtFor(angle, SCARF_H);
  const clear = angle.clear as [number, number, number?, number?] | undefined;
  const band = (front: boolean) =>
    (shot.crowd ?? []).filter((b) => (b.band === 'front') === front && angle.crowd?.[b.band]).map((b, i) => {
      const kinds = crowdKinds(film, b.kinds);
      if (!kinds.length) return null;
      const [y0, y1] = angle.crowd![b.band];
      return <Crowd key={`${b.band}-${i}`} t={t} n={b.n} seed={b.seed ?? i * 100} y0={y0} y1={y1} hAt={hAt} speed={b.speed} kinds={kinds} clear={clear} />;
    });
  const rim = shot.rim && angle.key ? angle.key : undefined;
  const cast = (shot.cast ?? []).map((c, i) => ({c, i, m: film.cast?.[c.who]})).filter((e) => e.m).sort((a, b) => a.c.at[1] - b.c.at[1]);
  return (
    <>
      {band(false)}
      {cast.map(({c, i, m}) => <Member key={`${c.who}-${i}`} c={c} i={i} m={m!} angle={angle} shot={shot} film={film} t={t} rim={rim} />)}
      {band(true)}
    </>
  );
};
