import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  motion,
  AnimatePresence,
  useInView,
  animate,
  useReducedMotion,
} from "framer-motion";
import clsx from "clsx";
import type { Company } from "@/lib/data";
import { companies, portrait, campColor, spectrumColor } from "@/lib/data";
import InkImage from "@/components/InkImage";
import { stanceWord } from "@/components/intel/stance";
import { useLang } from "@/lib/i18n";
import { quoteTextOf } from "@/lib/data";

const BACK_OUT_18 = [0.34, 1.8, 0.64, 1] as [number, number, number, number];
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* stagger order: score ascending — Anthropic first, DeepSeek last */
const ENTRANCE_ORDER: string[] = [...companies]
  .sort((a, b) => a.openSourceScore - b.openSourceScore || a.id.localeCompare(b.id))
  .map((c) => c.id);

/* same-score pucks fan upward in a vertical stack (12px steps) */
const STACK_INDEX: Record<string, number> = (() => {
  const byScore = new Map<number, Company[]>();
  for (const c of companies) {
    const g = byScore.get(c.openSourceScore) ?? [];
    g.push(c);
    byScore.set(c.openSourceScore, g);
  }
  const out: Record<string, number> = {};
  byScore.forEach((g) => g.forEach((c, i) => (out[c.id] = i)));
  return out;
})();

const closedCount = companies.filter((c) => c.openSourceScore <= 4).length;
const openCount = companies.filter((c) => c.openSourceScore >= 7).length;

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

/* ── Tug-of-war count number ──────────────────────────────────────────── */

function TugNumber({
  value,
  color,
  label,
  delay,
  align,
}: {
  value: number;
  color: string;
  label: string;
  delay: number;
  align: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.1,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, delay]);

  return (
    <div ref={ref} className={clsx("flex flex-col", align === "right" && "items-end text-right")}>
      <span className="font-anton text-[48px] leading-none md:text-[64px]" style={{ color }}>
        {display}
      </span>
      <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-dim">
        {label}
      </span>
    </div>
  );
}

/* ── Jade particle burst when the last puck (DeepSeek, 10) lands ─────── */

function ParticleBurst({ delay }: { delay: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2 + 0.35;
        const dist = 26 + ((i * 37) % 22);
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.7,
          s: 2 + ((i * 13) % 3),
        };
      }),
    [],
  );
  return (
    <span aria-hidden className="pointer-events-none absolute left-0 top-0">
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full bg-jade"
          style={{ width: p.s, height: p.s }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          whileInView={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1, 0.2] }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.85, delay, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

/* ── Hover detail card content (shared by desktop card & mobile drawer) ── */

function StanceDetail({ c, lang }: { c: Company; lang: "zh" | "en" }) {
  const q = c.insights.openSource.quotes[0];
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-serifsc text-[18px] font-black text-bone">
          {c.shortName}
          <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-mute">
            {c.englishName}
          </span>
        </p>
        <span
          className="font-anton text-[34px] leading-none"
          style={{ color: spectrumColor(c.openSourceScore) }}
        >
          {c.openSourceScore}
          <span className="ml-1 font-mono text-[10px] text-mute">/10</span>
        </span>
      </div>
      <p className="mt-2 flex items-center gap-2">
        <span
          className="border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.16em]"
          style={{
            color: spectrumColor(c.openSourceScore),
            borderColor: spectrumColor(c.openSourceScore),
          }}
        >
          {stanceWord(c.openSourceScore, lang)}
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-mute">
          {c.camp === "china" ? (lang === "zh" ? "● 中国阵营" : "● CHINA") : (lang === "zh" ? "● 美国阵营" : "● UNITED STATES")}
        </span>
      </p>
      <p className="mt-3 text-[13px] leading-[1.75] text-bone-dim">
        {truncate(lang === "en" && c.insights.openSource.summaryEn ? c.insights.openSource.summaryEn : c.insights.openSource.summary, 100)}
      </p>
      {q && (
        <blockquote className="mt-3 border-l-2 pl-3" style={{ borderColor: campColor(c.camp) }}>
          <p className="font-serifsc text-[13px] font-bold leading-[1.7] text-bone">
            {truncate(quoteTextOf(q, lang), 80)}
          </p>
          {lang === "zh" && q.translation && (
            <p className="mt-1 text-[11px] leading-relaxed text-mute">
              {truncate(q.translation, 70)}
            </p>
          )}
          <p className="mt-1.5 font-mono text-[10px] tracking-[0.08em] text-mute">
            {q.source} · {q.date}
          </p>
        </blockquote>
      )}
      <p className="mt-3 font-mono text-[11px] tracking-[0.16em] text-gold">{lang === "zh" ? "查看语录分析 ▸" : "VIEW ANALYSIS ▸"}</p>
    </>
  );
}

/* ── Main axis (desktop horizontal / mobile vertical) ─────────────────── */

export default function SpectrumAxis() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const reduceMotion = useReducedMotion();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mobileId, setMobileId] = useState<string | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const axisRef = useRef<HTMLDivElement>(null);
  const [axisW, setAxisW] = useState(1200);

  useEffect(() => {
    const el = axisRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAxisW(el.clientWidth));
    ro.observe(el);
    setAxisW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    },
    [],
  );

  const openHover = (id: string) => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    setHoverId(id);
  };
  const scheduleClear = () => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setHoverId(null), 160);
  };

  const hovered = hoverId ? companies.find((c) => c.id === hoverId) : undefined;
  const mobileActive = mobileId ? companies.find((c) => c.id === mobileId) : undefined;

  /* detail card x follows the hovered puck, clamped & flipped at the edges */
  const CARD_W = 360;
  const cardX = hovered
    ? Math.max(0, Math.min(axisW - CARD_W, (hovered.openSourceScore / 10) * axisW - CARD_W / 2))
    : 0;

  const entranceDelay = (id: string) => 1.0 + ENTRANCE_ORDER.indexOf(id) * 0.09;
  const lastDelay = entranceDelay(ENTRANCE_ORDER[ENTRANCE_ORDER.length - 1]) + 0.55;

  return (
    <div className="relative mx-auto max-w-[1520px] px-5 md:px-10">
      {/* dual-encoding legend */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.16em] text-bone-dim"
      >
        <span className="text-gold">{lang === "zh" ? "双重编码" : "DOUBLE ENCODING"}</span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-cn" /> {lang === "zh" ? "描边 = 中国阵营" : "BORDER = CHINA"}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-us" /> {lang === "zh" ? "描边 = 美国阵营" : "BORDER = UNITED STATES"}
        </span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-6"
            style={{
              background:
                "linear-gradient(90deg, var(--cn), var(--gold), var(--jade))",
            }}
          />
          {lang === "zh" ? "落位 = 开源立场 0→10" : "POSITION = OPENNESS 0→10"}
        </span>
      </motion.div>

      {/* ── Desktop horizontal axis ── */}
      <div className="relative mt-10 hidden h-[480px] md:block">
        {/* tug-of-war counters */}
        <div className="absolute left-0 top-0">
          <TugNumber value={closedCount} color="var(--cn)" label={lang === "zh" ? "闭源阵营 ≤4" : "CLOSED ≤4"} delay={1.6} align="left" />
        </div>
        <div className="absolute right-0 top-0">
          <TugNumber value={openCount} color="var(--jade)" label={lang === "zh" ? "开源阵营 ≥7" : "OPEN ≥7"} delay={1.6} align="right" />
        </div>
        <p className="absolute left-1/2 top-6 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
          {lang === "zh" ? "TUG OF WAR · 中段 5–6 不计入两端" : "TUG OF WAR · 5–6 COUNTS FOR NEITHER SIDE"}
        </p>

        {/* axis: 90% width */}
        <div ref={axisRef} className="absolute left-[5%] right-[5%] top-[64%]">
          {/* spectrum band */}
          <motion.div
            className="relative h-[6px] origin-left"
            style={{
              background:
                "linear-gradient(90deg, var(--cn) 0%, var(--gold) 50%, var(--jade) 100%)",
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
          />
          {/* ticks 0–10 */}
          {Array.from({ length: 11 }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute top-[-4px] h-[14px] w-px bg-mute/70"
              style={{ left: `${i * 10}%` }}
            />
          ))}
          {/* center tension marker — yields 8px toward the majority then springs back */}
          <motion.span
            aria-hidden
            className="absolute top-[-10px] h-[26px] w-[2px] bg-gold"
            style={{ left: "50%" }}
            initial={{ x: 0, opacity: 0 }}
            whileInView={{ x: [0, 8, 0], opacity: 1 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ x: { delay: 2.6, duration: 0.9, ease: "easeInOut" }, opacity: { delay: 1, duration: 0.3 } }}
          />
          {/* end labels */}
          <div className="mt-4 flex justify-between font-mono text-[11px] tracking-[0.16em]">
            <span className="text-cn">{lang === "zh" ? "0 · 坚定闭源" : "0 · CLOSED"}</span>
            <span className="text-jade">{lang === "zh" ? "10 · 全面开源" : "10 · OPEN"}</span>
          </div>

          {/* pucks */}
          {companies.map((c) => {
            const stackIdx = STACK_INDEX[c.id];
            const hoveredNow = hoverId === c.id;
            return (
              <motion.div
                key={c.id}
                className="absolute"
                style={{ left: `${c.openSourceScore * 10}%`, top: 0 }}
                initial={{ y: 40, scale: 0.6, opacity: 0 }}
                whileInView={{ y: 0, scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{
                  delay: reduceMotion ? 0.1 : entranceDelay(c.id),
                  duration: 0.7,
                  ease: BACK_OUT_18,
                }}
              >
                <div
                  className="relative -translate-x-1/2"
                  style={{ marginTop: -56 - stackIdx * 12 }}
                >
                  {c.openSourceScore === 10 && <ParticleBurst delay={lastDelay} />}
                  <motion.button
                    type="button"
                    data-cursor="SELECT ▸"
                    aria-label={`${c.shortName} 开源评分 ${c.openSourceScore}/10`}
                    onClick={() => navigate(`/company/${c.id}`)}
                    onMouseEnter={() => openHover(c.id)}
                    onMouseLeave={scheduleClear}
                    onFocus={() => openHover(c.id)}
                    onBlur={scheduleClear}
                    animate={{ scale: hoveredNow ? 1.35 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="block h-14 w-14 overflow-hidden rounded-full border-2 bg-ink-2 outline-none"
                    style={{ borderColor: campColor(c.camp), zIndex: hoveredNow ? 30 : 10 + stackIdx }}
                  >
                    <InkImage
                      src={portrait(c)}
                      alt={`${c.leader.name} 肖像`}
                      camp={c.camp}
                      active={hoveredNow}
                      className="h-full w-full rounded-full"
                    />
                  </motion.button>
                </div>
                {/* name labels: two alternating rows below the axis */}
                <span
                  className={clsx(
                    "absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] transition-colors",
                    hoveredNow ? "text-bone" : "text-bone-dim",
                  )}
                  style={{ top: 14 + (stackIdx % 2) * 17 }}
                >
                  {c.shortName}
                </span>
              </motion.div>
            );
          })}

          {/* hover detail card — spring-follows the puck, flips at edges */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                key={hovered.id}
                className="absolute z-40"
                style={{ width: CARD_W, bottom: 132 }}
                initial={{ opacity: 0, y: 12, x: cardX }}
                animate={{ opacity: 1, y: 0, x: cardX }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                onMouseEnter={() => openHover(hovered.id)}
                onMouseLeave={scheduleClear}
              >
                <button
                  type="button"
                  data-cursor="SELECT ▸"
                  onClick={() => navigate(`/company/${hovered.id}`)}
                  className="block w-full border bg-ink-2/95 p-5 text-left backdrop-blur-sm transition-colors hover:bg-ink-3"
                  style={{ borderColor: campColor(hovered.camp) }}
                >
                  <StanceDetail c={hovered} lang={lang} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Mobile vertical axis (0 on top) ── */}
      <div className="mt-10 md:hidden">
        <div className="mb-6 flex items-end justify-between">
          <TugNumber value={closedCount} color="var(--cn)" label={lang === "zh" ? "闭源阵营 ≤4" : "CLOSED ≤4"} delay={0.4} align="left" />
          <TugNumber value={openCount} color="var(--jade)" label={lang === "zh" ? "开源阵营 ≥7" : "OPEN ≥7"} delay={0.4} align="right" />
        </div>
        <div className="relative mx-auto h-[560px] w-full">
          <motion.div
            className="absolute left-1/2 top-0 h-full w-[6px] origin-top -translate-x-1/2"
            style={{
              background:
                "linear-gradient(180deg, var(--cn) 0%, var(--gold) 50%, var(--jade) 100%)",
            }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
          />
          {Array.from({ length: 11 }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute left-1/2 h-px w-[10px] -translate-x-1/2 bg-mute/70"
              style={{ top: `${i * 10}%` }}
            />
          ))}
          {companies.map((c, i) => {
            const leftSide = i % 2 === 0;
            const active = mobileId === c.id;
            return (
              <motion.button
                key={c.id}
                type="button"
                aria-label={`${c.shortName} 开源评分 ${c.openSourceScore}/10`}
                onClick={() => setMobileId(active ? null : c.id)}
                className="absolute flex items-center gap-2"
                style={{
                  top: `${c.openSourceScore * 10}%`,
                  left: "50%",
                  flexDirection: leftSide ? "row-reverse" : "row",
                  marginLeft: leftSide ? -158 : 14,
                }}
                initial={{ opacity: 0, scale: 0.6, y: "-50%" }}
                whileInView={{ opacity: 1, scale: 1, y: "-50%" }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ delay: 0.3 + ENTRANCE_ORDER.indexOf(c.id) * 0.05, duration: 0.5, ease: BACK_OUT_18 }}
              >
                <span
                  className="block h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 bg-ink-2"
                  style={{ borderColor: campColor(c.camp) }}
                >
                  <InkImage
                    src={portrait(c)}
                    alt={`${c.leader.name} 肖像`}
                    camp={c.camp}
                    active={active}
                    className="h-full w-full rounded-full"
                  />
                </span>
                <span
                  className={clsx(
                    "whitespace-nowrap font-mono text-[11px]",
                    active ? "text-bone" : "text-bone-dim",
                  )}
                >
                  {c.shortName} · {c.openSourceScore}
                </span>
              </motion.button>
            );
          })}
          <p className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.16em] text-cn">
            0 · 闭源
          </p>
          <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.16em] text-jade">
            10 · 开源
          </p>
        </div>

        {/* tap drawer */}
        <AnimatePresence>
          {mobileActive && (
            <motion.div
              key={mobileActive.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-8 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => navigate(`/company/${mobileActive.id}`)}
                className="block w-full border bg-ink-2 p-5 text-left"
                style={{ borderColor: campColor(mobileActive.camp) }}
              >
                <StanceDetail c={mobileActive} lang={lang} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
