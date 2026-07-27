import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { Company } from "@/lib/data";
import { campColor } from "@/lib/data";
import SectionHead from "@/components/detail/SectionHead";
import { LINK_TYPE_META, LINK_TYPE_ORDER } from "@/components/detail/helpers";
import { useLang } from "@/lib/i18n";
import { pick } from "@/lib/data";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface ArchiveLinksProps {
  company: Company;
}

/**
 * S6 资料库 (detail.md §S6): type-filter chips (all / interview / article /
 * blog / video / paper) + full-width link rows with mono abbreviation badges
 * (video rows carry a play triangle). Switching fades the old list out and
 * staggers the new one in. Framer-only section.
 */
export default function ArchiveLinks({ company: c }: ArchiveLinksProps) {
  const hex = campColor(c.camp);
  const [filter, setFilter] = useState<string>("all");
  const { lang } = useLang();

  const presentTypes = useMemo(() => {
    const set = new Set(c.links.map((l) => l.type));
    return LINK_TYPE_ORDER.filter((t) => set.has(t));
  }, [c]);

  const filtered = useMemo(
    () => (filter === "all" ? c.links : c.links.filter((l) => l.type === filter)),
    [c, filter],
  );

  return (
    <section className="mx-auto max-w-[1520px] px-5 py-24 md:px-10">
      <SectionHead en="ARCHIVE" zh="公开资料在库" note={`${c.links.length} 条记录`} />

      {/* filter chips */}
      <div className="mt-8 flex flex-wrap gap-2">
        {["all", ...presentTypes].map((t) => {
          const active = filter === t;
          const meta = t === "all" ? { zh: "全部", abbr: "ALL" } : LINK_TYPE_META[t];
          return (
            <button
              key={t}
              type="button"
              data-cursor="SELECT ▸"
              onClick={() => setFilter(t)}
              className={clsx(
                "border px-3 py-1.5 font-mono text-[12px] tracking-[0.1em] transition-colors duration-300",
                active ? "text-bone" : "border-line text-mute hover:text-bone-dim",
              )}
              style={
                active
                  ? { backgroundColor: `${hex}26`, borderColor: hex }
                  : undefined
              }
            >
              {meta.zh}
              <span className="ml-1.5 text-[10px] uppercase opacity-70">{t === "all" ? "ALL" : meta.abbr}</span>
            </button>
          );
        })}
      </div>

      {/* link list */}
      <AnimatePresence mode="wait">
        <motion.ul
          key={filter}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="mt-8 border-t border-line"
        >
          {filtered.map((l) => {
            const meta = LINK_TYPE_META[l.type] ?? { zh: l.type, abbr: "DOC" };
            return (
              <motion.li
                key={l.url}
                variants={{
                  hidden: { y: 24, opacity: 0 },
                  show: { y: 0, opacity: 1, transition: { duration: 0.45, ease: EASE } },
                }}
              >
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="OPEN ↗"
                  className="group flex items-center gap-4 border-b border-line py-4 pr-2 transition-colors duration-300 hover:bg-ink-3"
                >
                  {/* type badge */}
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center border border-line font-mono text-[10px] tracking-[0.08em] text-bone-dim">
                    {meta.abbr}
                    {l.type === "video" && (
                      <svg
                        aria-hidden
                        viewBox="0 0 8 8"
                        className="absolute -bottom-1 -right-1 h-3 w-3"
                        style={{ color: hex }}
                      >
                        <path d="M1 0.5 L7.5 4 L1 7.5 Z" fill="currentColor" />
                      </svg>
                    )}
                  </span>
                  {/* title + summary */}
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate font-serifsc text-[17px] font-bold text-bone transition-colors duration-300 group-hover:text-[var(--camp)]"
                      style={{ ["--camp" as string]: hex }}
                    >
                      {pick(l.title, l.titleEn, lang)}
                      <span className="ml-2 inline-block translate-x-[-6px] font-mono text-[12px] font-normal opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        ↗
                      </span>
                    </span>
                    {(l.summary || l.summaryEn) && (
                      <span className="mt-1 block truncate text-[14px] text-bone-dim">{pick(l.summary, l.summaryEn, lang)}</span>
                    )}
                  </span>
                  {/* date */}
                  <span className="shrink-0 font-mono text-[12px] tracking-[0.1em] text-mute">
                    {l.date}
                  </span>
                </a>
              </motion.li>
            );
          })}
          {filtered.length === 0 && (
            <li className="border-b border-line px-4 py-10 text-center font-mono text-[13px] tracking-[0.12em] text-mute">
              {lang === "zh" ? "该类型暂无记录" : "No entries of this type"}
            </li>
          )}
        </motion.ul>
      </AnimatePresence>
    </section>
  );
}
