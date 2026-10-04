"use client";

// The live jersey: one fixed, full-viewport WebGL layer behind the page's foreground and in front
// of its giant type. It sews itself together on arrival, then follows the pose the scroll
// choreography writes, tilts toward the pointer and reprints itself when the page asks for a kit.

import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { gsap } from "gsap";
import { kitAtlasUrl, kitColors } from "@/lib/kit-palette";
import { BUILD_FRAMES, type Build, buildFrame, buildScale, buildTurn, loadBuild } from "./build";
import { createKitMaterial, type KitMaterial, loadAtlas, loadKnit } from "./kit-material";
import { onKit, pose, stage } from "./store";

const CAM_FOV = 24;
const CAM_Z = 3.4;
const HALF_H = Math.tan(THREE.MathUtils.degToRad(CAM_FOV / 2)) * CAM_Z;
const INTRO_SECONDS = 3.7;
const PASS_SECONDS = 1.05;
const passEase = gsap.parseEase("power2.inOut");

export default function JerseyStage() {
  return (
    <div className="stage" aria-hidden="true">
      <StageBoundary>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ fov: CAM_FOV, position: [0, 0, CAM_Z], near: 0.1, far: 20 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <Lights />
          <Jersey />
        </Canvas>
      </StageBoundary>
    </div>
  );
}

/** No WebGL, or it failed: the page keeps its still images and nothing else changes. */
class StageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Lights() {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 2.6, 1.6]} rotation-x={-Math.PI / 2.6} scale={[4.5, 1.8, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-2.6, 0.6, 1.2]} rotation-y={Math.PI / 2.4} scale={[0.8, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[2.6, 0.4, 1.4]} rotation-y={-Math.PI / 2.4} scale={[0.8, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 1.2, -2.6]} scale={[3, 1.2, 1]} color="#ffe7c2" />
        <Lightformer form="rect" intensity={0.5} position={[0, -2.2, 0.5]} rotation-x={Math.PI / 2} scale={[4, 4, 1]} />
      </Environment>
      <directionalLight position={[1.4, 3.2, 2.6]} intensity={1.2} />
      <ambientLight intensity={0.14} />
    </>
  );
}

type Loaded = {
  geometry: THREE.BufferGeometry;
  material: KitMaterial;
  settled: Float32Array;
  normals: Float32Array;
  size: THREE.Vector3;
};

/** Area-weighted vertex normals straight on the typed arrays; three's generic version goes through
 *  attribute getters and is several times slower, which mattered every frame of the intro. */
function fastNormals(geometry: THREE.BufferGeometry) {
  const pos = geometry.getAttribute("position").array as Float32Array;
  const idx = geometry.getIndex()!.array as ArrayLike<number>;
  let attr = geometry.getAttribute("normal") as THREE.BufferAttribute | undefined;
  if (!attr || attr.array.length !== pos.length) {
    attr = new THREE.BufferAttribute(new Float32Array(pos.length), 3);
    geometry.setAttribute("normal", attr);
  }
  const n = attr.array as Float32Array;
  n.fill(0);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    n[a] += nx; n[a + 1] += ny; n[a + 2] += nz;
    n[b] += nx; n[b + 1] += ny; n[b + 2] += nz;
    n[c] += nx; n[c + 1] += ny; n[c + 2] += nz;
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  attr.needsUpdate = true;
}

/** Kits the page will ask for while scrolling (sections list them in data-kits). */
const pageKits = () =>
  [...new Set(Array.from(document.querySelectorAll<HTMLElement>("[data-kits]")).flatMap((el) => (el.dataset.kits ?? "").split(",")).filter(Boolean))];

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Jersey() {
  const gl = useThree((s) => s.gl);
  // state renders the mesh once it exists; the ref is what effects and the frame loop mutate
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const scene = useRef<Loaded | null>(null);
  const group = useRef<THREE.Group>(null);
  const build = useRef<Build | null>(null);
  const intro = useRef({ t: 0, running: false, done: false });
  const pass = useRef<{ to: string; tex: THREE.Texture | null; t: number } | null>(null);
  const shown = useRef(stage.kit);
  const cur = useRef({ x: pose.x, y: pose.y, s: 0, ry: 0, rx: 0, rz: 0 });
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const snapped = useRef(false);

  // geometry, cloth and the first kit; the intro data races alongside and is used if it is in time
  useEffect(() => {
    let alive = true;
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const buildP = reduceMotion() ? Promise.reject(new Error("reduced motion")) : loadBuild();
    buildP.then((b) => { build.current = b; }).catch(() => {});
    Promise.all([new GLTFLoader().loadAsync("/models/jersey.glb"), loadKnit(), loadAtlas(kitAtlasUrl(stage.kit), aniso)])
      .then(async ([gltf, knit, map]) => {
        let mesh: THREE.Mesh | null = null;
        gltf.scene.traverse((o) => { if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh; });
        if (!mesh) throw new Error("jersey.glb has no mesh");
        const geometry = (mesh as THREE.Mesh).geometry;
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const material = createKitMaterial(map, knit, [box.min.y, box.max.y]);
        material.userData.uniforms.uScanColor.value.set(kitColors(stage.kit)[2]);
        const settled = (geometry.getAttribute("position").array as Float32Array).slice();
        const normals = (geometry.getAttribute("normal").array as Float32Array).slice();
        // the page's other kits, decoded and uploaded before the jersey first appears: an atlas
        // upload costs a frame or more, so it should never land in the middle of a scroll
        const others = pageKits().filter((k) => k !== stage.kit).slice(0, 6);
        const textures = await Promise.all(others.map((k) => loadAtlas(kitAtlasUrl(k), aniso).catch(() => null)));
        if (!alive) return;
        for (const t of [map, knit, ...textures]) if (t) gl.initTexture(t);
        // give the intro data a moment; a slow network gets the finished shirt instead
        await Promise.race([buildP.catch(() => {}), new Promise((r) => setTimeout(r, 1800))]);
        if (!alive) return;
        shown.current = stage.kit;
        scene.current = { geometry, material, settled, normals, size: box.getSize(new THREE.Vector3()) };
        setLoaded(scene.current);
      })
      .catch((e) => console.warn("[stage]", e));
    return () => { alive = false; };
  }, [gl]);

  // the page asks for kits; the newest request wins
  useEffect(() => {
    const L = scene.current;
    if (!loaded || !L) return;
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const request = (slug: string) => {
      loadAtlas(kitAtlasUrl(slug), aniso)
        .then((tex) => {
          if (stage.kit !== slug) return; // superseded while loading
          gl.initTexture(tex); // upload now, not on the first frame of the pass
          if (!pass.current) pass.current = { to: slug, tex, t: 0 };
          else if (pass.current.to !== slug) pass.current = { to: slug, tex, t: Math.min(pass.current.t, 0.35) };
          L.material.userData.uniforms.uMap2.value = tex;
          L.material.userData.uniforms.uScanColor.value.set(kitColors(slug)[2]);
        })
        .catch((e) => console.warn("[stage] kit", slug, e));
    };
    if (stage.kit !== shown.current) request(stage.kit);
    return onKit(request);
  }, [loaded, gl]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // start the intro, or skip straight to the finished shirt
  useEffect(() => {
    const L = scene.current;
    if (!loaded || !L) return;
    if (build.current && !reduceMotion()) {
      intro.current = { t: 0, running: true, done: false };
      L.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(L.settled.length), 3).setUsage(THREE.DynamicDrawUsage));
    } else {
      intro.current = { t: 1, running: false, done: true };
      window.dispatchEvent(new Event("stage:built"));
    }
    stage.live = true;
    document.documentElement.dataset.stage = "live";
    window.dispatchEvent(new Event("stage:live"));
  }, [loaded]);

  useFrame((state, dt) => {
    const g = group.current;
    const L = scene.current;
    if (!g || !L) return;
    dt = Math.min(dt, 1 / 20);
    const { width, height } = state.size;
    const aspect = width / height;
    const t = state.clock.elapsedTime;

    // intro: positions from the build timeline, normals recomputed while the cloth moves
    let f = BUILD_FRAMES;
    const it = intro.current;
    if (it.running && build.current) {
      it.t = Math.min(1, it.t + dt / INTRO_SECONDS);
      f = it.t * BUILD_FRAMES;
      const pos = L.geometry.getAttribute("position") as THREE.BufferAttribute;
      buildFrame(build.current, f, pos.array as Float32Array);
      pos.needsUpdate = true;
      fastNormals(L.geometry);
      if (it.t >= 1) {
        // hand over to the welded, seam-smoothed shape the intro ends on
        L.geometry.setAttribute("position", new THREE.BufferAttribute(L.settled, 3));
        L.geometry.setAttribute("normal", new THREE.BufferAttribute(L.normals, 3));
        it.running = false;
        it.done = true;
        window.dispatchEvent(new Event("stage:built"));
      }
    }

    // kit print pass
    const p = pass.current;
    if (p && p.tex && it.done) {
      p.t = Math.min(1, p.t + dt / PASS_SECONDS);
      const u = L.material.userData.uniforms;
      u.uMix.value = passEase(p.t);
      if (p.t >= 1) {
        L.material.map = p.tex;
        u.uMix.value = 0;
        shown.current = p.to;
        pass.current = null;
      }
    }

    // pose -> world transform, eased so the jersey glides even when the scroll steps
    const tx = (pose.x - 0.5) * 2 * HALF_H * aspect;
    const ty = (0.5 - pose.y) * 2 * HALF_H;
    const fit = Math.min((pose.h * 2 * HALF_H) / L.size.y, (pose.w * 2 * HALF_H * aspect) / L.size.x);
    const ts = fit * pose.o * (it.done ? 1 : buildScale(f));
    const pt = pointer.current;
    pt.x = THREE.MathUtils.damp(pt.x, pt.tx, 3, dt);
    pt.y = THREE.MathUtils.damp(pt.y, pt.ty, 3, dt);
    const turn = it.done ? 1 : buildTurn(f);
    const c = cur.current;
    if (!snapped.current) {
      // first frame: start where the pose is, not where the module defaults put it
      Object.assign(c, { x: tx, y: ty, s: ts, ry: pose.ry * turn, rx: pose.rx * turn, rz: pose.rz });
      snapped.current = true;
    }
    const k = 5.5;
    c.x = THREE.MathUtils.damp(c.x, tx, k, dt);
    c.y = THREE.MathUtils.damp(c.y, ty, k, dt);
    c.s = THREE.MathUtils.damp(c.s, ts, k, dt);
    c.ry = THREE.MathUtils.damp(c.ry, pose.ry * turn + pt.x * 0.24, 4.5, dt);
    c.rx = THREE.MathUtils.damp(c.rx, pose.rx * turn + pt.y * 0.1, 4.5, dt);
    c.rz = THREE.MathUtils.damp(c.rz, pose.rz, 4.5, dt);

    const bob = Math.sin(t * 0.8) * 0.012 * c.s;
    g.position.set(c.x, c.y + bob, 0);
    g.rotation.set(c.rx, c.ry, c.rz + Math.sin(t * 0.55) * 0.012);
    g.scale.setScalar(Math.max(c.s, 1e-4));
    g.visible = c.s > 0.01;
  });

  if (!loaded) return null;
  return (
    <group ref={group}>
      <mesh geometry={loaded.geometry} material={loaded.material} frustumCulled={false} />
    </group>
  );
}
