// Rim light (W7): a thin edge of the set's key light on the side of a character that faces it.
import React from 'react';

export type RimSide = 'left' | 'right' | 'top';
export type RimSpec = {side: RimSide; color: string};

const OPACITY = 0.85;
const PX = 3;
const OFFSET: Record<RimSide, [number, number]> = {left: [-PX, 0], right: [PX, 0], top: [0, -PX]};

// '#rrggbb' gets an alpha byte; any other CSS colour is mixed toward transparent.
const withAlpha = (color: string, a: number) =>
  /^#[0-9a-f]{6}$/i.test(color) ? color + Math.round(a * 255).toString(16).padStart(2, '0') : `color-mix(in srgb, ${color} ${a * 100}%, transparent)`;

const px = (v: number) => (v === 0 ? '0' : `${v}px`);

// CSS filter for a cut-out (Person uses it): the silhouette's copy in the key colour, nudged toward the light.
export const rimFilter = ({side, color}: RimSpec) => {
  const [dx, dy] = OFFSET[side];
  return `drop-shadow(${px(dx)} ${px(dy)} 0 ${withAlpha(color, OPACITY)})`;
};

// The same rim for SVG drawings (props, diagrams): <g filter="url(#rim-left)">. One filter per side.
export const RimDefs: React.FC<{color: string}> = ({color}) => (
  <defs>
    {(Object.keys(OFFSET) as RimSide[]).map((side) => (
      <filter key={side} id={`rim-${side}`} x="-10%" y="-10%" width="120%" height="120%">
        <feOffset in="SourceAlpha" dx={OFFSET[side][0]} dy={OFFSET[side][1]} result="o" />
        <feFlood floodColor={color} floodOpacity={OPACITY} />
        <feComposite in2="o" operator="in" result="rim" />
        <feMerge>
          <feMergeNode in="rim" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    ))}
  </defs>
);
