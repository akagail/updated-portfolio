"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { bindRig, stepRig, type PhoneRig } from "./rig";

/* ------------------------------------------------------------------ */
/* Dimensions (world units; phone ~1.5 wide, ~3.4 tall when open)       */
/* ------------------------------------------------------------------ */
const W = 1.5;
const HH = 1.55;
const D = 0.18;
const OPEN = THREE.MathUtils.degToRad(20); // 160° open: lid leans 20° forward of flat
const SCREEN_W = 0.98;
const SCREEN_H = SCREEN_W * 1.25; // 4:5, matches Django-era composition

/* ------------------------------------------------------------------ */
/* Canvas-texture helpers (no image assets, nothing to download)        */
/* ------------------------------------------------------------------ */
function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (ctx) draw(ctx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

let noSignalShared: THREE.CanvasTexture | null = null;
function getNoSignal(): THREE.CanvasTexture {
  if (!noSignalShared) {
    noSignalShared = canvasTexture(512, 640, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 640);
      g.addColorStop(0, "#12414f");
      g.addColorStop(1, "#082230");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 640);
      ctx.fillStyle = "#9fd8e8";
      ctx.font = "600 44px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("NO SIGNAL", 256, 320);
    });
  }
  return noSignalShared;
}

function makeLabelTexture(text: string): THREE.CanvasTexture {
  return canvasTexture(512, 128, (ctx) => {
    ctx.clearRect(0, 0, 512, 128);
    ctx.font = "800 64px 'Plus Jakarta Sans', 'Avenir Next', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255,255,255,0.9)";
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(text.split("").join(" "), 256, 66);
  });
}

function makeSubscreenTexture(): THREE.CanvasTexture {
  return canvasTexture(512, 216, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 216);
    g.addColorStop(0, "#0a2e3d");
    g.addColorStop(1, "#061e29");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 216);
    ctx.fillStyle = "#bff3ff";
    ctx.shadowColor = "rgba(120,230,255,0.9)";
    ctx.shadowBlur = 24;
    ctx.font = "600 92px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("07:07", 256, 112);
  });
}

function makeGlareTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 320, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 256, 320);
    g.addColorStop(0, "rgba(255,255,255,0.85)");
    g.addColorStop(0.35, "rgba(255,255,255,0.12)");
    g.addColorStop(0.6, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 320);
  });
}

/** Cover-fit mapping so Django images never stretch on the screen plane. */
function fitCover(
  t: THREE.Texture,
  imgW: number,
  imgH: number,
  planeW: number,
  planeH: number,
) {
  const ia = imgW / imgH;
  const pa = planeW / planeH;
  if (ia > pa) {
    t.repeat.set(pa / ia, 1);
    t.offset.set((1 - pa / ia) / 2, 0);
  } else {
    t.repeat.set(1, ia / pa);
    t.offset.set(0, (1 - ia / pa) / 2);
  }
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
}

/** Rounded-rect plane with normalized 0..1 UVs (clean texture edges). */
function roundedRectGeo(w: number, h: number, r: number): THREE.ShapeGeometry {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ShapeGeometry(s, 12);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  }
  return geo;
}

/* ------------------------------------------------------------------ */
/* Django screen image -> GPU texture, with NO SIGNAL fallback          */
/* ------------------------------------------------------------------ */
function useScreenTexture(url: string | null): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const current = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    let live = true;
    const swap = (t: THREE.Texture) => {
      if (!live) {
        if (t !== noSignalShared) t.dispose();
        return;
      }
      const old = current.current;
      current.current = t;
      setTex(t);
      if (old && old !== noSignalShared) old.dispose();
    };
    if (!url) {
      swap(getNoSignal());
      return () => {
        live = false;
      };
    }
    new THREE.TextureLoader()
      .loadAsync(url)
      .then((t) => {
        const img = t.image as HTMLImageElement | undefined;
        if (img?.width && img?.height) fitCover(t, img.width, img.height, SCREEN_W, SCREEN_H);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        swap(t);
      })
      .catch(() => swap(getNoSignal()));
    return () => {
      live = false;
    };
  }, [url]);

  useEffect(
    () => () => {
      if (current.current && current.current !== noSignalShared) {
        current.current.dispose();
      }
      current.current = null;
    },
    [],
  );

  return tex;
}

/* ------------------------------------------------------------------ */
/* Shared materials (one instance each, disposed on unmount)            */
/* ------------------------------------------------------------------ */
interface Mats {
  shell: THREE.MeshPhysicalMaterial;
  shellDeep: THREE.MeshPhysicalMaterial;
  pearl: THREE.MeshPhysicalMaterial;
  chrome: THREE.MeshStandardMaterial;
  dark: THREE.MeshPhysicalMaterial;
  glassDark: THREE.MeshPhysicalMaterial;
}

function useMaterials(): Mats {
  const mats = useMemo<Mats>(
    () => ({
      shell: new THREE.MeshPhysicalMaterial({
        color: 0x77c9e8,
        metalness: 0.12,
        roughness: 0.17,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        iridescence: 0.32,
        iridescenceIOR: 1.3,
        envMapIntensity: 1.0,
      }),
      shellDeep: new THREE.MeshPhysicalMaterial({
        color: 0x4aa5c8,
        metalness: 0.15,
        roughness: 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.16,
        iridescence: 0.25,
        iridescenceIOR: 1.3,
        envMapIntensity: 0.9,
      }),
      pearl: new THREE.MeshPhysicalMaterial({
        color: 0xdcf2fa,
        metalness: 0.05,
        roughness: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.8,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.12,
        envMapIntensity: 1.2,
      }),
      dark: new THREE.MeshPhysicalMaterial({
        color: 0x0b2b38,
        metalness: 0.2,
        roughness: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.7,
      }),
      glassDark: new THREE.MeshPhysicalMaterial({
        color: 0x06141c,
        metalness: 0.4,
        roughness: 0.06,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.4,
      }),
    }),
    [],
  );
  useEffect(
    () => () => {
      (Object.values(mats) as THREE.Material[]).forEach((m) => m.dispose());
    },
    [mats],
  );
  return mats;
}

/* Small helper: mesh with a memoized RoundedBox, disposed on unmount. */
function RBox({
  w,
  h,
  d,
  r,
  material,
  position,
  rotation,
}: {
  w: number;
  h: number;
  d: number;
  r: number;
  material: THREE.Material;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, r), [w, h, d, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={material} position={position} rotation={rotation} />;
}

/* ------------------------------------------------------------------ */
/* The handset                                                         */
/* ------------------------------------------------------------------ */
function PhoneModel({ screenTex }: { screenTex: THREE.Texture | null }) {
  const m = useMaterials();

  const screenMat = useMemo(
    () => new THREE.MeshBasicMaterial({ toneMapped: false }),
    [],
  );
  useEffect(() => {
    screenMat.map = screenTex;
    screenMat.color.set(screenTex ? 0xffffff : 0x0d3542);
    screenMat.needsUpdate = true;
  }, [screenMat, screenTex]);
  useEffect(() => () => screenMat.dispose(), [screenMat]);

  const screenGeo = useMemo(() => roundedRectGeo(SCREEN_W, SCREEN_H, 0.07), []);
  useEffect(() => () => screenGeo.dispose(), [screenGeo]);
  const glareTex = useMemo(() => makeGlareTexture(), []);
  useEffect(() => () => glareTex.dispose(), [glareTex]);
  const brandTex = useMemo(() => makeLabelTexture("aqua"), []);
  useEffect(() => () => brandTex.dispose(), [brandTex]);
  const subTex = useMemo(() => makeSubscreenTexture(), []);
  useEffect(() => () => subTex.dispose(), [subTex]);

  const lidY = HH / 2 + 0.04;
  const baseY = -(HH / 2 + 0.04);
  const faceZ = D / 2;

  const keys: Array<[number, number]> = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      keys.push([-0.33 + col * 0.33, -0.18 - row * 0.175]);
    }
  }

  return (
    <group>
      {/* Lid (tilted open around the hinge axis) */}
      <group position={[0, 0.06, 0]} rotation={[OPEN, 0, 0]}>
        <group position={[0, lidY - 0.06, 0]}>
          <RBox w={W} h={HH} d={D} r={0.09} material={m.shell} />
          {/* chrome rim + deep teal bezel + screen */}
          <RBox w={W - 0.1} h={HH - 0.16} d={0.05} r={0.05} material={m.chrome} position={[0, 0, faceZ + 0.005]} />
          <RBox w={W - 0.16} h={HH - 0.22} d={0.07} r={0.045} material={m.dark} position={[0, 0, faceZ + 0.02]} />
          <mesh geometry={screenGeo} material={screenMat} position={[0, -0.02, faceZ + 0.057]} />
          <mesh position={[0, -0.02, faceZ + 0.059]}>
            <planeGeometry args={[SCREEN_W, SCREEN_H]} />
            <meshBasicMaterial map={glareTex} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
          </mesh>
          {/* earpiece */}
          <RBox w={0.34} h={0.045} d={0.02} r={0.02} material={m.chrome} position={[0, 0.62, faceZ + 0.02]} />
          {/* back: camera, flash, subscreen, logo */}
          <group position={[0, 0, -faceZ - 0.005]} rotation={[0, Math.PI, 0]}>
            <mesh position={[-0.35, 0.45, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.045, 40]} />
              <primitive object={m.chrome} attach="material" />
            </mesh>
            <mesh position={[-0.35, 0.45, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.115, 0.115, 0.05, 40]} />
              <primitive object={m.glassDark} attach="material" />
            </mesh>
            <mesh position={[-0.385, 0.485, 0.058]}>
              <circleGeometry args={[0.028, 20]} />
              <meshBasicMaterial color={0xffffff} toneMapped={false} />
            </mesh>
            <RBox w={0.12} h={0.12} d={0.03} r={0.02} material={m.pearl} position={[0.42, 0.45, 0.015]} />
            <RBox w={0.72} h={0.3} d={0.03} r={0.05} material={m.dark} position={[0, 0.02, 0.012]} />
            <mesh position={[0, 0.02, 0.028]}>
              <planeGeometry args={[0.64, 0.24]} />
              <meshBasicMaterial map={subTex} toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.48, 0.004]}>
              <planeGeometry args={[0.52, 0.13]} />
              <meshBasicMaterial map={brandTex} transparent toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Hinge barrel + end caps */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.105, 0.105, W - 0.1, 28]} />
        <primitive object={m.chrome} attach="material" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(W / 2 - 0.08) * s, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.115, 0.115, 0.09, 28]} />
          <primitive object={m.shellDeep} attach="material" />
        </mesh>
      ))}

      {/* Base */}
      <group position={[0, baseY, 0]}>
        <RBox w={W} h={HH} d={D} r={0.09} material={m.shell} />
        {/* softkeys */}
        {[-1, 1].map((s) => (
          <RBox key={s} w={0.32} h={0.09} d={0.04} r={0.04} material={m.chrome} position={[0.38 * s, 0.55, faceZ + 0.01]} />
        ))}
        {/* d-pad: chrome ring + dish + center key */}
        <mesh position={[0, 0.18, faceZ + 0.015]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.05, 40]} />
          <primitive object={m.chrome} attach="material" />
        </mesh>
        <mesh position={[0, 0.18, faceZ + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.055, 40]} />
          <primitive object={m.dark} attach="material" />
        </mesh>
        <mesh position={[0, 0.18, faceZ + 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.06, 28]} />
          <primitive object={m.pearl} attach="material" />
        </mesh>
        {/* 12-key pad */}
        {keys.map(([x, y], i) => (
          <RBox key={i} w={0.24} h={0.1} d={0.035} r={0.045} material={m.pearl} position={[x, y, faceZ + 0.008]} />
        ))}
        {/* mic */}
        <mesh position={[0, -0.09, faceZ + 0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
          <primitive object={m.dark} attach="material" />
        </mesh>
        {/* embossed brand */}
        <mesh position={[0, 0.68, faceZ + 0.002]}>
          <planeGeometry args={[0.4, 0.1]} />
          <meshBasicMaterial map={brandTex} transparent toneMapped={false} />
        </mesh>
        {/* back: battery cover suggestion */}
        <RBox w={W - 0.3} h={HH - 0.5} d={0.012} r={0.05} material={m.shellDeep} position={[0, -0.05, -faceZ - 0.002]} />
      </group>
    </group>
  );
}

/* Studio reflections without HDR assets. */
function Env() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    return () => {
      scene.environment = null;
      envTex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/* Rotation + float driver. One loop; idles to a halt via demand rendering. */
function Driver({ rig, screenTex }: { rig: PhoneRig; screenTex: THREE.Texture | null }) {
  const tilt = useRef<THREE.Group>(null);
  const floatG = useRef<THREE.Group>(null);
  const amp = useRef(1);
  const invalidate = useThree((s) => s.invalidate);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = rig;
    const moving = stepRig(s, dt);
    if (tilt.current) {
      tilt.current.rotation.set(
        THREE.MathUtils.degToRad(s.cRX),
        THREE.MathUtils.degToRad(s.cRY),
        0,
      );
    }
    let floating = false;
    if (floatG.current) {
      if (!s.reduced && s.visible && !document.hidden) {
        s.floatT += dt;
        amp.current += ((s.dragging ? 0 : 1) - amp.current) * (1 - Math.exp(-4 * dt));
        floatG.current.position.y = Math.sin(((s.floatT * 2 * Math.PI) / 7)) * 0.09 * amp.current;
        floating = amp.current > 0.003;
      } else if (floatG.current.position.y !== 0) {
        floatG.current.position.y = 0;
      }
    }
    if (moving || floating) invalidate();
  });

  return (
    <group ref={floatG}>
      <group ref={tilt}>
        <PhoneModel screenTex={screenTex} />
      </group>
    </group>
  );
}

/* Binds DOM interaction (wrapper lives outside the Canvas). */
function Controls({ rig, wrap }: { rig: PhoneRig; wrap: HTMLElement }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    rig.kick = () => invalidate();
    const unbind = bindRig(wrap, rig);
    rig.kick();
    return () => {
      rig.kick = () => {};
      unbind();
    };
  }, [rig, wrap, invalidate]);
  return null;
}

export default function PhoneScene({
  rig,
  wrap,
  screenUrl,
}: {
  rig: PhoneRig;
  wrap: HTMLElement;
  screenUrl: string | null;
}) {
  const screenTex = useScreenTexture(screenUrl);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, position: [0, 0.1, 7.0], near: 0.1, far: 30 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
      <Env />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} color={0xfff2d8} />
      <directionalLight position={[-4, 1, 2]} intensity={0.5} color={0xbfe6ff} />
      <Controls rig={rig} wrap={wrap} />
      <Driver rig={rig} screenTex={screenTex} />
    </Canvas>
  );
}
