import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * W3 光谱雾带 (design.md §7 / spectrum.md S2): a horizontal 0→10 gradient
 * fog band (iron red → gold → jade) with a low-frequency sine sway that
 * follows page scroll (amplitude 6%, period 8s). The CSS linear-gradient
 * fallback is rendered by the parent *underneath* this canvas, so if WebGL
 * is unavailable the parent simply never mounts this component.
 */

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uScroll; // 0..1 page scroll progress
  uniform vec2 uRes;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;

    // low-frequency sway: 8s period + 6% scroll-driven offset
    float sway = sin(uTime * 0.785398 + uv.x * 3.14159) * 0.06 + (uScroll - 0.5) * 0.12;
    float mist = (fbm(uv * vec2(3.0, 2.0) + vec2(uTime * 0.03, 0.0)) - 0.5) * 0.3;
    float y = uv.y + sway + mist;

    // fog band centered vertically, soft falloff
    float band = smoothstep(0.62, 0.12, abs(y - 0.5));
    band *= 0.75 + 0.25 * fbm(uv * vec2(5.0, 3.0) - vec2(uTime * 0.02, 0.0));

    // 0→10 spectrum: --cn (closed) → --gold (mid) → --jade (open)
    vec3 cn = vec3(0.843, 0.227, 0.173);
    vec3 gold = vec3(0.788, 0.635, 0.294);
    vec3 jade = vec3(0.208, 0.769, 0.553);
    vec3 spectrum = uv.x < 0.5
      ? mix(cn, gold, uv.x * 2.0)
      : mix(gold, jade, (uv.x - 0.5) * 2.0);

    vec3 ink = vec3(0.043, 0.047, 0.055);
    vec3 col = mix(ink, spectrum, band * 0.16);

    // faint grain so the fog feels printed, not neon
    col += (hash(uv * uRes + uTime) - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const VERT = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

function FogPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value = clock.getElapsedTime();
    m.uniforms.uRes.value.set(size.width, size.height);
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    // ease toward scroll progress so the fog drifts rather than snaps
    const target = window.scrollY / max;
    m.uniforms.uScroll.value += (target - m.uniforms.uScroll.value) * 0.05;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export default function SpectrumFog() {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden
    >
      <FogPlane />
    </Canvas>
  );
}
