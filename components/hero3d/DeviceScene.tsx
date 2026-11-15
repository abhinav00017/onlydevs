"use client";

import { ContactShadows, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { CanvasTexture, InstancedMesh, Object3D, PMREMGenerator, Vector3, type Camera, type Group } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { FRAMING, pixelsPerUnit, poseAt, type Pose } from "@/components/hero/choreography";
import { LAPTOP_SCREEN, LaptopUI, PHONE_SCREEN, PhoneUI } from "@/components/hero/LiveScreens";
import type { DeviceSceneProps } from "@/components/hero/types";
import { panel, slab, squircleRect } from "./geometry";
import { dimLaptop, makeMaterials, type DeviceMaterials } from "./materials";
import { SceneCanvas, clampDelta, useSceneLive, useScreenMounted, useScreenPortal } from "./SceneCanvas";

/**
 * The hero's 3D stage: a generic laptop with a generic phone in front of it, both running our live UI.
 * Built in code (no model files), lit by three's procedural RoomEnvironment through PMREM, ACES tone mapping,
 * a soft contact shadow. The live UI is real DOM (drei Html, `transform`, `occlude="blending"`):
 * the canvas cuts a screen-shaped hole and the DOM shows through it, under a glass reflection.
 * Loaded only through next/dynamic with ssr: false (components/hero/HeroStage.tsx).
 */
export default function DeviceScene({ state, progress, onReady, onFail, className }: DeviceSceneProps) {
  return (
    <SceneCanvas className={className} camera={{ position: [0.6, 2.4, 9], fov: 24 }} screens={2} onReady={onReady} onFail={onFail}>
      <Studio />
      <Rig progress={progress}>
        {(pose) => (
          <Devices>
            {(m) => (
              <>
                <Laptop m={m} pose={pose}>
                  <LaptopUI state={state} />
                </Laptop>
                <Phone m={m} pose={pose}>
                  <PhoneUI state={state} />
                </Phone>
              </>
            )}
          </Devices>
        )}
      </Rig>
      <Floor />
      {/* Two contact shadows, like a real photo: a tight one where the devices meet the desk, a wide soft one around them.
          They stay level and unrotated (drei blurs them on a plane at the world origin, which must face their camera),
          and sit a hair below y = 0, so that plane is in front of their camera. */}
      <ContactShadows position={[0, -0.004, 0]} scale={[12, 9]} far={0.45} blur={1.2} opacity={0.6} resolution={1024} color="#0e1c22" />
      <ContactShadows position={[0, -0.005, 0]} scale={[12, 9]} far={2.4} blur={3} opacity={0.32} resolution={512} color="#14272f" />
    </SceneCanvas>
  );
}

/* ---------- Light ---------- */

/** RoomEnvironment through PMREM for reflections, plus a soft key and a cool rim. */
function Studio() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.035).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.95;
    room.dispose();
    pmrem.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [get]);
  return (
    <>
      <directionalLight position={[-4, 7, 5]} intensity={1.4} />
      <directionalLight position={[6, 3, -5]} intensity={0.7} color="#ece6ff" />
    </>
  );
}

/**
 * The surface the devices stand on: a pale satin desk with a light clear coat, so it catches a soft sheen
 * of the studio light, and fades into the page at its edges, so there is no visible horizon.
 * (A true mirror reflection, drei's MeshReflectorMaterial, was tried: it costs a second render each frame
 * and was invisible on a pale desk, so it is not used.)
 */
function Floor() {
  const alpha = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.45, "#c8c8c8");
    grad.addColorStop(1, "#000000");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new CanvasTexture(c);
  }, []);
  useEffect(() => () => alpha.dispose(), [alpha]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, -0.008, 0.2]} renderOrder={-2}>
      <planeGeometry args={[13, 8]} />
      <meshPhysicalMaterial
        color="#dfe6e9"
        roughness={0.38}
        metalness={0}
        clearcoat={0.4}
        clearcoatRoughness={0.3}
        transparent
        alphaMap={alpha}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ---------- Camera, scroll and pointer ---------- */

const COMPOSITION = { center: new Vector3(0.45, 0.85, 0.2), width: 4.9, height: 2.6 };
const UP = new Vector3(0, 1, 0);
/** The base camera angle the poses are measured from (the front three-quarter view the scene was first framed with). */
const BASE_AZIMUTH = 5.7;
/** Laptop screen centre, in the laptop's own space (lid open). */
const LAPTOP_SCREEN_LOCAL = { y: 1.08, z: -1.25 };
const DEG = Math.PI / 180;

/** Damps `from` toward `to` like a critically damped spring: calm, never bouncy. */
function damp(from: number, to: number, lambda: number, dt: number) {
  return from + (to - from) * (1 - Math.exp(-lambda * dt));
}

function clonePose(p: Pose): Pose {
  return {
    ...p,
    focus: { ...p.focus },
    phonePosition: [...p.phonePosition],
    phoneRotation: [...p.phoneRotation],
    laptopPosition: [...p.laptopPosition],
  };
}

/** Moves `current` toward `target`, field by field, with the same calm damping. */
function dampPose(current: Pose, target: Pose, lambda: number, dt: number) {
  current.azimuth = damp(current.azimuth, target.azimuth, lambda, dt);
  current.elevation = damp(current.elevation, target.elevation, lambda, dt);
  current.distance = damp(current.distance, target.distance, lambda, dt);
  current.focus.center = damp(current.focus.center, target.focus.center, lambda, dt);
  current.focus.phone = damp(current.focus.phone, target.focus.phone, lambda, dt);
  current.focus.laptop = damp(current.focus.laptop, target.focus.laptop, lambda, dt);
  current.screenX = damp(current.screenX, target.screenX, lambda, dt);
  current.screenY = damp(current.screenY, target.screenY, lambda, dt);
  for (let i = 0; i < 3; i++) {
    current.phonePosition[i] = damp(current.phonePosition[i], target.phonePosition[i], lambda, dt);
    current.phoneRotation[i] = damp(current.phoneRotation[i], target.phoneRotation[i], lambda, dt);
    current.laptopPosition[i] = damp(current.laptopPosition[i], target.laptopPosition[i], lambda, dt);
  }
  current.laptopRotationY = damp(current.laptopRotationY, target.laptopRotationY, lambda, dt);
  current.laptopDim = damp(current.laptopDim, target.laptopDim, lambda, dt);
}

/**
 * The camera, directed by the pinned scroll (components/hero/choreography.ts): one pose per business, eased in over
 * the first part of each quarter, held, then a pull-back to a wide shot as the pin releases. Damped on top, so a fast
 * wheel never makes it jump. The pointer adds a small, damped drift.
 */
function Rig({ progress, children }: { progress: DeviceSceneProps["progress"]; children: (pose: RefObject<Pose>) => ReactNode }) {
  const live = useSceneLive();
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const pose = useRef<Pose>(clonePose(poseAt(progress.get())));
  const offset = useRef({ x: 0, y: 0 });
  const v = useMemo(
    () => ({
      focus: new Vector3(),
      dir: new Vector3(),
      pos: new Vector3(),
      aim: new Vector3(),
      fwd: new Vector3(),
      right: new Vector3(),
      up: new Vector3(),
      tmp: new Vector3(),
    }),
    [],
  );

  /** Framing: the distance that fits both devices; wide screens put them on the right, tall screens low. */
  const frame = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const t = Math.tan(((FRAMING.fovDeg / 2) * Math.PI) / 180);
    const wide = aspect >= FRAMING.wide.minAspect;
    // The distance at which the focus has pixelsPerUnit() pixels per world unit (the poster scales the same way).
    const d = size.height / (2 * t * pixelsPerUnit(size.width, size.height));
    return { aspect, t, wide, d };
  }, [size.width, size.height]);

  useLayoutEffect(() => {
    placeCamera(camera, pose.current, frame, v, offset.current, live.current.pointer, 0);
  }, [camera, frame, v, live]);

  useFrame((_, delta) => {
    const dt = clampDelta(delta);
    dampPose(pose.current, poseAt(progress.get()), 3, dt);
    placeCamera(camera, pose.current, frame, v, offset.current, live.current.pointer, dt);
  });

  return <group>{children(pose)}</group>;
}

type Scratch = { focus: Vector3; dir: Vector3; pos: Vector3; aim: Vector3; fwd: Vector3; right: Vector3; up: Vector3; tmp: Vector3 };

/** Puts the camera where the pose says, looking at its focus, which lands where the pose wants it on screen. */
function placeCamera(
  camera: Camera,
  p: Pose,
  frame: { aspect: number; t: number; wide: boolean; d: number },
  v: Scratch,
  offset: { x: number; y: number },
  pointer: { x: number; y: number },
  dt: number,
) {
  // Focus: a blend of the composition, the phone and the laptop's screen, by the pose's weights.
  const sum = p.focus.center + p.focus.phone + p.focus.laptop || 1;
  const th = p.laptopRotationY;
  const lx = p.laptopPosition[0] + LAPTOP_SCREEN_LOCAL.z * Math.sin(th);
  const lz = p.laptopPosition[2] + LAPTOP_SCREEN_LOCAL.z * Math.cos(th);
  v.focus
    .set(0, 0, 0)
    .addScaledVector(COMPOSITION.center, p.focus.center / sum)
    .addScaledVector(v.tmp.set(p.phonePosition[0], p.phonePosition[1], p.phonePosition[2]), p.focus.phone / sum)
    .addScaledVector(v.tmp.set(lx, p.laptopPosition[1] + LAPTOP_SCREEN_LOCAL.y, lz), p.focus.laptop / sum);
  const az = (BASE_AZIMUTH + p.azimuth) * DEG;
  const el = p.elevation * DEG;
  v.dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  const dist = frame.d * p.distance;
  v.pos.copy(v.focus).addScaledVector(v.dir, dist);
  v.fwd.copy(v.dir).negate();
  v.right.crossVectors(v.fwd, UP).normalize();
  v.up.crossVectors(v.right, v.fwd).normalize();
  // Right of the words on wide screens; low on tall ones.
  const sx = frame.wide ? p.screenX : 0;
  const sy = frame.wide ? p.screenY : p.screenY + FRAMING.tall.shiftY;
  v.aim
    .copy(v.focus)
    .addScaledVector(v.right, -sx * dist * frame.t * frame.aspect)
    .addScaledVector(v.up, -sy * dist * frame.t);
  // Pointer: a small, damped drift.
  offset.x = damp(offset.x, pointer.x, 2.2, dt);
  offset.y = damp(offset.y, pointer.y, 2.2, dt);
  const k = dist * 0.03;
  v.pos.addScaledVector(v.right, offset.x * k).addScaledVector(v.up, offset.y * k * 0.6);
  camera.position.copy(v.pos);
  camera.lookAt(v.aim);
}

/* ---------- Devices ---------- */

function Devices({ children }: { children: (m: DeviceMaterials) => ReactNode }) {
  const m = useMemo(() => makeMaterials(), []);
  useEffect(() => () => m.dispose(), [m]);
  return <>{children(m)}</>;
}

/**
 * A live screen: the DOM UI, held in place by drei's Html, behind a squircle-shaped hole in the canvas.
 * `distanceFactor` makes the DOM's design width match the screen's real width.
 */
function LiveScreen({
  name,
  width,
  height,
  radius,
  design,
  z,
  children,
}: {
  name: string;
  width: number;
  height: number;
  radius: number;
  design: { width: number; height: number };
  z: number;
  children: ReactNode;
}) {
  const shape = useMemo(() => squircleRect(width, height, radius), [width, height, radius]);
  const radiusPx = (radius / width) * design.width;
  const portal = useScreenPortal();
  const mounted = useScreenMounted();
  return (
    <Html
      portal={portal}
      transform
      occlude="blending"
      position={[0, 0, z]}
      distanceFactor={(width / design.width) * 400}
      geometry={<shapeGeometry args={[shape, 1]} />}
      pointerEvents="none"
    >
      <div
        ref={(node) => {
          if (node) mounted(name);
        }}
        style={{ width: design.width, height: design.height, borderRadius: radiusPx * 0.82, overflow: "hidden" }}
      >
        {children}
      </div>
    </Html>
  );
}

const PHONE = { w: 0.72, h: 1.54, d: 0.078, r: 0.105 };
const PHONE_DISPLAY = { w: 0.672, h: (0.672 * PHONE_SCREEN.height) / PHONE_SCREEN.width, r: 0.082 };

function Phone({ m, pose, children }: { m: DeviceMaterials; pose: RefObject<Pose>; children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const g = group.current;
    const p = pose.current;
    if (!g || !p) return;
    g.position.set(p.phonePosition[0], p.phonePosition[1], p.phonePosition[2]);
    g.rotation.set(p.phoneRotation[0], p.phoneRotation[1], p.phoneRotation[2]);
  });
  const geo = useMemo(
    () => ({
      body: slab(PHONE.w, PHONE.h, PHONE.d, PHONE.r, 0.016),
      cover: slab(PHONE.w - 0.012, PHONE.h - 0.012, 0.006, PHONE.r - 0.006, 0.0028, 4),
      sheen: panel(PHONE.w - 0.016, PHONE.h - 0.016, PHONE.r - 0.008),
      button: slab(0.012, 0.16, 0.022, 0.005, 0.004, 3),
      buttonSmall: slab(0.012, 0.09, 0.022, 0.005, 0.004, 3),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  const front = PHONE.d / 2;

  return (
    <group ref={group}>
      <mesh geometry={geo.body} material={m.frame} />
      <mesh geometry={geo.cover} material={m.glass} position={[0, 0, front - 0.001]} />
      <group position={[0, 0.005, 0]}>
        <LiveScreen name="phone" width={PHONE_DISPLAY.w} height={PHONE_DISPLAY.h} radius={PHONE_DISPLAY.r} design={PHONE_SCREEN} z={front + 0.0026}>
          {children}
        </LiveScreen>
      </group>
      {/* A small centred punch-hole camera: generic, no brand's notch. */}
      <mesh position={[0, PHONE_DISPLAY.h / 2 - 0.028, front + 0.003]}>
        <circleGeometry args={[0.0125, 32]} />
        <meshPhysicalMaterial color="#020203" roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh geometry={geo.sheen} material={m.screenGlass} position={[0, 0, front + 0.0034]} />
      {/* Side buttons on the right edge. */}
      <mesh geometry={geo.button} material={m.frame} position={[PHONE.w / 2 + 0.002, 0.32, 0]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={geo.buttonSmall} material={m.frame} position={[PHONE.w / 2 + 0.002, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

const LAPTOP = { w: 3.04, depth: 2.12, base: 0.1, lid: 2.0, lidT: 0.04, r: 0.13 };
const LAPTOP_DISPLAY = { w: 2.84, h: (2.84 * LAPTOP_SCREEN.height) / LAPTOP_SCREEN.width, r: 0.035 };
const LID_OPEN = -0.26;
/** The lid starts a little closed and settles open while the stage fades in: a small, calm move, not a pop. */
const LID_START = 0.12;

function Laptop({ m, pose, children }: { m: DeviceMaterials; pose: RefObject<Pose>; children: ReactNode }) {
  const lid = useRef<Group>(null);
  const group = useRef<Group>(null);
  const screen = useRef<HTMLDivElement>(null);
  const lastDim = useRef(-1);
  const geo = useMemo(
    () => ({
      base: slab(LAPTOP.w, LAPTOP.depth, LAPTOP.base, LAPTOP.r, 0.03),
      lid: slab(LAPTOP.w, LAPTOP.lid, LAPTOP.lidT, LAPTOP.r, 0.012),
      bezel: slab(LAPTOP.w - 0.05, LAPTOP.lid - 0.05, 0.004, LAPTOP.r - 0.025, 0.0018, 3),
      sheen: panel(LAPTOP.w - 0.06, LAPTOP.lid - 0.06, LAPTOP.r - 0.03),
      trackpad: slab(1.3, 0.82, 0.006, 0.07, 0.0025, 3),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  const top = LAPTOP.base + 0.008;
  const hingeZ = -LAPTOP.depth / 2 + 0.07;

  useFrame((_, delta) => {
    // The lid opens once, calmly, as the scene appears.
    if (lid.current) lid.current.rotation.x = damp(lid.current.rotation.x, LID_OPEN, 1.7, clampDelta(delta));
    const p = pose.current;
    if (!p || !group.current) return;
    group.current.position.set(p.laptopPosition[0], p.laptopPosition[1], p.laptopPosition[2]);
    group.current.rotation.set(0, p.laptopRotationY, 0);
    // While the phone is the hero, the laptop steps back into shadow: darker metal, a dimmer and softer screen.
    const dim = Math.round(p.laptopDim * 100) / 100;
    if (dim !== lastDim.current) {
      lastDim.current = dim;
      dimLaptop(m, dim);
      if (screen.current) screen.current.style.filter = dim > 0.01 ? `brightness(${(1 - 0.28 * dim).toFixed(3)}) blur(${(1.4 * dim).toFixed(2)}px)` : "";
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={geo.base} material={m.aluminium} position={[0, LAPTOP.base / 2 + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <Keyboard m={m} y={top} />
      <mesh geometry={geo.trackpad} material={m.trackpad} position={[0, top - 0.0018, 0.56]} rotation={[-Math.PI / 2, 0, 0]} />
      {/* Hinge. */}
      <mesh material={m.dark} position={[0, top + 0.005, hingeZ - 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, LAPTOP.w - 0.6, 24]} />
      </mesh>
      <group ref={lid} position={[0, top + 0.006, hingeZ]} rotation={[LID_START, 0, 0]}>
        <mesh geometry={geo.lid} material={m.aluminium} position={[0, LAPTOP.lid / 2, -LAPTOP.lidT / 2]} />
        <mesh geometry={geo.bezel} material={m.glass} position={[0, LAPTOP.lid / 2, 0.001]} />
        <group position={[0, LAPTOP.lid / 2 + 0.03, 0]}>
          <LiveScreen name="laptop" width={LAPTOP_DISPLAY.w} height={LAPTOP_DISPLAY.h} radius={LAPTOP_DISPLAY.r} design={LAPTOP_SCREEN} z={0.0036}>
            <div ref={screen} style={{ width: "100%", height: "100%" }}>
              {children}
            </div>
          </LiveScreen>
        </group>
        <mesh position={[0, LAPTOP.lid - 0.045, 0.0034]}>
          <circleGeometry args={[0.011, 24]} />
          <meshPhysicalMaterial color="#0b0c0e" roughness={0.2} clearcoat={1} />
        </mesh>
        <mesh geometry={geo.sheen} material={m.screenGlass} position={[0, LAPTOP.lid / 2, 0.0046]} />
      </group>
    </group>
  );
}

/** Keys in rows, in key units across a 14-unit row. The last row has the space bar and three arrow keys. */
const KEY_ROWS: { h: number; keys: number[] }[] = [
  { h: 0.55, keys: Array(14).fill(1) },
  { h: 1, keys: Array(14).fill(1) },
  { h: 1, keys: [1.5, ...Array(11).fill(1), 1.5] },
  { h: 1, keys: [1.8, ...Array(10).fill(1), 2.2] },
  { h: 1, keys: [2.3, ...Array(10).fill(1), 1.7] },
  { h: 1, keys: [1, 1, 1.2, 1.2, 4.6, 1.2, 1, 0.9333, 0.9333, 0.9333] },
];

function Keyboard({ m, y }: { m: DeviceMaterials; y: number }) {
  const ref = useRef<InstancedMesh>(null);
  const unit = 2.5 / 14;
  const gap = 0.024;
  const placements = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number }[] = [];
    let z = -0.98;
    for (const row of KEY_ROWS) {
      const d = row.h * unit - gap;
      let x = -1.25;
      for (const k of row.keys) {
        out.push({ x: x + (k * unit) / 2, z: z + d / 2, w: k * unit - gap, d });
        x += k * unit;
      }
      z += row.h * unit;
    }
    return out;
  }, [unit]);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.16), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    placements.forEach((p, i) => {
      o.position.set(p.x, y + 0.004, p.z);
      o.scale.set(p.w, 0.014, p.d);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placements, y]);

  return <instancedMesh ref={ref} args={[geometry, m.keys, placements.length]} />;
}
