import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";
import type { Company } from "@/lib/data";
import { campColor, updatedAt } from "@/lib/data";
import SectionHead from "@/components/detail/SectionHead";
import Stamp from "@/components/Stamp";
import { useLang } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

const COLUMNS: [string, string][] = [
  ["榜单", "BOARD"],
  ["名次", "RANK"],
  ["得分", "SCORE"],
  ["模型", "MODEL"],
  ["快照日期", "DATE"],
];

interface RankingsTableProps {
  company: Company;
}

/**
 * S5 榜单名次 (detail.md §S5): full-width snapshot table — rank in Anton
 * (1st gold + TOP 1 stamp, 2–3 bone, else mute), per-row snapshot dates and
 * a gold notice bar. Rows stagger in from the left; rank numbers roll down
 * from 99 (0.7s). GSAP-only section.
 */
export default function RankingsTable({ company: c }: RankingsTableProps) {
  const hex = campColor(c.camp);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const rankRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // header word-level fade
      gsap.fromTo(
        ".rk-head-word",
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 78%", once: true },
        },
      );
      // row stagger + rank roll-down
      gsap.fromTo(
        ".rk-row",
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ".rk-body", start: "top 82%", once: true },
        },
      );
      rankRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = c.rankings[i]?.rank ?? 0;
        const roll = { v: 99 };
        gsap.to(roll, {
          v: target,
          duration: 0.7,
          delay: i * 0.08,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = String(Math.round(roll.v));
          },
          scrollTrigger: { trigger: ".rk-body", start: "top 82%", once: true },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, [c]);

  return (
    <section className="mx-auto max-w-[1520px] px-5 py-24 md:px-10">
      <SectionHead en="RANKINGS" zh="榜单在册" />

      <div ref={rootRef}>
        {/* notice bar */}
        <p className="mt-8 border border-gold/70 px-4 py-2.5 font-mono text-[12px] tracking-[0.12em] text-gold">
          {lang === "zh"
            ? `⚠ 榜单为动态快照，日期见每行；数据截至 ${updatedAt}`
            : `⚠ Leaderboards are rolling snapshots — date per row; data as of ${updatedAt}`}
        </p>

        {c.rankings.length === 0 ? (
          <div className="mt-8 border border-dashed border-line px-6 py-14 text-center font-mono text-[13px] tracking-[0.12em] text-mute">
            {lang === "zh"
              ? "暂无数据 —— 该公司未进入两大榜单快照"
              : "No data — not present in either leaderboard snapshot"}
          </div>
        ) : (
          <div className="rk-body mt-8 overflow-x-auto">
            {/* header */}
            <div className="grid min-w-[720px] grid-cols-[1.4fr_0.6fr_1.2fr_1fr_0.8fr] gap-4 border-b border-line pb-3">
              {COLUMNS.map(([zh, en]) => (
                <span key={en} className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
                  {(lang === "zh" ? `${zh} ${en}` : en).split(" ").map((w) => (
                    <span key={w} className="rk-head-word mr-2 inline-block">
                      {w}
                    </span>
                  ))}
                </span>
              ))}
            </div>
            {/* rows */}
            {c.rankings.map((r, i) => (
              <div
                key={`${r.board}-${r.rank}-${r.model}`}
                className={clsx(
                  "rk-row group relative grid min-w-[720px] grid-cols-[1.4fr_0.6fr_1.2fr_1fr_0.8fr] items-center gap-4 border-b border-line py-4",
                  "transition-colors duration-300 hover:bg-ink-3",
                )}
              >
                {/* camp bar slide-in on hover */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[3px] origin-bottom scale-y-0 transition-transform group-hover:scale-y-100"
                  style={{ backgroundColor: hex, transitionDuration: "0.25s" }}
                />
                <span className="pl-4 font-mono text-[13px] tracking-[0.06em] text-bone-dim">
                  {r.board}
                </span>
                <span className="flex items-center gap-3">
                  <span
                    ref={(el) => {
                      rankRefs.current[i] = el;
                    }}
                    className={clsx(
                      "font-anton text-[24px] leading-none",
                      r.rank === 1 ? "text-gold" : r.rank <= 3 ? "text-bone" : "text-mute",
                    )}
                  >
                    99
                  </span>
                  {r.rank === 1 && <Stamp variant="top" className="h-6 w-12" />}
                </span>
                <span className="font-mono text-[13px] tracking-[0.04em] text-bone">{r.score}</span>
                <span className="font-serifsc text-[15px] font-bold text-bone">{r.model}</span>
                <span className="font-mono text-[12px] tracking-[0.1em] text-mute">{r.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
