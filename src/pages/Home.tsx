import { Suspense, lazy, useEffect, useRef, useState } from "react";
import BootScreen from "@/components/home/BootScreen";
import HeroSection from "@/components/home/HeroSection";
import SelectStage from "@/components/home/SelectStage";
import BenchRoster from "@/components/home/BenchRoster";
import SpectrumStrip from "@/components/home/SpectrumStrip";
import ArenaSnapshot from "@/components/home/ArenaSnapshot";
import QuoteWall from "@/components/home/QuoteWall";

// W1 WebGL is code-split; the CSS gradient starfield in the Hero is the fallback
const CampParticles = lazy(() => import("@/components/CampParticles"));

/**
 * 首页 `/` — 选人台 (home.md).
 * W1 particle canvas is shared by the Hero (S1) and the select stage
 * (S2) as one fixed canvas; it fades out and stops rendering once the
 * bench roster (S3) enters the viewport.
 */
export default function Home() {
  const [booted, setBooted] = useState(false);
  const [particlesOn, setParticlesOn] = useState(true);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setParticlesOn(!entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative">
      <BootScreen onDone={() => setBooted(true)} />

      {/* W1 双阵营粒子星图 — fixed canvas shared across S1 + S2 */}
      <Suspense fallback={null}>
        <CampParticles
          className={
            "pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700 " +
            (particlesOn ? "opacity-100" : "opacity-0")
          }
        />
      </Suspense>

      <HeroSection booted={booted} />
      <SelectStage />

      {/* past this sentinel the particle canvas powers down */}
      <div ref={sentinel} aria-hidden />

      <div className="relative bg-ink">
        <BenchRoster />
        <SpectrumStrip />
        <ArenaSnapshot />
        <QuoteWall />
      </div>
    </div>
  );
}
