import { useEffect, useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Company } from "@/lib/data";
import { spectrumColor, quoteTextOf } from "@/lib/data";
import { stanceLabel, truncate } from "@/components/detail/helpers";
import { useLang } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

const CX = 160;
const CY = 170;
const R = 130;
const START = 150; // degrees, y-down screen coords
const SWEEP = 240;

const polar = (deg: number, r: number): [number, number] => {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
};

const arcPath = (from: number, to: number, r: number): string => {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
};

interface ScoreDialProps {
  company: Company;
}

/**
 * S3 开源立场评分 (detail.md §S3): giant count-up score + 240° semicircular
 * SVG gauge (10 ticks, needle) + stance verdict. On entering the viewport
 * the ring sweeps 0 → score (1.2s power2.inOut), ticks light up in sequence
 * and the verdict de-blurs after the sweep. GSAP-only component.
 */
export default function ScoreDial({ company: c }: ScoreDialProps) {
  const { lang, t } = useLang();
  const score = Math.max(0, Math.min(10, Math.round(c.openSourceScore)));
  const color = spectrumColor(score);

  const rootRef = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const needleRef = useRef<SVGLineElement>(null);
  const tickRefs = useRef<(SVGLineElement | null)[]>([]);
  const verdictRef = useRef<HTMLDivElement>(null);

  const stanceQuote = (() => {
    const q = c.insights.openSource.quotes[0];
    if (!q) return "";
    const raw =
      lang === "en"
        ? quoteTextOf(q, "en")
        : q.translation && q.translation.trim() && /^[ -~]/.test(q.text)
          ? q.translation
          : q.text;
    return truncate(raw, 60);
  })();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
      });

      // ring sweep + needle
      tl.fromTo(
        arcRef.current,
        { strokeDashoffset: 100 },
        { strokeDashoffset: 100 - score * 10, duration: 1.2 },
        0,
      );
      tl.fromTo(
        needleRef.current,
        { rotation: 0, svgOrigin: `${CX} ${CY}` },
        { rotation: (score / 10) * SWEEP, duration: 1.2 },
        0,
      );
      // tick segments light up in sequence
      tickRefs.current.forEach((tick, i) => {
        if (!tick || i >= score) return;
        tl.to(
          tick,
          { attr: { stroke: spectrumColor(i + 1) }, duration: 0.08, ease: "none" },
          0.06 + (i / Math.max(score, 1)) * 1.1,
        );
      });
      // giant score count-up
      tl.to(
        counter,
        {
          v: score,
          duration: 1.2,
          onUpdate: () => {
            if (numRef.current) numRef.current.textContent = String(Math.round(counter.v));
          },
        },
        0,
      );
      // verdict de-blur after the sweep
      tl.fromTo(
        verdictRef.current,
        { filter: "blur(6px)", opacity: 0 },
        { filter: "blur(0px)", opacity: 1, duration: 0.6, ease: "power2.out" },
        1.25,
      );
    }, rootRef);
    return () => ctx.revert();
  }, [score, c.id]);

  const [nx2, ny2] = polar(START, R - 34);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[40vh] items-center overflow-hidden border-y border-line bg-ink-2"
    >
      <div
        aria-hidden
        className="halftone-dots pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ color }}
      />
      <div className="mx-auto grid w-full max-w-[1520px] items-center gap-10 px-5 py-16 md:grid-cols-12 md:px-10">
        {/* left: giant score */}
        <div className="flex items-baseline justify-center gap-3 md:col-span-3 md:justify-start">
          <span
            ref={numRef}
            className="font-anton text-[clamp(96px,12vw,160px)] leading-none"
            style={{ color }}
          >
            0
          </span>
          <span className="font-mono text-[24px] text-mute">/10</span>
        </div>

        {/* center: gauge */}
        <div className="flex justify-center md:col-span-4">
          <svg viewBox="0 0 320 200" className="w-full max-w-[360px]" role="img" aria-label={`开源立场评分 ${score}/10`}>
            {/* base ring */}
            <path d={arcPath(START, START + SWEEP, R)} fill="none" stroke="var(--line)" strokeWidth={14} />
            {/* progress ring */}
            <path
              ref={arcRef}
              d={arcPath(START, START + SWEEP, R)}
              fill="none"
              stroke={color}
              strokeWidth={14}
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset={100}
            />
            {/* ticks */}
            {Array.from({ length: 11 }, (_, i) => {
              const a = START + i * (SWEEP / 10);
              const [x1, y1] = polar(a, R - 13);
              const [x2, y2] = polar(a, R + 13);
              return (
                <line
                  key={i}
                  ref={(el) => {
                    tickRefs.current[i] = el;
                  }}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--mute)"
                  strokeWidth={i === 0 || i === 10 ? 3 : 2}
                />
              );
            })}
            {/* needle */}
            <line
              ref={needleRef}
              x1={CX}
              y1={CY}
              x2={nx2}
              y2={ny2}
              stroke="var(--bone)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={CX} cy={CY} r={6} fill="var(--bone)" />
            <text
              x={CX}
              y={CY - 30}
              textAnchor="middle"
              fill="var(--mute)"
              fontFamily="'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
            >
              OPEN SOURCE
            </text>
          </svg>
        </div>

        {/* right: verdict */}
        <div ref={verdictRef} className="text-center opacity-0 md:col-span-5 md:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
            STANCE VERDICT · 立场判定
          </p>
          <p className="mt-3 font-serifsc text-[32px] font-black" style={{ color }}>
            {stanceLabel(score)}
          </p>
          {stanceQuote && (
            <p className="mt-4 max-w-md text-[14px] leading-[1.85] text-bone-dim md:mx-0 mx-auto">
              “{stanceQuote}”
            </p>
          )}
          <Link
            to="/spectrum"
            data-cursor="OPEN ↗"
            className="mt-6 inline-block font-mono text-[12px] uppercase tracking-[0.16em] text-gold transition-colors hover:text-bone"
          >
            {t("enterSpectrum")}
          </Link>
        </div>
      </div>
    </section>
  );
}
