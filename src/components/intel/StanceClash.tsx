import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Quote } from "@/lib/data";
import { byId, quoteTextOf } from "@/lib/data";
import { useLang } from "@/lib/i18n";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface ClashItem {
  companyId: string;
  quoteIndex: number;
}

/* left column: open-source camp voices (jade bar) */
const OPEN_SIDE: ClashItem[] = [
  { companyId: "deepseek", quoteIndex: 0 }, // 梁文锋：闭源护城河是短暂的
  { companyId: "minimax", quoteIndex: 0 }, // 闫俊杰：第一天就应该开源
  { companyId: "deepseek", quoteIndex: 2 }, // 我们不会闭源
];
/* right column: closed / cautious voices (cn bar) */
const CLOSED_SIDE: ClashItem[] = [
  { companyId: "anthropic", quoteIndex: 0 }, // Amodei：开源在 AI 上不成立
  { companyId: "openai", quoteIndex: 0 }, // Altman：站在历史的错误一边
  { companyId: "xai", quoteIndex: 1 }, // Musk 抨击 OpenAI 背离开源使命
];

function pick(item: ClashItem): { quote: Quote; companyName: string; leader: string } | undefined {
  const c = byId(item.companyId);
  const q = c?.insights.openSource.quotes[item.quoteIndex];
  if (!c || !q) return undefined;
  return { quote: q, companyName: c.shortName, leader: c.leader.name.split("（")[0] };
}

/** QuoteCard variant: bar color follows the stance end, not the camp. */
function StanceQuote({
  item,
  barColor,
  delay,
}: {
  item: ClashItem;
  barColor: string;
  delay: number;
}) {
  const data = pick(item);
  const { lang } = useLang();
  const [showAlt, setShowAlt] = useState(false);
  if (!data) return null;
  const { quote: q, companyName, leader } = data;
  const hasAlt = Boolean(q.translation && q.translation.trim());
  const shown = lang === "en" ? quoteTextOf(q, "en") : showAlt && hasAlt ? q.translation : q.text;

  return (
    <figure className="group relative border border-line bg-ink-2 py-5 pl-6 pr-5 transition-colors duration-300 hover:bg-ink-3">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 transition-shadow duration-300 group-hover:shadow-[0_0_12px_var(--bar)]"
        style={{ backgroundColor: barColor, ["--bar" as string]: barColor }}
      />
      <blockquote className="font-serifsc text-[17px] font-bold leading-[1.7] text-bone">
        {/* word-level light-up */}
        {shown.split(/(?<=，|。|；|、|？|\s)/).map((w, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.15 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.4, delay: delay + i * 0.045 }}
          >
            {w}
          </motion.span>
        ))}
      </blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] text-mute">
        {lang === "zh" && hasAlt && (
          <button
            type="button"
            onClick={() => setShowAlt((v) => !v)}
            data-cursor="OPEN ↗"
            className="border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:border-gold hover:text-gold"
          >
            {showAlt ? "EN / 中" : "中 / EN"}
          </button>
        )}
        <span className="text-bone-dim">
          {leader} · {companyName}
        </span>
        <span aria-hidden>·</span>
        <span>{q.source}</span>
        <span aria-hidden>·</span>
        <span>{q.date}</span>
        {q.url && (
          <a
            href={q.url}
            target="_blank"
            rel="noreferrer"
            data-cursor="OPEN ↗"
            className="relative text-bone-dim transition-colors hover:text-gold after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
          >
            {lang === "zh" ? "链接 ↗" : "LINK ↗"}
          </a>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * S4 立场对撞金句 (spectrum.md): open-source voices (jade bar, left) crash
 * into closed/cautious voices (cn bar, right) around a central gold VS seal.
 */
export default function StanceClash() {
  const { lang, t } = useLang();
  return (
    <section className="relative overflow-hidden border-t border-line py-20 md:py-28">
      <div className="mx-auto max-w-[1520px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center"
        >
          <p className="font-grotesk text-[12px] font-medium tracking-[0.3em] text-mute">
            CLASH OF STANCES
          </p>
          <h2 className="mt-3 font-serifsc text-[32px] font-black text-bone md:text-[40px]">
            {t("quoteWallTitle")}
          </h2>
        </motion.div>

        <div className="relative mt-14 grid gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-8">
          {/* left: open camp */}
          <motion.div
            initial={{ x: "-8%", opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="space-y-5"
          >
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-jade">
              {lang === "zh" ? "◀ 开源派" : "◀ OPEN"}
            </p>
            {OPEN_SIDE.map((item, i) => (
              <StanceQuote key={`${item.companyId}-${item.quoteIndex}`} item={item} barColor="var(--jade)" delay={0.3 + i * 0.15} />
            ))}
          </motion.div>

          {/* center VS seal */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ scale: 1.6, opacity: 0, rotate: -10 }}
              whileInView={{ scale: [1.6, 0.94, 1.04, 1], opacity: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.3, delay: 0.7, ease: "backOut", times: [0, 0.7, 0.85, 1] }}
              className="flex h-20 w-20 rotate-45 items-center justify-center border-2 border-gold md:h-24 md:w-24"
            >
              <span className="-rotate-45 font-anton text-[26px] tracking-[0.05em] text-gold md:text-[32px]">
                VS
              </span>
            </motion.div>
          </div>

          {/* right: closed / cautious camp */}
          <motion.div
            initial={{ x: "8%", opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="space-y-5"
          >
            <p className="mb-6 text-right font-mono text-[11px] uppercase tracking-[0.2em] text-cn">
              {lang === "zh" ? "闭源 / 谨慎派 ▶" : "CLOSED / CAUTIOUS ▶"}
            </p>
            {CLOSED_SIDE.map((item, i) => (
              <StanceQuote key={`${item.companyId}-${item.quoteIndex}`} item={item} barColor="var(--cn)" delay={0.3 + i * 0.15} />
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          className="mt-14 text-center"
        >
          <Link
            to="/quotes?topic=openSource"
            data-cursor="OPEN ↗"
            className={clsx(
              "inline-block border border-gold/70 px-6 py-3 font-mono text-[12px] tracking-[0.2em] text-gold",
              "transition-all duration-300 hover:bg-gold hover:text-ink",
            )}
          >
            {lang === "zh" ? "查看全部立场言论 ▸" : "ALL STANCE QUOTES ▸"}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
