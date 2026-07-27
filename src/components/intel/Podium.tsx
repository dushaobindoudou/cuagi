import { memo } from "react";
import { motion } from "framer-motion";
import { campColor } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { ArenaRow } from "@/lib/data";
import { lmArenaRows, aaIndexRows, openLightRows } from "@/components/intel/arenaData";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface PodiumCard {
  key: string;
  board: string;
  note: string;
  rows: ArenaRow[];
  /** extra context line under the runner-up rows (board name etc.) */
  rowMeta?: (r: ArenaRow) => string | undefined;
}

/** gold sheen that sweeps the headline model name, then repeats every 5s */
/* perpetual sheen loop — memoized so parent re-renders never reset it */
const SheenName = memo(function SheenName({ children }: { children: string }) {
  return (
    <motion.span
      className="inline-block font-anton text-[32px] leading-[1.05] md:text-[40px]"
      style={{
        backgroundImage:
          "linear-gradient(100deg, #C9A24B 42%, #FFF3D6 50%, #C9A24B 58%)",
        backgroundSize: "220% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
      initial={{ backgroundPosition: "200% 50%" }}
      whileInView={{
        backgroundPosition: ["200% 50%", "-20% 50%", "-20% 50%", "200% 50%", "200% 50%"],
      }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{
        duration: 6,
        times: [0, 0.17, 0.85, 0.87, 1],
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      {children}
    </motion.span>
  );
});

/**
 * S2 榜首三杰 (arena.md): three podium cards — LMArena text board,
 * AA intelligence index, and the open-weights highlight. Rendered
 * strictly from the rankings aggregation; every entry shows its snapshot date.
 */
export default function Podium() {
  const { lang } = useLang();
  const cards: PodiumCard[] = [
    {
      key: "lmarena",
      board: "LMArena 文本榜",
      note: lang === "zh" ? "用户盲测 Elo · 含镜像站快照" : "Human-vote Elo · incl. mirror snapshots",
      rows: lmArenaRows.slice(0, 4),
    },
    {
      key: "aa",
      board: "Artificial Analysis 智能指数",
      note: lang === "zh" ? "多基准加权 · 含 v4.x 修订" : "Weighted multi-benchmark · incl. v4.x revisions",
      rows: aaIndexRows.slice(0, 4),
    },
    {
      key: "open",
      board: lang === "zh" ? "开源之光" : "OPEN-WEIGHTS PICK",
      note: lang === "zh" ? "开放权重模型最高名次 · 取含「开源第1」注记条目" : "Best open-weights rank · entries flagged #1 open",
      rows: openLightRows.slice(0, 4),
      rowMeta: (r) => (r as ArenaRow & { board?: string }).board,
    },
  ];

  return (
    <section className="border-b border-line py-16 md:py-24">
      <div className="mx-auto max-w-[1520px] px-5 md:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card, ci) => {
            const [top, ...rest] = card.rows;
            if (!top) return null;
            return (
              <motion.article
                key={card.key}
                initial={{ opacity: 0, y: 100, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.9, delay: ci * 0.15, ease: EASE }}
                className="relative border border-line bg-ink-2 p-6"
              >
                <p className="font-mono text-[12px] tracking-[0.16em] text-bone-dim">
                  {card.board}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.12em] text-mute">{card.note}</p>

                <div className="mt-6">
                  <SheenName>{top.model}</SheenName>
                  <p className="mt-3 flex items-center gap-2 text-[14px] text-bone">
                    <span
                      aria-hidden
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: campColor(top.camp) }}
                    />
                    {top.company}
                    <span className="font-mono text-[11px] text-gold">{top.score}</span>
                  </p>
                  <p className="mt-1 font-mono text-[11px] tracking-[0.08em] text-mute">
                    快照 {top.date} · #{top.rank}
                  </p>
                </div>

                <div className="mt-6 space-y-2 border-t border-line pt-4">
                  {rest.map((r) => (
                    <p key={`${r.companyId}-${r.model}`} className="flex items-baseline gap-3 text-[13px]">
                      <span className="w-7 shrink-0 font-anton text-[16px] text-bone-dim">
                        {r.rank}
                      </span>
                      <span
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: campColor(r.camp) }}
                      />
                      <span className="truncate font-mono text-[12px] text-bone">{r.model}</span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] text-mute">
                        {r.company} · {r.date}
                      </span>
                    </p>
                  ))}
                </div>
                {card.rowMeta && (
                  <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-mute">
                    {card.rows
                      .map((r) => card.rowMeta!(r))
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
