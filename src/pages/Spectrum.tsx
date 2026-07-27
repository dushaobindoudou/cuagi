import { lazy, Suspense, useState } from "react";
import { useReducedMotion } from "framer-motion";
import PageHeader from "@/components/intel/PageHeader";
import SpectrumAxis from "@/components/intel/SpectrumAxis";
import StanceGroups from "@/components/intel/StanceGroups";
import StanceClash from "@/components/intel/StanceClash";
import { updatedAt } from "@/lib/data";

const SpectrumFog = lazy(() => import("@/components/intel/SpectrumFog"));

/** one-shot WebGL capability probe (client-only app, no SSR) */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * /spectrum — 开源 ↔ 闭源立场光谱 (spectrum.md).
 * S1 header · S2 interactive stance axis over the W3 fog band ·
 * S3 stance groups wall · S4 quote clash. Footer comes from Layout.
 */
export default function Spectrum() {
  const [webgl] = useState(detectWebGL);
  const reduceMotion = useReducedMotion();

  return (
    <>
      <PageHeader
        title="开源立场"
        en="OPEN ↔ CLOSED"
        subtitle={`评分 0–10 · 依据管理层公开言论与实际开源行为 · 数据截至 ${updatedAt}`}
        subtitleEn={`Scored 0–10 from public statements and open-source behavior · data as of ${updatedAt}`}
      />

      {/* S2 主光谱 */}
      <section className="relative overflow-hidden py-16 md:min-h-[100dvh] md:py-24">
        {/* CSS fallback fog (always rendered; WebGL canvas overlays it) */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(214,58,44,0.10) 0%, rgba(201,162,75,0.08) 50%, rgba(53,196,141,0.10) 100%)",
            maskImage: "linear-gradient(180deg, transparent, black 25%, black 75%, transparent)",
            WebkitMaskImage:
              "linear-gradient(180deg, transparent, black 25%, black 75%, transparent)",
          }}
        />
        {webgl && !reduceMotion && (
          <Suspense fallback={null}>
            <div className="absolute inset-0" aria-hidden>
              <SpectrumFog />
            </div>
          </Suspense>
        )}

        <div className="relative z-10">
          <SpectrumAxis />
        </div>
      </section>

      {/* S3 立场分组墙 */}
      <StanceGroups />

      {/* S4 立场对撞金句 */}
      <StanceClash />
    </>
  );
}
