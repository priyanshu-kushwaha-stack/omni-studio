// Look (b): soft 3D toy world (rounded primitives, warm key light, fog). Same shots and beats as look (a).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {FPS, SHOT, inShot} from './timing';
import {isBlink} from './Scarf2D';
import {rnd} from './People2D';
import {FactPill, Grade} from './Overlays';

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const lerp = (t: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(t, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

const SKIN = ['#f1c9a5', '#e0ac85', '#c98d66', '#f5d6bd', '#a8714d'];
const SUIT = ['#2b3247', '#3a4157', '#4a4f63', '#23283a', '#55596b', '#3d3a4a'];

const Eye: React.FC<{x: number; r: number; look: [number, number]; blink: boolean; pupil?: string}> = ({x, r, look, blink, pupil = '#111'}) => (
  <group position={[x, 0, 0]}>
    <mesh scale={[1, blink ? 0.12 : 1, 0.5]}>
      <sphereGeometry args={[r, 24, 16]} />
      <meshStandardMaterial color="#ffffff" roughness={0.3} />
    </mesh>
    {!blink && (
      <mesh position={[look[0] * r * 0.45, look[1] * r * 0.45, r * 0.42]}>
        <sphereGeometry args={[r * 0.48, 16, 12]} />
        <meshStandardMaterial color={pupil} roughness={0.2} />
      </mesh>
    )}
  </group>
);

// "You": black sphere head, dark coat capsule, green torus scarf with a tail. Height ~1.7 units, feet at y 0.
const Scarf3D: React.FC<{t: number; look: [number, number]; shocked?: boolean; worried?: boolean; lean?: number; armsUp?: boolean; blink: boolean}> = ({
  t, look, shocked, worried, lean = 0, armsUp, blink,
}) => {
  const br = Math.sin(t * 2.2) * 0.01;
  const er = shocked ? 0.13 : 0.11;
  const brow = shocked ? 0.1 : worried ? 0.05 : 0;
  const armRot = armsUp ? 2.4 : 0.2;
  return (
    <group rotation={[0, 0, (lean * Math.PI) / 180]}>
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.25, 0]}>
          <capsuleGeometry args={[0.05, 0.4, 6, 12]} />
          <meshStandardMaterial color="#14141c" />
        </mesh>
      ))}
      <group position={[0, br, 0]}>
        <mesh position={[0, 0.78, 0]}>
          <capsuleGeometry args={[0.24, 0.32, 8, 20]} />
          <meshStandardMaterial color="#3a3f4b" roughness={0.8} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.27, 1.0, 0]} rotation={[0, 0, s * armRot]}>
            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.06, 0.32, 6, 12]} />
              <meshStandardMaterial color="#2a2e37" />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.07, 12, 32]} />
          <meshStandardMaterial color="#2fbf71" roughness={0.6} />
        </mesh>
        <mesh position={[0.17, 0.92, 0.15]} rotation={[0.2, 0, -0.3 + Math.sin(t * 1.7) * 0.15]}>
          <boxGeometry args={[0.12, 0.34, 0.05]} />
          <meshStandardMaterial color="#2fbf71" roughness={0.6} />
        </mesh>
        <group position={[0, 1.48, 0]}>
          <mesh>
            <sphereGeometry args={[0.4, 48, 32]} />
            <meshStandardMaterial color="#17171f" roughness={0.35} metalness={0.1} />
          </mesh>
          <group position={[0, 0.02, 0.33]}>
            <Eye x={-0.15} r={er} look={look} blink={blink} />
            <Eye x={0.15} r={er} look={look} blink={blink} />
          </group>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.15, 0.2 + brow, 0.35]} rotation={[0, 0, -s * (worried ? 0.3 : 0)]}>
              <boxGeometry args={[0.14, 0.025, 0.02]} />
              <meshStandardMaterial color="#f4f1ea" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

const Person3D: React.FC<{i: number; phase: number; walking: boolean; look?: [number, number]; riceUp?: number}> = ({i, phase, walking, look = [0, 0], riceUp}) => {
  const skin = SKIN[Math.floor(rnd(i, 1) * SKIN.length)];
  const suit = SUIT[Math.floor(rnd(i, 3) * SUIT.length)];
  const sw = walking ? Math.sin(phase) * 0.45 : 0;
  const bob = walking ? Math.abs(Math.cos(phase)) * 0.03 : 0;
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.1, 0.8, 0]} rotation={[s * sw, 0, 0]}>
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.07, 0.65, 6, 10]} />
            <meshStandardMaterial color="#1d2030" />
          </mesh>
        </group>
      ))}
      <group position={[0, bob, 0]}>
        <mesh position={[0, 1.15, 0]}>
          <capsuleGeometry args={[0.22, 0.45, 8, 16]} />
          <meshStandardMaterial color={suit} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.27, 0.2]}>
          <boxGeometry args={[0.07, 0.3, 0.02]} />
          <meshStandardMaterial color="#e8e8ee" />
        </mesh>
        {riceUp !== undefined && (
          <group position={[-0.25, 1.0 + riceUp * 0.55, 0.15 + riceUp * 0.15]}>
            <mesh rotation={[0, 0, 0]}>
              <coneGeometry args={[0.1, 0.16, 3]} />
              <meshStandardMaterial color="#f6f3ea" />
            </mesh>
            <mesh position={[0, -0.05, 0.03]}>
              <boxGeometry args={[0.1, 0.06, 0.07]} />
              <meshStandardMaterial color="#1f2a1f" />
            </mesh>
          </group>
        )}
        <group position={[0, 1.72, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 32, 24]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.07, -0.02]} scale={[1.04, 0.75, 1.04]}>
            <sphereGeometry args={[0.245, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#1b1b22" roughness={0.9} />
          </mesh>
          {[-0.08, 0.08].map((x) => (
            <mesh key={x} position={[x + look[0] * 0.02, 0.01 + look[1] * 0.02, 0.225]}>
              <sphereGeometry args={[0.022, 10, 8]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

const Station3D: React.FC<{t: number}> = ({t}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 40]} />
      <meshStandardMaterial color="#6b5862" roughness={0.6} />
    </mesh>
    <mesh position={[0, 4, -8]}>
      <planeGeometry args={[60, 10]} />
      <meshStandardMaterial color="#3b3550" />
    </mesh>
    {/* departures board */}
    <mesh position={[0, 4.2, -7.9]}>
      <boxGeometry args={[4.6, 1.9, 0.1]} />
      <meshStandardMaterial color="#11141f" emissive="#ffb347" emissiveIntensity={0.08} />
    </mesh>
    {[0, 1, 2, 3].map((r) => (
      <mesh key={r} position={[0, 4.8 - r * 0.4, -7.83]}>
        <planeGeometry args={[4.1, 0.16]} />
        <meshBasicMaterial color={['#ffb347', '#ffd27a', '#ff8a5c', '#9be37a'][r]} />
      </mesh>
    ))}
    <mesh position={[-4.2, 4.4, -7.9]}>
      <boxGeometry args={[1.6, 0.5, 0.08]} />
      <meshBasicMaterial color="#ffd23f" />
    </mesh>
    {[-9, -3, 3, 9].map((x) => (
      <mesh key={x} position={[x, 8.6, -3]}>
        <boxGeometry args={[3, 0.1, 0.4]} />
        <meshBasicMaterial color="#fff4dc" />
      </mesh>
    ))}
    {[-7, 7].map((x) => (
      <group key={x}>
        <mesh position={[x, 4, -6.5]}>
          <boxGeometry args={[0.9, 9, 0.9]} />
          <meshStandardMaterial color="#252a40" />
        </mesh>
        <mesh position={[x, 3.5, -6.0]}>
          <boxGeometry args={[0.92, 0.5, 0.1]} />
          <meshBasicMaterial color="#2fbf71" />
        </mesh>
      </group>
    ))}
    <pointLight position={[0, 3, 2]} intensity={2 + Math.sin(t * 0.7) * 0.1} color="#ffcf99" distance={14} />
  </group>
);

type Lane = {z: number; n: number; speed: number; seed: number};
const Crowd3D: React.FC<{t: number; lane: Lane; clear?: boolean; hide?: boolean; dense?: number}> = ({t, lane, clear, hide, dense = 1}) => {
  const span = 26;
  const n = Math.round(lane.n * dense);
  return (
    <group>
      {Array.from({length: n}).map((_, k) => {
        const i = k + lane.seed;
        const dir = rnd(i, 7) > 0.5 ? 1 : -1;
        const sp = lane.speed * (0.8 + rnd(i, 8) * 0.5);
        const x = ((((rnd(i, 9) * span + dir * sp * t) % span) + span) % span) - span / 2;
        const z = lane.z + (rnd(i, 10) - 0.5) * 1.2;
        if (clear && Math.abs(x) < 0.8 && Math.abs(z) < 1.2) return null;
        if (hide && Math.abs(x) < 3) return null;
        return (
          <group key={k} position={[x, 0, z]} rotation={[0, (dir * Math.PI) / 2, 0]} scale={0.9 + rnd(i, 4) * 0.2}>
            <Person3D i={i} phase={t * sp * 3 + i} walking />
          </group>
        );
      })}
    </group>
  );
};

export const LookB: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const close = inShot(t, SHOT.close);

  // camera: [x, y, z] and look-at y
  let cam: [number, number, number] = [0, 3.2, 11];
  let target: [number, number, number] = [0, 1.4, 0];
  if (inShot(t, SHOT.wide)) cam = [lerp(t, 0, 3.77, -1.5, 0), 3.4, lerp(t, 0, 3.77, 12, 10)];
  if (inShot(t, SHOT.shout)) { cam = [0, 1.9, 4.2]; target = [0, 1.5, 0]; }
  if (inShot(t, SHOT.river)) { cam = [lerp(t, 4.95, 10.5, 2, -1), lerp(t, 4.95, 10.5, 6, 4.2), lerp(t, 4.95, 10.5, 9, 12)]; target = [0, 0.8, 0]; }
  if (close) { cam = [lerp(t, 10.5, 17, 0.3, 0.1), 1.65, lerp(t, 10.5, 17, 4.3, 3.7)]; target = [0.35, 1.45, 0]; }

  const manX = close ? lerp(t, 10.5, 10.95, 6, 0.9) : 99;
  const lean = close ? (t > 14.6 && t < 15.3 ? lerp(t, 14.6, 14.9, 0, 12) : t >= 15.3 ? lerp(t, 15.3, 15.6, 12, -8) : 0) : 0;
  const riceUp = close ? lerp(t, 11.5, 12.1, 0, 1) : 0;
  const manLook: [number, number] = t < 13.2 ? [-0.3, 0] : [0.6, 1];
  const youLook: [number, number] = close ? (t < 13.2 ? [1, 0] : [0.5, 0.3]) : inShot(t, SHOT.river) ? [Math.sin((t - 5) * 1.3), 0] : [0, 0];

  return (
    <AbsoluteFill style={{background: '#2a2438'}}>
      <ThreeCanvas width={width} height={height} camera={{fov: 38, position: cam, near: 0.1, far: 100}} shadows>
        <CameraAim pos={cam} target={target} />
        <fog attach="fog" args={['#3a2f45', 9, 30]} />
        <hemisphereLight args={['#ffe6c7', '#5a4a66', 1.7]} />
        <ambientLight intensity={0.35} color="#ffe9d6" />
        <directionalLight position={[4, 8, 6]} intensity={2.4} color="#ffd9a8" castShadow />
        <directionalLight position={[-5, 3, -4]} intensity={0.6} color="#8fb6ff" />
        <Station3D t={t} />
        <group position={[0, 0, 0]}>
          <Scarf3D
            t={t}
            look={youLook}
            shocked={inShot(t, SHOT.shout) || (close && t < 12.6)}
            worried={t > 7}
            lean={lean}
            armsUp={inShot(t, SHOT.shout)}
            blink={isBlink(t)}
          />
        </group>
        <Crowd3D t={t} lane={{z: -3, n: 16, speed: 1.1, seed: 0}} dense={inShot(t, SHOT.river) ? 1.4 : 1} />
        <Crowd3D t={t} lane={{z: 0, n: 10, speed: 1.4, seed: 100}} clear={!close} hide={close} dense={inShot(t, SHOT.river) ? 1.6 : 1} />
        {!close && <Crowd3D t={t} lane={{z: 2.6, n: 6, speed: 1.9, seed: 200}} />}
        {close && (
          <group position={[manX, 0, 0.1]} rotation={[0, -Math.PI / 2 + 0.5, 0]}>
            <Person3D i={42} phase={t * 9} walking={t < 10.95} look={manLook} riceUp={riceUp} />
          </group>
        )}
      </ThreeCanvas>
      <FactPill t={t} />
      <Grade frame={frame} />
      <Audio src={staticFile('narr_a.wav')} />
    </AbsoluteFill>
  );
};

// Points the default camera at a target every frame (ThreeCanvas has no lookAt prop).
const CameraAim: React.FC<{pos: [number, number, number]; target: [number, number, number]}> = ({pos, target}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(...target);
  camera.updateProjectionMatrix();
  return null;
};
