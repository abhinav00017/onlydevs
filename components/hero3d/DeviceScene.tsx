"use client";

import { ContactShadows, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { CanvasTexture, InstancedMesh, Object3D, PMREMGenerator, Vector3, type Group } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { LAPTOP_SCREEN, LaptopUI, PHONE_SCREEN, PhoneUI } from "@/components/hero/LiveScreens";
import type { DeviceSceneProps } from "@/components/hero/types";
import { panel, slab, squircleRect } from "./geometry";
import { makeMaterials, type DeviceMaterials } from "./materials";
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
        <Devices>
          {(m) => (
            <>
              <Laptop m={m} position={[-0.55, 0, -0.35]} rotationY={0.34}>
                <LaptopUI state={state} />
              </Laptop>
              <Phone m={m} position={[1.62, 0.96, 1.2]} rotation={[-0.07, 0.12, 0.03]}>
                <PhoneUI state={state} />
              </Phone>
            </>
          )}
        </Devices>
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

/** Damps `from` toward `to` like a critically damped spring: calm, never bouncy. */
function damp(from: number, to: number, lambda: number, dt: number) {
  return from + (to - from) * (1 - Math.exp(-lambda * dt));
}

function Rig({ progress, children }: { progress: DeviceSceneProps["progress"]; children: ReactNode }) {
  const stage = useRef<Group>(null);
  const live = useSceneLive();
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const look = useRef(new Vector3());
  const offset = useRef({ x: 0, y: 0 });

  /** Framing: wide screens put the devices on the right (the words sit on the left); tall screens put them low. */
  const frame = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const fov = 24;
    const t = Math.tan(((fov / 2) * Math.PI) / 180);
    const wide = aspect >= 1.15;
    const fw = wide ? 0.66 : 0.9;
    const fh = wide ? 0.82 : 0.42;
    const d = Math.max(COMPOSITION.width / (fw * 2 * t * aspect), COMPOSITION.height / (fh * 2 * t));
    const dir = new Vector3(0.1, 0.3, 1).normalize();
    const position = COMPOSITION.center.clone().addScaledVector(dir, d);
    const forward = COMPOSITION.center.clone().sub(position).normalize();
    const right = new Vector3().crossVectors(forward, UP).normalize();
    const up = new Vector3().crossVectors(right, forward).normalize();
    // Where the devices' centre should land on screen, in -1..1.
    const ndc = wide ? { x: 0.52, y: -0.06 } : { x: 0, y: -0.42 };
    const aim = COMPOSITION.center
      .clone()
      .addScaledVector(right, -ndc.x * d * t * aspect)
      .addScaledVector(up, -ndc.y * d * t);
    return { position, aim, right, up, d };
  }, [size.width, size.height]);

  useLayoutEffect(() => {
    camera.position.copy(frame.position);
    look.current.copy(frame.aim);
    camera.lookAt(frame.aim);
  }, [camera, frame]);

  const tmp = useMemo(() => new Vector3(), []);
  useFrame((_, delta) => {
    const dt = clampDelta(delta);
    const p = Math.min(1, Math.max(0, progress.get()));
    if (stage.current) {
      // Scroll: a slow, graceful turn as the hero leaves.
      stage.current.rotation.y = damp(stage.current.rotation.y, -0.16 + p * 0.55, 2.6, dt);
    }
    // Pointer: the camera drifts a little, so the devices tilt in a subtle, damped way.
    const ptr = live.current.pointer;
    offset.current.x = damp(offset.current.x, ptr.x, 2.2, dt);
    offset.current.y = damp(offset.current.y, ptr.y, 2.2, dt);
    const k = frame.d * 0.035;
    tmp.copy(frame.position).addScaledVector(frame.right, offset.current.x * k).addScaledVector(frame.up, offset.current.y * k * 0.6);
    camera.position.copy(tmp);
    camera.lookAt(look.current);
  });

  // The stage turns around the middle of the composition, so the devices turn in place instead of sweeping sideways.
  return (
    <group position={[COMPOSITION.center.x, 0, COMPOSITION.center.z]}>
      <group ref={stage}>
        <group position={[-COMPOSITION.center.x, 0, -COMPOSITION.center.z]}>{children}</group>
      </group>
    </group>
  );
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

function Phone({
  m,
  position,
  rotation,
  children,
}: {
  m: DeviceMaterials;
  position: [number, number, number];
  rotation: [number, number, number];
  children: ReactNode;
}) {
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
    <group position={position} rotation={rotation}>
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

function Laptop({ m, position, rotationY, children }: { m: DeviceMaterials; position: [number, number, number]; rotationY: number; children: ReactNode }) {
  const lid = useRef<Group>(null);
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

  // The lid opens once, calmly, as the scene appears.
  useFrame((_, delta) => {
    if (!lid.current) return;
    lid.current.rotation.x = damp(lid.current.rotation.x, LID_OPEN, 1.7, clampDelta(delta));
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
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
            {children}
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
