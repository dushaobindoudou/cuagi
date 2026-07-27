import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, useInView, animate } from "framer-motion";
import clsx from "clsx";
import { arenaColumns, campColor } from "@/lib/data";
import type { ArenaRow } from "@/lib/data";
import Stamp from "@/components/Stamp";
import { useLang } from "@/lib/i18n";

/** Rank number rolls down from 99 to the real value once in view. */
function RollingRank({ rank, gold }: { rank: number; gold: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [v, setV] = useState(99);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(99, rank, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (x) => setV(Math.round(x)),
    });
    return () => controls.stop();
  }, [inView, rank]);
  return (
    <span
      ref={ref}
      className={clsx("font-anton text-[28px] leading-none", gold ? "text-gold" : "text-bone-dim")}
    >
      {String(v).padStart(2, "0")}
    </span>
  );
}

function Row({ row, first }: { row: ArenaRow; first: boolean }) {
  return (
    <li
      className={clsx(
        "flex items-center gap-3 border-b border-line/60 px-3 py-3",
        first && "animate-ring-breathe border border-gold/70 bg-ink-3/60",
      )}
    >
      <RollingRank rank={row.rank} gold={first} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[14px] text-bone">{row.model}</p>
        <p className="mt-0.5 flex items-center gap-2 text-[13px] text-bone-dim">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: campColor(row.camp) }}
          />
          {row.company}
        </p>
      </div>
      <div className="text-right">
        {first && <Stamp variant="top" static className="mb-1 h-6 w-12" />}
        <p className="max-w-[120px] truncate font-mono text-[11px] text-gold" title={row.score}>
          {row.score}
        </p>
        <p className="font-mono text-[10px] text-mute">{row.date}</p>
      </div>
    </li>
  );
}

/**
 * S5 榜单快照 (home.md): three leaderboard columns aggregated from
 * models.json rankings; ranks roll in, TOP 1 breathes gold.
 */
export default function ArenaSnapshot() {
  const { lang, t } = useLang();
  return (
    <section className="relative border-t border-line py-20 md:py-28">
      <div className="mx-auto max-w-[1520px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-between gap-6"
        >
          <h2 className="font-serifsc text-[32px] font-black text-bone md:text-[40px]">
            {lang === "zh" ? (
              <>
                <span className="mr-3 font-anton text-[28px] tracking-[0.02em] text-gold md:text-[36px]">
                  RANKINGS
                </span>
                · 排行榜快照
              </>
            ) : (
              <span className="font-anton text-[32px] tracking-[0.02em] text-gold md:text-[40px]">
                RANKINGS SNAPSHOT
              </span>
            )}
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {arenaColumns.map((col, i) => (
            <motion.div
              key={col.key}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="border border-line bg-ink-2"
            >
              <header className="border-b border-line px-4 py-3">
                <h3 className="font-serifsc text-[16px] font-bold text-bone">{col.title}</h3>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                  {col.en} · TOP 5
                </p>
              </header>
              <ul>
                {col.rows.map((row, ri) => (
                  <Row key={`${row.companyId}-${row.model}`} row={row} first={ri === 0} />
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            to="/arena"
            data-cursor="OPEN ↗"
            className="border border-gold px-5 py-2.5 font-mono text-[12px] tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            {t("enterArena")}
          </Link>
        </div>
      </div>
    </section>
  );
}
