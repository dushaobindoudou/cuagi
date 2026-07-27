import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { Company, Quote } from "@/lib/data";
import { campColor } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";
import Stamp from "@/components/Stamp";
import SectionHead from "@/components/detail/SectionHead";
import { useLang } from "@/lib/i18n";
import { summaryOf } from "@/lib/data";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const TABS = [
  { key: "strategy", zh: "战略", en: "STRATEGY" },
  { key: "agi", zh: "AGI 观", en: "AGI" },
  { key: "openSource", zh: "开源", en: "OPEN SOURCE" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface StatementsTabsProps {
  company: Company;
}

/**
 * S2 三维言论 (detail.md §S2): strategy / AGI / open-source tabbed panel.
 * Left = AI 研判 summary with camp-color drop cap; right = sourced quotes
 * (QuoteCard, date-ascending) with 中/EN toggle and mini verified stamps.
 */
export default function StatementsTabs({ company: c }: StatementsTabsProps) {
  const hex = campColor(c.camp);
  const [tab, setTab] = useState<TabKey>("strategy");
  const { lang } = useLang();

  const summary = summaryOf(c.insights[tab], lang);
  const quotes = useMemo<Quote[]>(
    () => [...c.insights[tab].quotes].sort((a, b) => a.date.localeCompare(b.date)),
    [c, tab],
  );

  const dropCap = summary.slice(0, 1);
  const rest = summary.slice(1);

  return (
    <section className="mx-auto max-w-[1520px] px-5 py-24 md:px-10">
      <SectionHead
        en="STATEMENTS"
        zh="三维言论拆解"
        note="AI 总结基于下列带出处引语 · 引语均可溯源"
        noteEn="AI reads built on the sourced quotes below · every quote is traceable"
      />

      {/* tab bar */}
      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-b border-line" role="tablist">
        {TABS.map((tb) => {
          const active = tb.key === tab;
          return (
            <button
              key={tb.key}
              type="button"
              role="tab"
              aria-selected={active}
              data-cursor="SELECT ▸"
              onClick={() => setTab(tb.key)}
              className={clsx(
                "relative pb-3 font-grotesk text-[14px] font-medium uppercase tracking-[0.08em] transition-colors duration-300",
                active ? "text-bone" : "text-mute hover:text-bone-dim",
              )}
            >
              {lang === "zh" ? (
                <>
                  <span className="mr-2 font-serifsc normal-case">{tb.zh}</span>
                  {tb.en}
                </>
              ) : (
                tb.en
              )}
              <span
                aria-hidden
                className={clsx(
                  "absolute bottom-[-1px] left-0 h-[2px] w-full origin-left transition-transform duration-300",
                  active ? "scale-x-100" : "scale-x-0",
                )}
                style={{ backgroundColor: hex }}
              />
            </button>
          );
        })}
      </div>

      {/* panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
          animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
          exit={{ clipPath: "inset(0 0 0 100%)", opacity: 0.4 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mt-10 grid gap-10 md:grid-cols-12"
        >
          {/* AI 研判 (4 cols) */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="md:col-span-4"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: hex }}>
              AI ANALYSIS · 仅供研究参考
            </p>
            <p className="mt-5 text-[16px] leading-[2.0] text-bone/90">
              <span
                aria-hidden
                className="float-left mb-1 mr-2 mt-[0.18em] font-serifsc text-[54px] font-black leading-[0.78]"
                style={{ color: hex }}
              >
                {dropCap}
              </span>
              {rest}
            </p>
          </motion.div>

          {/* 原话证据 (8 cols) */}
          <div className="md:col-span-8">
            <motion.ul
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-8% 0px" }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
              className="space-y-5"
            >
              {quotes.map((q, i) => (
                <motion.li
                  key={`${tab}-${i}`}
                  variants={{
                    hidden: { scale: 0.98, opacity: 0, y: 14 },
                    show: {
                      scale: 1,
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: EASE },
                    },
                  }}
                  className="relative"
                >
                  <QuoteCard
                    camp={c.camp}
                    text={q.text}
                    translation={q.translation}
                    textEn={q.textEn}
                    source={q.source}
                    date={q.date}
                    url={q.url}
                  />
                  <Stamp
                    variant="verified"
                    className="absolute -top-3 right-3 h-8 w-16 opacity-90"
                  />
                </motion.li>
              ))}
              {quotes.length === 0 && (
                <li className="border border-dashed border-line px-6 py-10 text-center font-mono text-[13px] tracking-[0.12em] text-mute">
                  该议题暂未收录带出处引语
                </li>
              )}
            </motion.ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
