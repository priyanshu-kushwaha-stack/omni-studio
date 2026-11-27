import type {Parts} from './types';
export const SCARF_H = 1357;
export const MAN_H = 1712;
export const PEER = 0.88;
export const personH = (p: Parts) => p.thighL.h * 0.86 + p.shinL.h * 0.95 + p.torso.h * (p.hip ?? 0.9) + p.head.h * 0.95;
