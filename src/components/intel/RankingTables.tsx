import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, useInView, animate } from "framer-motion";
import clsx from "clsx";
import type { ArenaRow } from "@/lib/data";
import { campColor } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import Stamp from "@/components/Stamp";
import { lmArenaRows, aaIndexRows, hasOpenNote } from "@/components/intel/arenaData";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** rank number rolls down from 99 to the actual value (arena.md S3) */
function RollRank({ value, delay }: { value: number; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(99);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(99, value, {
      duration: 0.6,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, delay]);
  return (
    <span ref={ref} className="w-10 shrink-0 font-anton text-[22px] leading-none text-bone">
      {display}
    </span>
  );
}

function TableColumn({
  title,
  en,
  rows,
  fromLeft,
}: {
  title: string;
  en: string;
  rows: ArenaRow[];
  fromLeft: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex items-baseline justify-between border-b border-line pb-4"
      >
        <h3 className="font-serifsc text-[22px] font-black text-bone">{title}</h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">{en}</span>
      </motion.div>

      <div>
        {rows.map((r, i) => {
          const isTop = i === 0;
          return (
            <motion.button
              key={`${r.companyId}-${r.model}-${r.date}`}
              type="button"
              data-cursor="OPEN ↗"
              onClick={() => navigate(`/company/${r.companyId}#rankings`)}
              initial={{ opacity: 0, x: fromLeft ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
              className={clsx(
                "group relative flex w-full items-center gap-3 border-b border-line px-3 py-3.5 text-left",
                "transition-colors duration-300 hover:bg-ink-2",
                isTop && "border border-gold/80 bg-ink-2/60",
              )}
            >
              <RollRank value={r.rank} delay={i * 0.05} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[14px] text-bone transition-colors group-hover:text-gold">
                  {r.model}
                  {hasOpenNote(r.score) && (
                    <span className="ml-2 inline-block border border-jade/70 px-1.5 py-px align-middle font-mono text-[9px] tracking-[0.12em] text-jade">
                      开源
                    </span>
                  )}
                </span>
                <span className="mt-1 flex items-center gap-2 text-[13px] text-bone-dim">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: campColor(r.camp) }}
                  />
                  {r.company}
                  <span className="font-mono text-[11px] text-mute">{r.score}</span>
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] tracking-[0.08em] text-mute">
                {r.date}
              </span>
              {isTop && (
                <Stamp
                  variant="top"
                  static
                  className="absolute -right-2 -top-3 h-10 w-20 rotate-6 opacity-90"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * S3 {lang === "zh" ? "榜单对照表" : "HEAD-TO-HEAD"} (arena.md): LMArena text board vs AA intelligence index,
 * aggregated across all 14 companies, rank ascending, snapshot date on
 * every row.
 */
export default function RankingTables() {
  const { lang } = useLang();
  return (
    <section className="border-b border-line py-16 md:py-24">
      <div className="mx-auto max-w-[1520px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="font-grotesk text-[12px] font-medium tracking-[0.3em] text-mute">
            LEADERBOARD SNAPSHOTS
          </p>
          <h2 className="mt-3 font-serifsc text-[32px] font-black text-bone md:text-[40px]">
            榜单对照表
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-[1.85] text-bone-dim">
            聚合 14 家公司在这两块榜单上的全部在录条目，按名次升序；均为动态快照，日期见各行。
          </p>
        </motion.div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-10">
          <TableColumn
            title={lang === "zh" ? "LMArena 文本榜（用户盲测 Elo）" : "LMArena TEXT ARENA (human-vote Elo)"}
            en="TEXT ARENA · SNAPSHOTS"
            rows={lmArenaRows}
            fromLeft
          />
          <TableColumn
            title={lang === "zh" ? "Artificial Analysis 智能指数" : "ARTIFICIAL ANALYSIS INTELLIGENCE INDEX"}
            en="INTELLIGENCE INDEX · SNAPSHOTS"
            rows={aaIndexRows}
            fromLeft={false}
          />
        </div>
      </div>
    </section>
  );
}
