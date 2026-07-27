import { motion } from "framer-motion";
import { updatedAt } from "@/lib/data";
import { useLang } from "@/lib/i18n";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const NOTES = [
  {
    title: "榜单方法",
    titleEn: "Methodology",
    en: "METHODOLOGY",
    body: "LMArena = 用户盲测投票 Elo；AA 智能指数 = 多基准加权。数据为快照，实时名次以官方为准。",
    bodyEn: "LMArena = human blind-vote Elo; AA intelligence index = weighted multi-benchmark. Figures are snapshots — check official pages for live ranks.",
  },
  {
    title: "开源标注",
    titleEn: "Open-weights note",
    en: "OPEN-WEIGHTS NOTE",
    body: "开放权重（open weights）≠ 开源训练全流程；本站按社区通行口径标注。",
    bodyEn: "Open weights ≠ a fully open training pipeline; labels follow the community's common usage.",
  },
  {
    title: "数据说明",
    titleEn: "Data note",
    en: "DATA NOTE",
    body: `全部快照收集于 ${updatedAt}；各条目自带采集日期。`,
    bodyEn: `All snapshots collected on ${updatedAt}; each entry carries its own capture date.`,
  },
];

/** S5 洞察注记 (arena.md): three annotation cards. */
export default function ArenaNotes() {
  const { lang } = useLang();
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1520px] px-5 md:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {NOTES.map((n, i) => (
            <motion.div
              key={n.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              className="border border-line bg-ink-2 p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{n.en}</p>
              <h3 className="mt-2 font-serifsc text-[20px] font-black text-gold">
                {lang === "zh" ? n.title : n.titleEn}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.85] text-bone-dim">
                {lang === "zh" ? n.body : n.bodyEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
