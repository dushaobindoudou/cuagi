import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Company, TimelineEntry } from "@/lib/data";
import { companies, campColor, updatedAt } from "@/lib/data";
import { useLang } from "@/lib/i18n";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const LABEL_W = 176;
const TRACK_W = 2200;
const LANE_H = 72;
const DIVIDER_H = 40;

/* data spans 2021-09 (GLM-10B) → 2026-07; planned entries get a future slot */
const T0 = Date.parse("2021-09-01T00:00:00");
const T1 = Date.parse("2026-11-01T00:00:00");
const NOW = Date.parse(`${updatedAt}T00:00:00`);
const PLANNED_T = Date.parse("2026-10-01T00:00:00");

function parseEntryDate(d: string): { t: number; planned: boolean } {
  if (d === "规划中") return { t: PLANNED_T, planned: true };
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return { t: Date.parse(`${d}T00:00:00`), planned: false };
  if (/^\d{4}-\d{2}$/.test(d)) return { t: Date.parse(`${d}-15T00:00:00`), planned: false };
  if (/^\d{4}$/.test(d)) return { t: Date.parse(`${d}-07-01T00:00:00`), planned: false };
  const y = d.slice(0, 4); // e.g. "2025-2026"
  if (/^\d{4}$/.test(y)) return { t: Date.parse(`${y}-07-01T00:00:00`), planned: false };
  return { t: NOW, planned: false };
}

const xOf = (t: number): number => LABEL_W + ((t - T0) / (T1 - T0)) * TRACK_W;

/* 6-month tick marks across the span */
const TICKS: { t: number; label: string }[] = (() => {
  const out: { t: number; label: string }[] = [];
  for (let y = 2022; y <= 2026; y++) {
    for (const m of [1, 7]) {
      const t = Date.parse(`${y}-${String(m).padStart(2, "0")}-01T00:00:00`);
      if (t >= T0 && t <= NOW) out.push({ t, label: `${y}-${String(m).padStart(2, "0")}` });
    }
  }
  return out;
})();

interface Node {
  company: Company;
  entry: TimelineEntry;
  t: number;
  planned: boolean;
  isEvent: boolean;
  isFlagship: boolean;
  order: number; // global time order for the entrance wave
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

const chinaLanes = companies.filter((c) => c.camp === "china");
const usLanes = companies.filter((c) => c.camp === "us");

export default function MasterTimeline() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);

  /* drag-to-scroll with inertia (desktop) */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let raf = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      draggedRef.current = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      lastX = e.clientX;
      lastT = performance.now();
      vel = 0;
      cancelAnimationFrame(raf);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) draggedRef.current = true;
      el.scrollLeft = startScroll - dx;
      const now = performance.now();
      vel = ((e.clientX - lastX) / Math.max(1, now - lastT)) * 16;
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      let v = -vel;
      const step = () => {
        if (Math.abs(v) < 0.4) return;
        el.scrollLeft += v;
        v *= 0.94;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const onClickCapture = (e: MouseEvent) => {
      if (draggedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        draggedRef.current = false;
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClickCapture, true);
      cancelAnimationFrame(raf);
    };
  }, []);

  const nodesByCompany = useMemo(() => {
    const flat: Node[] = companies.flatMap((company) =>
      company.timeline.map((entry) => {
        const { t, planned } = parseEntryDate(entry.date);
        return {
          company,
          entry,
          t,
          planned,
          isEvent: entry.model.startsWith("（公司事件）"),
          isFlagship:
            !planned && entry.model.includes(company.flagshipModel) && company.flagshipModel !== "",
          order: 0,
        };
      }),
    );
    const sorted = [...flat].sort((a, b) => a.t - b.t);
    sorted.forEach((n, i) => (n.order = i));
    const map = new Map<string, Node[]>();
    for (const n of flat) {
      const arr = map.get(n.company.id) ?? [];
      arr.push(n);
      map.set(n.company.id, arr);
    }
    return map;
  }, []);

  const renderLane = (c: Company) => (
    <div
      key={c.id}
      className="group relative flex border-b border-line transition-colors duration-300 hover:bg-ink-2/80"
      style={{ height: LANE_H }}
    >
      {/* sticky lane label */}
      <div className="sticky left-0 z-20 flex w-[176px] shrink-0 items-center gap-3 border-r border-line bg-ink pl-4">
        <span
          aria-hidden
          className="h-8 w-1 shrink-0"
          style={{ backgroundColor: campColor(c.camp) }}
        />
        <span className="min-w-0">
          <span className="block truncate text-[14px] text-bone-dim transition-colors duration-300 group-hover:text-bone">
            {c.shortName}
          </span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-mute">
            {c.tier === "core" ? "CORE" : "FILE"} · {c.timeline.length} 条
          </span>
        </span>
      </div>

      {/* nodes */}
      <div className="relative flex-1">
        {(nodesByCompany.get(c.id) ?? []).map((n, ni) => {
          const left = xOf(n.t) - LABEL_W;
          const campHex = campColor(c.camp);
          const delay = Math.min(n.order * 0.02, 2);
          return (
            <motion.div
              key={ni}
              className="group/node absolute top-1/2 z-10"
              style={{ left }}
              initial={{ scale: 0, opacity: 0, y: "-50%" }}
              whileInView={{ scale: 1, opacity: 1, y: "-50%" }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <button
                type="button"
                data-cursor="OPEN ↗"
                aria-label={`${c.shortName} ${n.entry.model} ${n.entry.date}`}
                onClick={() => navigate(`/company/${c.id}#timeline`)}
                className="relative block -translate-x-1/2"
              >
                {n.isFlagship ? (
                  <span className="relative block">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-[0.14em] text-gold">
                      FLAGSHIP
                    </span>
                    <span className="block h-3.5 w-3.5 rotate-45 bg-gold shadow-glow-gold" />
                  </span>
                ) : n.planned ? (
                  <span className="block h-3 w-3 rotate-45 border border-dashed border-bone-dim bg-transparent" />
                ) : n.isEvent ? (
                  <span className="block h-2.5 w-2.5 border border-bone-dim/70 bg-transparent" />
                ) : c.tier === "core" ? (
                  <span
                    className="block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: campHex }}
                  />
                ) : (
                  <span
                    className="block h-2.5 w-2.5 rounded-full border-2 bg-ink"
                    style={{ borderColor: campHex }}
                  />
                )}

                {/* tooltip */}
                <span
                  className={clsx(
                    "pointer-events-none absolute bottom-full left-1/2 z-40 mb-3 w-[220px] -translate-x-1/2",
                    "border border-line bg-ink-2 p-3 text-left opacity-0 shadow-lg transition-all duration-200",
                    "translate-y-1 group-hover/node:translate-y-0 group-hover/node:opacity-100",
                  )}
                >
                  <span className="block font-mono text-[12px] font-medium text-bone">
                    {n.entry.model}
                  </span>
                  {n.entry.note && (
                    <span className="mt-1 block text-[11px] leading-relaxed text-bone-dim">
                      {truncate(n.entry.note, 64)}
                    </span>
                  )}
                  <span className="mt-1.5 block font-mono text-[10px] tracking-[0.08em] text-gold">
                    {n.entry.date}
                  </span>
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const bodyH = chinaLanes.length * LANE_H + DIVIDER_H + usLanes.length * LANE_H;

  return (
    <section className="border-b border-line py-16 md:py-24">
      <div className="mx-auto max-w-[1520px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="font-grotesk text-[12px] font-medium tracking-[0.3em] text-mute">
              MASTER TIMELINE
            </p>
            <h2 className="mt-3 font-serifsc text-[32px] font-black text-bone md:text-[40px]">
              {lang === "zh" ? "全模型编年" : "CHRONICLE"}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-[1.85] text-bone-dim">
              {lang === "zh"
                ? "14 条泳道 · 节点按真实日期比例定位。实心点 = 核心公司 · 空心点 = 其他 · 金菱形 = 旗舰 · 方点 = 公司事件 · 虚线菱形 = 规划中。"
                : "14 lanes, nodes placed to true date scale. Solid = core · hollow = others · gold diamond = flagship · square = company event · dashed = planned."}
            </p>
          </div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-mute">
            拖拽平移 · DRAG TO PAN ▸
          </p>
        </motion.div>
      </div>

      <div
        ref={scrollRef}
        className="mt-12 cursor-grab select-none overflow-x-auto active:cursor-grabbing"
      >
        <div className="mx-auto min-w-full" style={{ width: LABEL_W + TRACK_W }}>
          {/* time axis header */}
          <div className="relative h-10 border-b border-line">
            <div className="sticky left-0 z-20 flex h-full w-[176px] items-center border-r border-line bg-ink pl-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
                2021-09 → 2026-07
              </span>
            </div>
            <motion.div
              aria-hidden
              className="absolute bottom-0 left-[176px] right-0 h-px origin-left bg-mute/60"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.8, ease: EASE }}
            />
            {TICKS.map((tick) => (
              <span
                key={tick.label}
                className="absolute bottom-1 -translate-x-1/2 font-mono text-[11px] text-mute"
                style={{ left: xOf(tick.t) }}
              >
                {tick.label}
              </span>
            ))}
          </div>

          {/* body: gridlines + NOW line span all lanes */}
          <div className="relative" style={{ height: bodyH }}>
            {TICKS.map((tick) => (
              <span
                key={tick.label}
                aria-hidden
                className="absolute inset-y-0 w-px bg-line/60"
                style={{ left: xOf(tick.t) }}
              />
            ))}

            {/* SIDE A — china lanes */}
            {chinaLanes.map(renderLane)}

            {/* gold divider */}
            <div
              className="relative flex items-center border-y border-gold/60 bg-gold/5"
              style={{ height: DIVIDER_H }}
            >
              <div className="sticky left-0 z-20 flex h-full w-[176px] shrink-0 items-center justify-between border-r border-line bg-ink px-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-gold">SIDE A ▲</span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-gold">▼ SIDE B</span>
              </div>
              <span className="absolute left-1/2 h-[2px] w-[92%] -translate-x-1/2 bg-gold/70" />
            </div>

            {/* SIDE B — us lanes */}
            {usLanes.map(renderLane)}

            {/* NOW line */}
            <motion.div
              aria-hidden
              className="absolute inset-y-0 z-10 origin-top border-l border-dashed border-bone/60"
              style={{ left: xOf(NOW) }}
              initial={{ scaleY: 0, opacity: 0 }}
              whileInView={{ scaleY: 1, opacity: [0, 1, 0.35, 1] }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                scaleY: { delay: 2.2, duration: 0.6, ease: EASE },
                opacity: { delay: 2.2, duration: 0.9, times: [0, 0.5, 0.7, 1] },
              }}
            >
              <span className="absolute -top-0 left-1 whitespace-nowrap bg-ink px-1 font-mono text-[9px] tracking-[0.16em] text-bone">
                NOW · {updatedAt}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[1520px] px-5 md:px-10">
        <p className="font-mono text-[11px] leading-relaxed tracking-[0.08em] text-mute">
          {lang === "zh" ? `共 ${companies.reduce((n, c) => n + c.timeline.length, 0)} 个节点 · 悬停查看注记，点击进入该公司时间线。` : `${companies.reduce((n, c) => n + c.timeline.length, 0)} nodes · hover for notes, click through to each company timeline.`}
        </p>
      </div>
    </section>
  );
}
