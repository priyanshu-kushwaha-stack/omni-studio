// The named faces (W2: expressions change on the word that earns them). Each mood is a face on top of NEUTRAL_FACE,
// so a new mood replaces the last one whole. Values use PersonPose's ranges: open 1 normal .. 1.3 wide, browLift
// 0..30, browSad 0..25 (inner ends up; a negative value pulls them down into a scowl), mouth 0 closed .. 1 open "o",
// smile -1..1, lid 0 open .. 1 shut. BigFace draws every key (Scarf); FaceMarks draws eyes, brows and mouth.
import type {PersonPose} from '../rig/Person';

export type Mood =
  | 'neutral' | 'smile' | 'happy' | 'joy' | 'surprised' | 'shocked' | 'scared' | 'worried' | 'nervous'
  | 'angry' | 'determined' | 'sad' | 'cry' | 'smirk' | 'sleepy' | 'thinking' | 'confused' | 'awe';

export type FaceKeys = 'open' | 'browLift' | 'browSad' | 'mouth' | 'smile' | 'lid' | 'pupil' | 'headTilt' | 'headDip';
export type MoodFace = Pick<PersonPose, FaceKeys>;

// The rest face; smile 0.3 is BigFace's own default.
export const NEUTRAL_FACE: Required<MoodFace> = {open: 1, browLift: 0, browSad: 0, mouth: 0, smile: 0.3, lid: 0, pupil: [0, 0], headTilt: 0, headDip: 0};

export const MOOD_FACE: Record<Mood, Partial<MoodFace>> = {
  neutral: {},
  smile: {smile: 0.55},
  happy: {smile: 0.8, browLift: 6, open: 1.05},
  joy: {smile: 1, lid: 0.45, browLift: 10, headTilt: -4}, // eyes close into ^ ^
  surprised: {open: 1.2, browLift: 22, mouth: 0.45, smile: 0},
  shocked: {open: 1.3, browLift: 30, mouth: 0.8, smile: 0},
  scared: {open: 1.25, browLift: 18, browSad: 18, mouth: 0.5, smile: -0.4, headDip: 4},
  worried: {browLift: 4, browSad: 16, smile: -0.3},
  nervous: {browSad: 12, smile: -0.15, lid: 0.1, pupil: [0.55, 0.1]}, // a sideways glance
  angry: {browSad: -14, lid: 0.3, smile: -0.7, headDip: 5},
  determined: {browSad: -8, lid: 0.2, smile: 0.1, headDip: 3},
  sad: {browSad: 20, smile: -0.6, lid: 0.2},
  cry: {browSad: 25, smile: -0.9, lid: 0.45, mouth: 0.3, headDip: 7},
  smirk: {smile: 0.6, lid: 0.25, browLift: 6},
  sleepy: {lid: 0.6, smile: 0},
  thinking: {pupil: [0.6, -0.7], browLift: 10, smile: 0.05, headTilt: -6},
  confused: {browLift: 12, browSad: 10, smile: -0.2, headTilt: 8, pupil: [-0.3, 0]},
  awe: {open: 1.25, browLift: 22, mouth: 0.5, smile: 0},
};

// A mood's whole face. Head keys a mood leaves unset fall back to the shot's base pose, not to zero.
export const faceFor = (mood: Mood, base: Partial<PersonPose> = {}): Required<MoodFace> => ({
  ...NEUTRAL_FACE,
  headTilt: base.headTilt ?? 0,
  headDip: base.headDip ?? 0,
  ...MOOD_FACE[mood],
});
