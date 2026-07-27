import { useState, type CSSProperties } from "react";
import { TOPIC_META, type VaultEntry } from "@/components/archive/vault";
import { campColor } from "@/lib/data";
import { useLang } from "@/lib/i18n";

type ViewMode = "both" | "zh" | "en";

const MODE_LABEL: Record<ViewMode, string> = {
  both: "EN+中",
  zh: "中",
  en: "EN",
};
const MODE_NEXT: Record<ViewMode, ViewMode> = { both: "zh", zh: "en", en: "both" };

interface VaultQuoteCardProps {
  entry: VaultEntry;
}

/**
 * 语录瀑布卡（quotes.md S3）— QuoteCard 扩展版：
 * 顶部公司/领袖 mono 行 + 议题章；英文引语默认原文+浅一行中译，
 * 右上 中/EN 切换可只显一种；底部出处 · 日期 · 原文↗。
 * 语言感知：en 模式显示英文版引语。
 */
export default function VaultQuoteCard({ entry }: VaultQuoteCardProps) {
  const [mode, setMode] = useState<ViewMode>("both");
  const { lang } = useLang();
  const campHex = campColor(entry.camp);
  const topic = TOPIC_META[entry.topic];
  const hasTranslation = entry.english && Boolean(entry.translation.trim());

  const isZh = lang === "zh";
  const mainText = isZh
    ? hasTranslation && mode === "zh"
      ? entry.translation
      : entry.text
    : (entry.textEn ?? entry.text);
  const showSub = isZh && hasTranslation && mode === "both";

  return (
    <figure
      className="group relative border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--camp)] hover:bg-ink-3"
      style={{ "--camp": campHex } as CSSProperties}
    >
      {/* 4px camp bar */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 transition-shadow duration-300 group-hover:shadow-[0_0_12px_var(--camp)]"
        style={{ backgroundColor: campHex }}
      />

      <div className="pb-5 pl-6 pr-5 pt-4">
        {/* header: company · leader + topic capsule + 中/EN toggle */}
        <div className="flex items-start justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-bone-dim">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: campHex }}
            />
            <span className="truncate">
              {entry.shortName} · {entry.leaderName}
            </span>
          </p>
          <span className="flex shrink-0 items-center gap-2">
            <span
              className="border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-shadow duration-300 group-hover:shadow-[0_0_10px_var(--topic-glow)]"
              style={
                {
                  color: topic.color,
                  borderColor: topic.color,
                  "--topic-glow": `${topic.color}66`,
                } as CSSProperties
              }
            >
              {isZh ? topic.zh : topic.en}
            </span>
            {isZh && hasTranslation && (
              <button
                type="button"
                data-cursor="SELECT ▸"
                onClick={() => setMode((m) => MODE_NEXT[m])}
                className="border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim transition-colors hover:border-gold hover:text-gold"
                title="切换 原文 / 中译 显示"
              >
                {MODE_LABEL[mode]}
              </button>
            )}
          </span>
        </div>

        {/* quote */}
        <blockquote className="mt-4 font-serifsc text-[19px] font-bold leading-[1.75] text-bone">
          {mainText}
        </blockquote>
        {showSub && (
          <p className="mt-3 font-sanssc text-[16px] leading-[1.7] text-bone-dim">
            {entry.translation}
          </p>
        )}

        {/* footer: source · date · 原文↗ */}
        <figcaption className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-[11px] tracking-[0.06em] text-mute">
          <span>{entry.source}</span>
          <span aria-hidden>·</span>
          <span>{entry.date}</span>
          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noreferrer"
              data-cursor="OPEN ↗"
              className="relative ml-auto text-bone-dim transition-colors duration-300 hover:text-[color:var(--camp)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[color:var(--camp)] after:transition-all after:duration-300 hover:after:w-full"
            >
              {isZh ? "原文 ↗" : "SOURCE ↗"}
            </a>
          )}
        </figcaption>
      </div>
    </figure>
  );
}
