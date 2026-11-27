import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {camAt, Letterbox, DataCard, Person, Atmosphere} from '../src/index';
import {SCARFC} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/castV4';
import {Afterimage, Badge, Blueprint, Callout, Compare, Dimension, EndScreen, Foreground, FreezeFrame, Meter, RimDefs, Thumb, rimFilter} from '../src/index';
import {BLUEPRINT, CORAL, CREAM, END_FONT, FONT, GOLD, GREEN, LABEL_FONT, NAVY, TITLE_FONT} from '../src/index';

const html = (e: React.ReactElement) => renderToStaticMarkup(e);

describe('toolkit', () => {
  it('every camera move moves (W3)', () => {
    for (const move of ['push','pull','drift','pan','roll','shake','crane','track','still']) {
      const a = camAt({move, z: [1, 1.3], focus: [640, 360], to: [800, 360]}, 0, 0);
      const b = camAt({move, z: [1, 1.3], focus: [640, 360], to: [800, 360]}, 0.5, 2);
      expect(JSON.stringify(a), move).not.toBe(JSON.stringify(b));
    }
  });
  it('letterbox is absent before t0 and present after', () => {
    expect(renderToStaticMarkup(<Letterbox ratio={2.39} t={0} t0={1} />)).toBe('');
    expect(renderToStaticMarkup(<Letterbox ratio={2.39} t={2} t0={1} />)).toContain('height');
  });
  it('a data card shows its number only once spoken', () => {
    expect(renderToStaticMarkup(<DataCard t={0.5} at={1} to={4} title="people / day" value={3500000} />)).toBe('');
    expect(renderToStaticMarkup(<DataCard t={3} at={1} to={4} title="people / day" value={3500000} />)).toContain('3,500,000');
  });
  it('rim light is off unless asked', () => {
    const off = renderToStaticMarkup(<Person parts={SCARFC} x={0} y={600} s={0.3} p={{}} />);
    const on = renderToStaticMarkup(<Person parts={SCARFC} x={0} y={600} s={0.3} p={{}} rim={{side: 'left', color: '#ffd9a0'}} />);
    expect(off).not.toContain('drop-shadow');
    expect(on).toContain('drop-shadow');
  });
  it('atmosphere is deterministic', () => {
    const a = renderToStaticMarkup(<Atmosphere kind="dust" t={1.2} seed={4} />);
    expect(a).toBe(renderToStaticMarkup(<Atmosphere kind="dust" t={1.2} seed={4} />));
  });

  // Beyond the brief.
  it('palette values and fonts', () => {
    expect([GOLD, CORAL, CREAM, BLUEPRINT, NAVY, GREEN]).toEqual(['#ffc24a', '#ff6b5a', '#f4efe6', '#7fb6ff', '#0f1d3a', '#2fbf71']);
    expect(TITLE_FONT).toContain('Fredoka');
    expect(LABEL_FONT).toContain('Nunito');
    expect(END_FONT).toContain('Playfair Display');
    expect(FONT).toBe("'Avenir Next', 'Helvetica Neue', Arial, sans-serif"); // the pilot's, for Cards and Readout parity
  });
  it('shake is an impact that settles within 0.3 s, never a constant jitter', () => {
    const at = (t: number) => camAt({move: 'shake', focus: [640, 360], at: 1, amount: 12}, 0.5, t);
    const still = (t: number) => camAt({move: 'still', focus: [640, 360]}, 0.5, t);
    expect(Math.abs(at(1.05).fx - still(1.05).fx)).toBeGreaterThan(1);
    for (const t of [0.5, 0.99, 1.31, 2, 5]) expect(at(t)).toEqual(still(t));
  });
  it('still drifts no more than 2 px', () => {
    for (let t = 0; t < 20; t += 0.37) {
      const c = camAt({move: 'still', focus: [640, 360]}, 0, t);
      expect(Math.abs(c.fx - 640)).toBeLessThanOrEqual(2);
      expect(Math.abs(c.fy - 360)).toBeLessThanOrEqual(2);
    }
  });
  it('push and pull run between the two zooms, pan reaches its target', () => {
    expect(camAt({move: 'push', z: [1, 1.3]}, 0, 0).z).toBe(1);
    expect(camAt({move: 'push', z: [1, 1.3]}, 1, 0).z).toBeCloseTo(1.3);
    expect(camAt({move: 'pull', z: [1, 1.3]}, 0, 0).z).toBeCloseTo(1.3);
    expect(camAt({move: 'pull', z: [1, 1.3]}, 1, 0).z).toBe(1);
    expect(camAt({move: 'pan', focus: [640, 360], to: [800, 360]}, 1, 0).fx).toBeCloseTo(800, -1);
    expect(() => camAt({move: 'dolly-zoom'}, 0, 0)).toThrow(/dolly-zoom/);
  });
  it('far limbs are shaded only when asked', () => {
    const off = html(<Person parts={SCARFC} x={0} y={600} s={0.3} p={{}} />);
    const on = html(<Person parts={SCARFC} x={0} y={600} s={0.3} p={{}} farShade={0.2} />);
    expect(off).not.toContain('brightness');
    expect(on.match(/brightness\(0\.8\)/g)?.length).toBe(2); // the far thigh (its shin rides inside) and the far arm
  });
  it('rim sides offset toward the light, with the colour at 85%', () => {
    expect(rimFilter({side: 'left', color: '#ffd9a0'})).toBe('drop-shadow(-3px 0 0 #ffd9a0d9)');
    expect(rimFilter({side: 'right', color: '#ffd9a0'})).toBe('drop-shadow(3px 0 0 #ffd9a0d9)');
    expect(rimFilter({side: 'top', color: '#ffd9a0'})).toBe('drop-shadow(0 -3px 0 #ffd9a0d9)');
    const defs = html(<svg><RimDefs color="#ffd9a0" /></svg>);
    for (const id of ['rim-left', 'rim-right', 'rim-top']) expect(defs).toContain(`id="${id}"`);
  });
  it('every atmosphere draws, and changes with time', () => {
    for (const kind of ['dust', 'rain', 'fog', 'rays', 'streak', 'stars'] as const) {
      const a = html(<Atmosphere kind={kind} t={1} seed={2} />);
      expect(a.length, kind).toBeGreaterThan(100);
      expect(a, kind).not.toBe(html(<Atmosphere kind={kind} t={2} seed={2} />));
    }
  });
  it('freeze frame flashes white for three frames, then holds tinted with its badge', () => {
    const at = (t: number) => html(<FreezeFrame t={t} t0={2} t1={4} badge="100x"><i /></FreezeFrame>);
    expect(at(1.9)).toBe('<i></i>');
    expect(at(2.02)).toContain('#fff');
    expect(at(2.2)).not.toContain('background:#fff');
    expect(at(2.5)).toContain('100x');
    expect(at(4)).toBe('<i></i>');
  });
  it('afterimage draws four fading copies behind the live one', () => {
    const seen: number[] = [];
    const out = html(<Afterimage trail={0.05} render={(dt) => { seen.push(dt); return <b>{dt}</b>; }} />);
    expect(seen.map((d) => +d.toFixed(2))).toEqual([-0.2, -0.15, -0.1, -0.05, 0]);
    expect(out.match(/opacity/g)?.length).toBe(4);
  });
  it('data graphics pop in and are gone at their end', () => {
    const items = (t: number) => [
      <Compare key="c" t={t} at={1} to={3} a={{label: 'you', value: 100}} b={{label: 'them', value: 3500}} x={100} y={100} />,
      <Dimension key="d" t={t} at={1} to={3} x1={0} y1={0} x2={100} y2={0} label="1.7 m" />,
      <Callout key="o" t={t} at={1} to={3} x={10} y={10} lx={200} ly={50} text="you" />,
      <Meter key="m" t={t} at={1} to={3} x={0} y={0} value={0.5} label="fuel" />,
      <Badge key="b" t={t} at={1} to={3} x={0} y={0} text="100x" />,
    ];
    items(0.5).forEach((e) => expect(html(e)).toBe(''));
    items(3).forEach((e) => expect(html(e)).toBe(''));
    items(2).forEach((e) => expect(html(e).length).toBeGreaterThan(20));
  });
  it('the data card counts up over 0.6 s', () => {
    expect(html(<DataCard t={1.3} at={1} to={4} title="x" value={1000} />)).not.toContain('1,000');
    expect(html(<DataCard t={1.61} at={1} to={4} title="x" value={1000} />)).toContain('1,000');
  });
  it('blueprint, end screen, thumbnail and foreground render their parts', () => {
    expect(html(<Blueprint t={1}><g id="art" /></Blueprint>)).toContain('id="art"');
    expect(html(<Blueprint t={1} />)).toContain(NAVY);
    const end = html(<EndScreen t={3} question="Would you take it?" cast={<i id="cast" />} />);
    expect(end).toContain('Would you take it?');
    expect(end).toContain('id="cast"');
    expect(end).toContain('Subscribe');
    const th = html(<Thumb art="thumbs/a.png" caption="ONLY 100" number="100" />);
    expect(th).toContain('/public/thumbs/a.png');
    expect(th).toContain('ONLY 100');
    expect(html(<Foreground x={0} y={0} blur={9}><i /></Foreground>)).toContain('blur(9px)');
  });
  it('every demo shot renders across its length (no render, markup only)', async () => {
    const {SHOTS} = await import('../src/demo/Toolkit');
    expect(SHOTS[SHOTS.length - 1].to).toBe(24);
    for (const {from, to, Scene} of SHOTS) {
      for (const k of [0, 0.3, 0.6, 0.99]) {
        const lt = (to - from) * k;
        expect(html(<Scene lt={lt} l={k} />).length, `${Scene.name} @${lt}`).toBeGreaterThan(200);
      }
    }
  });
});
