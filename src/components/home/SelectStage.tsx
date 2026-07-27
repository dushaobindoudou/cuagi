import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Company } from "@/lib/data";
import { coreChina, coreUs, fileNo, portrait, campColor, signatureQuote, positioningOf } from "@/lib/data";
import InkImage from "@/components/InkImage";
import ScoreBar from "@/components/ScoreBar";
import { useLang } from "@/lib/i18n";

type Side = "china" | "us";

interface Sel {
  side: Side;
  idx: number;
}

interface BigCardProps {
  company: Company;
  side: Side;
  idx: number;
  active: boolean;
  dim: boolean;
  onActivate: (sel: Sel | null) => void;
  registerRef: (key: string, el: HTMLElement | null) => void;
}

function BigCard({ company: c, side, idx, active, dim, onActivate, registerRef }: BigCardProps) {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const hex = campColor(c.camp);
  const key = `${side}-${idx}`;

  const handleClick = () => {
    // mobile accordion: first tap expands, ENTER button navigates
    if (window.matchMedia("(max-width: 767px)").matches && !active) {
      onActivate({ side, idx });
      return;
    }
    navigate(`/company/${c.id}`);
  };

  return (
    <article
      ref={(el) => registerRef(key, el)}
      data-cursor="SELECT ▸"
      data-cursor-color={hex}
      data-card={side}
      tabIndex={0}
      role="link"
      aria-label={`${c.name} — ${t("viewAnalysis")}`}
      onMouseEnter={() => onActivate({ side, idx })}
      onFocus={() => onActivate({ side, idx })}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.stopPropagation();
          navigate(`/company/${c.id}`);
        }
      }}
      className={clsx(
        "relative min-w-0 overflow-hidden border bg-ink-2 outline-none",
        "transition-[filter,border-color,box-shadow,max-height] duration-500 ease-dossier",
        active
          ? "z-10 border-[var(--camp)] shadow-[0_0_40px_var(--camp-glow)]"
          : "border-line",
        dim && "brightness-[0.45]",
        // mobile stacked accordion heights
        active ? "max-md:h-[420px]" : "max-md:h-[180px]",
        "md:h-full md:w-full",
      )}
      style={
        {
          flexGrow: 1,
          flexBasis: 0,
          "--camp": hex,
          "--camp-glow": `${hex}40`,
          transitionProperty:
            "flex-grow, filter, border-color, box-shadow, height",
          transitionDuration: "0.55s, 0.4s, 0.4s, 0.4s, 0.45s",
        } as React.CSSProperties
      }
      data-grow={active ? "2.6" : "1"}
    >
      {/* portrait with W2 ink treatment (develops to color when active) */}
      <InkImage
        src={portrait(c)}
        alt={`${c.leader.name}`}
        camp={c.camp}
        active={active}
        className="absolute inset-0 h-full w-full"
        imgClassName="object-top"
      />
      {/* top fade into ink */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/80 to-transparent" />
      {/* bottom fade for legibility */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/55 to-transparent" />

      {/* meta row */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <span className="font-mono text-[11px] tracking-[0.16em] text-bone-dim">
          NO. {fileNo(c)}
        </span>
        <span className="flex flex-col items-end gap-1">
          <span className="font-mono text-[10px] tracking-[0.16em] text-mute">
            OS {c.openSourceScore}/10
          </span>
          <ScoreBar score={c.openSourceScore} mini />
        </span>
      </div>

      {/* bottom band + expansion panel */}
      <div className="absolute inset-x-0 bottom-0">
        <div
          className={clsx(
            "overflow-hidden px-4 transition-all duration-500 ease-dossier",
            active ? "max-h-[260px] translate-y-0 opacity-100" : "max-h-0 translate-y-6 opacity-0",
          )}
        >
          <p className="font-mono text-[12px] tracking-[0.12em] text-gold">{c.flagshipModel}</p>
          <p className="mt-2 line-clamp-2 text-[14px] leading-[1.7] text-bone-dim">
            {positioningOf(c, lang)}
          </p>
          <p className="mt-3 line-clamp-2 font-serifsc text-[16px] font-bold leading-snug text-bone">
            「{signatureQuote(c, lang)}」
          </p>
          <button
            type="button"
            data-cursor="OPEN ↗"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/company/${c.id}`);
            }}
            className="mb-1 mt-4 inline-block border border-gold px-4 py-2 font-mono text-[12px] tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            {t("enterCard")}
          </button>
        </div>
        <div className="border-t border-line/60 bg-ink/70 px-4 py-3 backdrop-blur-[2px]">
          <h3 className="font-serifsc text-[26px] font-black leading-none text-bone md:text-[30px]">
            {c.shortName}
          </h3>
          <p className="mt-1.5 font-mono text-[13px] tracking-[0.08em] text-bone-dim">
            {c.leader.name} · {c.leader.role}
          </p>
        </div>
      </div>
    </article>
  );
}

/**
 * 核心六家对垒 — one full-screen stage: three cards per camp facing off
 * across a static VS seal. One-time entrance animation (no scroll pin);
 * hover/focus expands flex-grow 1 → 2.6 with the W2 color-develop,
 * expansion panel, camp border glow and sibling dimming.
 * Keyboard: ← → move within a column, ↑ ↓ / Tab cross sides, Enter opens.
 */
export default function SelectStage() {
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [sel, setSel] = useState<Sel | null>(null);
  const navigate = useNavigate();
  const { lang, t } = useLang();

  const registerRef = (key: string, el: HTMLElement | null) => {
    if (el) cardRefs.current.set(key, el);
    else cardRefs.current.delete(key);
  };

  // keyboard character-select handling
  const onKeyDown = (e: React.KeyboardEvent) => {
    const cols: Record<Side, Company[]> = { china: coreChina, us: coreUs };
    const cur = sel ?? { side: "china" as Side, idx: -1 };
    let next: Sel | null = null;
    if (e.key === "ArrowRight") {
      next = { side: cur.side, idx: Math.min(cols[cur.side].length - 1, cur.idx + 1) };
    } else if (e.key === "ArrowLeft") {
      next = { side: cur.side, idx: Math.max(0, cur.idx - 1) };
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Tab") {
      e.preventDefault();
      const side: Side = cur.side === "china" ? "us" : "china";
      next = { side, idx: Math.max(0, Math.min(cols[side].length - 1, cur.idx)) };
    } else if (e.key === "Enter" && sel) {
      navigate(`/company/${cols[sel.side][sel.idx].id}`);
      return;
    } else if (e.key === "Escape") {
      setSel(null);
      return;
    }
    if (next) {
      setSel(next);
      cardRefs.current.get(`${next.side}-${next.idx}`)?.focus();
    }
  };

  const renderCol = (side: Side, list: Company[]) => (
    <motion.div
      className="flex flex-1 flex-col gap-3 md:flex-row md:gap-4"
      initial={{ x: side === "china" ? -60 : 60, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      onMouseLeave={() => setSel((s) => (s && s.side === side ? null : s))}
    >
      {list.map((c, idx) => {
        const active = sel?.side === side && sel.idx === idx;
        const dim = sel?.side === side && sel.idx !== idx;
        return (
          <div
            key={c.id}
            className="min-w-0 transition-[flex-grow] ease-dossier max-md:contents md:h-full"
            style={{ flexGrow: active ? 2.6 : 1, flexBasis: 0, transitionDuration: "550ms" }}
          >
            <BigCard
              company={c}
              side={side}
              idx={idx}
              active={active}
              dim={dim}
              onActivate={setSel}
              registerRef={registerRef}
            />
          </div>
        );
      })}
    </motion.div>
  );

  return (
    <section className="relative overflow-hidden border-t border-line" onKeyDown={onKeyDown}>
      {/* full-screen stage: everything visible in one viewport */}
      <div className="stage-inner relative flex min-h-[100dvh] flex-col justify-center py-8 md:py-0">
        {/* title row */}
        <div className="mx-auto grid w-full max-w-[1520px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-10">
          <div className="stage-title">
            <p className="font-mono text-[11px] tracking-[0.3em] text-mute">SIDE A</p>
            <h2 className="font-serifsc text-[28px] font-black text-cn md:text-[40px]">
              {lang === "zh" ? (
                <>
                  中国阵营 <span className="font-anton tracking-[0.02em]">CHINA</span>
                </>
              ) : (
                <span className="font-anton tracking-[0.02em]">CHINA</span>
              )}
            </h2>
          </div>
          <motion.div
            className="vs-badge relative flex h-20 w-20 items-center justify-center md:h-24 md:w-24"
            initial={{ scale: 0.6, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.25 }}
          >
            <svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full animate-spin-slow">
              <circle
                cx="48" cy="48" r="44" fill="none" stroke="#C9A24B" strokeWidth="1.5"
                strokeDasharray="40 12 60 12" strokeLinecap="round"
              />
            </svg>
            <span className="font-anton text-[40px] text-gold md:text-[56px]">VS</span>
          </motion.div>
          <div className="stage-title text-right">
            <p className="font-mono text-[11px] tracking-[0.3em] text-mute">SIDE B</p>
            <h2 className="font-serifsc text-[28px] font-black text-us md:text-[40px]">
              {lang === "zh" ? (
                <>
                  美国阵营 <span className="font-anton tracking-[0.02em]">UNITED STATES</span>
                </>
              ) : (
                <span className="font-anton tracking-[0.02em]">UNITED STATES</span>
              )}
            </h2>
          </div>
        </div>

        {/* cards */}
        <div className="mx-auto mt-6 flex w-full max-w-[1520px] flex-col gap-8 px-5 md:mt-8 md:h-[62vh] md:flex-row md:gap-6 md:px-10">
          {renderCol("china", coreChina)}
          {renderCol("us", coreUs)}
        </div>

        <p className="mx-auto mt-5 hidden w-full max-w-[1520px] px-10 font-mono text-[10px] tracking-[0.2em] text-mute md:block">
          {t("stageHint")}
        </p>
      </div>
    </section>
  );
}
