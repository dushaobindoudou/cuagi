import { useState } from "react";
import clsx from "clsx";
import type { Camp } from "@/lib/data";
import { useLang } from "@/lib/i18n";

interface QuoteCardProps {
  camp: Camp;
  text: string;
  translation?: string;
  /** English version of the quote (equals `text` when the original is English) */
  textEn?: string;
  source: string;
  date: string;
  url?: string;
  className?: string;
}

/**
 * 引语卡 (design.md §8.5): 4px camp-color bar on the left,
 * serif quote, 中/EN toggle when a translation exists, mono source line.
 * In en mode the English version is primary; in zh mode the original text.
 */
export default function QuoteCard({ camp, text, translation, textEn, source, date, url, className }: QuoteCardProps) {
  const { lang } = useLang();
  const primary = lang === "en" && textEn ? textEn : text;
  // the alternate language version available via toggle
  const alt = lang === "en"
    ? (text !== primary ? text : translation || undefined)
    : translation && translation.trim() ? translation : textEn && textEn !== text ? textEn : undefined;
  const hasAlt = Boolean(alt && alt.trim());
  const [showAlt, setShowAlt] = useState(false);
  const campHex = camp === "china" ? "var(--cn)" : "var(--us)";

  return (
    <figure
      className={clsx(
        "group relative border border-line bg-ink-2 pl-6 pr-5 py-5 transition-colors duration-300 hover:bg-ink-3",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 transition-all duration-300 group-hover:shadow-[0_0_12px]"
        style={{
          backgroundColor: campHex,
          // @ts-expect-error css var for hover glow
          "--tw-shadow-color": campHex,
        }}
      />
      <blockquote className="font-serifsc text-[17px] font-bold leading-[1.7] text-bone">
        {showAlt && hasAlt ? alt : primary}
      </blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] text-mute">
        {hasAlt && (
          <button
            type="button"
            onClick={() => setShowAlt((v) => !v)}
            data-cursor="OPEN ↗"
            className="border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:border-gold hover:text-gold"
          >
            {showAlt ? (lang === "zh" ? "EN / 中" : "中 / EN") : lang === "zh" ? "中 / EN" : "EN / 中"}
          </button>
        )}
        <span>{source}</span>
        <span aria-hidden>·</span>
        <span>{date}</span>
        {url && (
          <a
            href={url}
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
