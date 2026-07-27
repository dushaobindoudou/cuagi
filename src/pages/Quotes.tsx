import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { stats } from "@/lib/data";
import FlipTitle from "@/components/archive/FlipTitle";
import CountUp from "@/components/archive/CountUp";
import FilterConsole from "@/components/archive/FilterConsole";
import VaultQuoteCard from "@/components/archive/VaultQuoteCard";
import {
  filterVault,
  parseCampParam,
  parseCompanyParam,
  parseTopicParam,
  sortVault,
  type CampFilter,
  type SortKey,
  type TopicFilter,
} from "@/components/archive/vault";
import { useLang } from "@/lib/i18n";

const INITIAL_BATCH = 18;
const BATCH_SIZE = 12;
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * 金句档案库 `/quotes`（quotes.md）：
 * S1 页眉 · S2 sticky 筛选控制台（议题/阵营/公司 + URL 预筛）
 * S3 三列瀑布 + 无限加载 · S4 空态 · S5 底部 CTA 带。
 */
export default function Quotes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang, t } = useLang();

  // URL 参数预筛：?topic=openSource ?company=deepseek ?camp=china
  const topic: TopicFilter = parseTopicParam(searchParams.get("topic"));
  const camp: CampFilter = parseCampParam(searchParams.get("camp"));
  const companyIds = parseCompanyParam(searchParams.get("company"));
  const [sort, setSort] = useState<SortKey>("dateDesc");

  const patchParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setSearchParams(next, { replace: true });
  };

  const entries = useMemo(
    () => sortVault(filterVault(topic, camp, companyIds), sort),
    [topic, camp, companyIds, sort],
  );

  // 无限加载：首屏 18 条，滚动到底每批 +12
  const signature = `${topic}|${camp}|${companyIds.join(",")}|${sort}`;
  const [visible, setVisible] = useState(INITIAL_BATCH);
  // 筛选/排序变化时在渲染期重置可见批次（React 推荐的 adjust-state-during-render 模式）
  const [prevSignature, setPrevSignature] = useState(signature);
  if (prevSignature !== signature) {
    setPrevSignature(signature);
    setVisible(INITIAL_BATCH);
  }

  const hasMore = visible < entries.length;
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible((v) => v + BATCH_SIZE);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, signature]);

  const shown = entries.slice(0, visible);
  const resetAll = () => {
    setSort("dateDesc");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="relative">
      {/* S1 页眉 */}
      <section className="mx-auto max-w-[1520px] px-5 pb-12 pt-16 md:px-10 md:pt-20">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-mute">
          {lang === "zh" ? "IN THEIR WORDS · 全部语录" : "IN THEIR WORDS · EVERY QUOTE"}
        </p>
        <FlipTitle zh="原声" en="IN THEIR WORDS" />
        <motion.p
          className="mt-6 font-mono text-[13px] tracking-[0.1em] text-bone-dim"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
        >
          <CountUp to={stats.quotes} className="text-gold" duration={1.4} delay={0.7} />
          {lang === "zh"
            ? " 条在册言论 · 全部附出处与日期 · 英文原话附中译"
            : " quotes on record · every one sourced and dated"}
        </motion.p>
      </section>

      {/* S2 筛选控制台（sticky） */}
      <FilterConsole
        topic={topic}
        camp={camp}
        companyIds={companyIds}
        sort={sort}
        count={entries.length}
        onTopic={(t) => patchParams({ topic: t === "all" ? null : t })}
        onCamp={(c) => patchParams({ camp: c === "all" ? null : c })}
        onCompanies={(ids) => patchParams({ company: ids.length ? ids.join(",") : null })}
        onSort={setSort}
      />

      {/* S3 金句瀑布 */}
      <section className="mx-auto max-w-[1520px] px-5 py-12 md:px-10">
        {shown.length > 0 ? (
          <div className="columns-1 gap-6 sm:columns-2 xl:columns-3">
            <AnimatePresence>
              {shown.map((e, i) => (
                <motion.div
                  key={e.key}
                  className="mb-6 break-inside-avoid"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10, transition: { duration: 0.18, delay: (i % 12) * 0.02 } }}
                  transition={{
                    duration: 0.5,
                    ease: EASE,
                    delay: i < INITIAL_BATCH ? i * 0.03 : (i % BATCH_SIZE) * 0.04,
                  }}
                >
                  <VaultQuoteCard entry={e} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* S4 空态 */
          <motion.div
            className="flex flex-col items-center gap-6 py-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mono text-[14px] tracking-[0.12em] text-mute">
              {lang === "zh" ? "没有匹配的在册言论" : "No quotes match the current filters"}
            </p>
            <button
              type="button"
              data-cursor="SELECT ▸"
              onClick={resetAll}
              className="font-mono text-[13px] tracking-[0.16em] text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:decoration-gold"
            >
              {lang === "zh" ? "重置筛选" : "RESET FILTERS"}
            </button>
          </motion.div>
        )}

        {/* 无限加载哨兵 */}
        {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}
      </section>

      {/* S5 底部 CTA 带 */}
      <section className="mx-auto max-w-[1520px] px-5 pb-24 pt-8 md:px-10">
        <div className="relative py-14 text-center">
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px origin-left bg-gold"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, ease: EASE }}
          />
          <motion.span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px origin-right bg-gold"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, ease: EASE }}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
          >
            <p className="font-serifsc text-[20px] font-bold text-bone">
              {lang === "zh" ? "想看某位领袖的完整语录分析？" : "Want the full read on one leader?"}
            </p>
            <Link
              to="/"
              data-cursor="OPEN ↗"
              className="mt-6 inline-block border border-gold px-6 py-2.5 font-mono text-[13px] tracking-[0.16em] text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
            >
              {t("backHome")} →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
