import { core6, signatureQuote, campColor } from "@/lib/data";
import type { Company } from "@/lib/data";
import { useLang } from "@/lib/i18n";

interface MarqueeItem {
  company: Company;
  quote: string;
}

function MarqueeLine({ items }: { items: MarqueeItem[] }) {
  return (
    <span className="flex shrink-0 items-center">
      {items.map(({ company, quote }) => (
        <span key={company.id} className="flex items-center">
          <span className="whitespace-nowrap font-serifsc text-[18px] font-bold text-bone-dim">
            {quote}
            <span className="ml-3 font-mono text-[11px] tracking-[0.16em] text-mute">
              {company.leader.name} · {company.shortName}
            </span>
          </span>
          <span
            aria-hidden
            className="mx-8 text-[12px]"
            style={{ color: campColor(company.camp) }}
          >
            ◆
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * 引语跑马灯 (design.md §8.7): one-line seamless marquee (40s / loop),
 * core-6 signature quotes separated by camp-colored ◆, pauses on hover.
 */
export default function QuoteMarquee() {
  const { lang } = useLang();
  const items = core6
    .map((c) => ({ company: c, quote: signatureQuote(c, lang) }))
    .filter((x) => x.quote);

  return (
    <div className="marquee-paused relative overflow-hidden border-y border-line bg-ink/60 py-3">
      <div className="flex w-max animate-marquee">
        <MarqueeLine items={items} />
        <MarqueeLine items={items} />
      </div>
    </div>
  );
}
