import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, X } from "lucide-react";
import clsx from "clsx";
import { companies, campColor } from "@/lib/data";
import {
  SORT_CYCLE,
  SORT_LABEL,
  type CampFilter,
  type SortKey,
  type TopicFilter,
} from "@/components/archive/vault";
import { useLang } from "@/lib/i18n";

const TOPIC_TABS: { key: TopicFilter; label: string; labelEn: string }[] = [
  { key: "all", label: "全部", labelEn: "ALL" },
  { key: "strategy", label: "战略", labelEn: "STRATEGY" },
  { key: "agi", label: "AGI 观", labelEn: "ON AGI" },
  { key: "openSource", label: "开源", labelEn: "OPEN SOURCE" },
];

const CAMP_TABS: { key: CampFilter; label: string; labelEn: string; dot?: string }[] = [
  { key: "all", label: "全部", labelEn: "ALL" },
  { key: "china", label: "中国", labelEn: "CHINA", dot: campColor("china") },
  { key: "us", label: "美国", labelEn: "US", dot: campColor("us") },
];

interface FilterConsoleProps {
  topic: TopicFilter;
  camp: CampFilter;
  companyIds: string[];
  sort: SortKey;
  count: number;
  onTopic: (t: TopicFilter) => void;
  onCamp: (c: CampFilter) => void;
  onCompanies: (ids: string[]) => void;
  onSort: (s: SortKey) => void;
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      data-cursor="SELECT ▸"
      onClick={onClick}
      className={clsx(
        "relative flex items-center gap-1.5 px-1 pb-1 pt-0.5 font-grotesk text-[13px] transition-colors duration-200",
        active ? "text-bone" : "text-bone-dim hover:text-bone",
      )}
    >
      {children}
      <span
        aria-hidden
        className={clsx(
          "absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gold transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </button>
  );
}

/**
 * 筛选控制台（quotes.md S2）— sticky 于 Navbar 下方，
 * 议题 / 阵营 / 公司多选三维筛选 + 排序切换 + 结果计数。
 */
export default function FilterConsole({
  topic,
  camp,
  companyIds,
  sort,
  count,
  onTopic,
  onCamp,
  onCompanies,
  onSort,
}: FilterConsoleProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleCompany = (id: string) => {
    onCompanies(
      companyIds.includes(id) ? companyIds.filter((x) => x !== id) : [...companyIds, id],
    );
  };

  return (
    <motion.div
      className="sticky top-16 z-40 border-b border-line bg-[rgba(11,12,14,0.9)] backdrop-blur-md"
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
    >
      <div className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3 md:px-10">
        {/* 议题 */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{lang === "zh" ? "议题" : "TOPIC"}</span>
          <div className="flex items-center gap-3">
            {TOPIC_TABS.map((t) => (
              <TabButton key={t.key} active={topic === t.key} onClick={() => onTopic(t.key)}>
                {lang === "zh" ? t.label : t.labelEn}
              </TabButton>
            ))}
          </div>
        </div>

        {/* 阵营 */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{lang === "zh" ? "阵营" : "CAMP"}</span>
          <div className="flex items-center gap-3">
            {CAMP_TABS.map((t) => (
              <TabButton key={t.key} active={camp === t.key} onClick={() => onCamp(t.key)}>
                {t.dot && (
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: t.dot }}
                  />
                )}
                {lang === "zh" ? t.label : t.labelEn}
              </TabButton>
            ))}
          </div>
        </div>

        {/* 公司多选 */}
        <div ref={panelRef} className="relative flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{lang === "zh" ? "公司" : "COMPANY"}</span>
          <button
            type="button"
            data-cursor="SELECT ▸"
            onClick={() => setOpen((v) => !v)}
            className={clsx(
              "flex items-center gap-2 border px-2.5 py-1 font-mono text-[12px] tracking-[0.08em] transition-colors",
              companyIds.length > 0
                ? "border-gold/70 text-gold"
                : "border-line text-bone-dim hover:border-bone-dim hover:text-bone",
            )}
            aria-expanded={open}
          >
            {companyIds.length > 0 ? (lang === "zh" ? `已选 ${companyIds.length} 家` : `${companyIds.length} SELECTED`) : (lang === "zh" ? "全部 14 家" : "ALL 14")}
            <ChevronDown
              className={clsx("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
            />
          </button>
          {companyIds.length > 0 && (
            <button
              type="button"
              data-cursor="SELECT ▸"
              onClick={() => onCompanies([])}
              className="flex items-center gap-1 font-mono text-[11px] text-mute transition-colors hover:text-gold"
              title={lang === "zh" ? "清除公司筛选" : "Clear company filter"}
            >
              <X className="h-3 w-3" /> {lang === "zh" ? "清除" : "CLEAR"}
            </button>
          )}

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 top-full z-50 mt-2 max-h-80 w-64 overflow-auto border border-line bg-ink-2 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
              >
                {companies.map((c) => {
                  const on = companyIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      data-cursor="SELECT ▸"
                      onClick={() => toggleCompany(c.id)}
                      className={clsx(
                        "flex w-full items-center gap-2 border-b border-line/60 px-3 py-2 text-left font-mono text-[12px] tracking-[0.06em] transition-colors last:border-b-0",
                        on ? "bg-ink-3 text-bone" : "text-bone-dim hover:bg-ink-3 hover:text-bone",
                      )}
                    >
                      <span
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: campColor(c.camp) }}
                      />
                      <span className="flex-1 truncate">
                        {c.shortName} · {c.leader.name}
                      </span>
                      <span
                        aria-hidden
                        className={clsx(
                          "flex h-3.5 w-3.5 items-center justify-center border text-[9px] leading-none",
                          on ? "border-gold text-gold" : "border-line text-transparent",
                        )}
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 右端：排序切换 + 结果计数 */}
        <div className="ml-auto flex items-center gap-5">
          <button
            type="button"
            data-cursor="SELECT ▸"
            onClick={() => onSort(SORT_CYCLE[sort])}
            className="border border-line px-2.5 py-1 font-mono text-[12px] tracking-[0.08em] text-bone-dim transition-colors hover:border-gold hover:text-gold"
            title={lang === "zh" ? "切换排序方式" : "Cycle sort order"}
          >
            {SORT_LABEL[sort][lang]}
          </button>
          <div className="flex items-baseline gap-1.5 font-mono text-[12px] tracking-[0.1em] text-gold">
            <span className="text-mute">{lang === "zh" ? "共" : ""}</span>
            <span className="relative inline-block h-[1.2em] min-w-[2ch] overflow-hidden text-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={count}
                  className="inline-block"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-mute">{lang === "zh" ? "条" : "quotes"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
