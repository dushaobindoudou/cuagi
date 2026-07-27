import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CN = new THREE.Color("#D63A2C");
const US = new THREE.Color("#2E6FE0");
const GOLD = new THREE.Color("#C9A24B");

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    // slow breathing drift + pull toward the midline
    p.x += 0.02 * sin(uTime * 0.30 + position.y * 8.0 + position.x * 5.0);
    p.y += 0.015 * cos(uTime * 0.23 + position.x * 9.0);
    p.x += -sign(position.x) * 0.03 * (0.5 + 0.5 * sin(uTime * 0.05 + position.y * 3.0));
    // mouse repulsion (displacement only, never touches base position)
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float f = smoothstep(0.28, 0.0, dist) * uHover;
    p.xy += normalize(d + vec2(1e-4)) * f * 0.18;
    vColor = aColor;
    vTwinkle = 0.65 + 0.35 * sin(uTime * 2.0 + position.x * 40.0 + position.y * 31.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (1.0 + 0.35 * sin(uTime * 1.6 + position.x * 40.0));
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.08, r) * vTwinkle;
    gl_FragColor = vec4(vColor, a);
  }
`;

/** Deterministic PRNG so the star map layout is stable across renders. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildField(count: number, kind: "camp" | "gold") {
  const rand = mulberry32(kind === "camp" ? 20260723 : 1145);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const tmp = new THREE.Color();
  for (let i = 0; i < count; i++) {
    if (kind === "camp") {
      const side = i % 2 === 0 ? -1 : 1;
      // denser toward the outer edges, sparser near the midline
      const spread = 0.12 + 0.88 * Math.pow(rand(), 0.55);
      positions[i * 3] = side * spread;
      positions[i * 3 + 1] = (rand() * 2 - 1) * 1.05;
      positions[i * 3 + 2] = 0;
      tmp.copy(side < 0 ? CN : US);
      tmp.multiplyScalar(0.55 + rand() * 0.45);
      sizes[i] = 2.2 + rand() * 3.4;
    } else {
      // gold sparks hugging the midline
      positions[i * 3] = (rand() * 2 - 1) * 0.09;
      positions[i * 3 + 1] = (rand() * 2 - 1) * 1.05;
      positions[i * 3 + 2] = 0;
      tmp.copy(GOLD).multiplyScalar(0.5 + rand() * 0.6);
      sizes[i] = 1.4 + rand() * 2.4;
    }
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  return { positions, colors, sizes };
}

interface FieldProps {
  count: number;
  kind: "camp" | "gold";
}

function ParticleField({ count, kind }: FieldProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(9, 9));
  const hover = useRef(0);

  // stable particle layout + uniforms, precomputed once per field
  const { positions, colors, sizes } = useMemo(() => buildField(count, kind), [count, kind]);
  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uHover: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    u.uTime.value += delta;
    // pointer is NDC (-1..1), matching our orthographic space
    mouse.current.lerp(new THREE.Vector2(state.pointer.x, state.pointer.y), 0.05);
    const onScreen =
      state.pointer.x >= -1 && state.pointer.x <= 1 && state.pointer.y >= -1 && state.pointer.y <= 1;
    hover.current += ((onScreen ? 1 : 0) - hover.current) * 0.08;
    (u.uMouse.value as THREE.Vector2).copy(mouse.current);
    u.uHover.value = hover.current;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={initialUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * W1 双阵营粒子星图 (design.md §7): left-half cinnabar / right-half
 * steel-blue particle streams drifting toward a gold midline; the mouse
 * pushes particles aside. Rendered on a full-bleed fixed canvas shared by
 * the Hero and the select stage; the parent hides it past S2.
 */
export default function CampParticles({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10, position: [0, 0, 1] }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <ParticleField count={6000} kind="camp" />
        <ParticleField count={260} kind="gold" />
      </Canvas>
    </div>
  );
}
