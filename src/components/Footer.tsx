import { Link } from "react-router";
import { stats, updatedAt } from "@/lib/data";
import { useLang, type Key } from "@/lib/i18n";

const INDEX_LINKS: { to: string; key: Key }[] = [
  { to: "/", key: "navHome" },
  { to: "/spectrum", key: "navSpectrum" },
  { to: "/arena", key: "navArena" },
  { to: "/quotes", key: "navQuotes" },
  { to: "/about", key: "navAbout" },
];

/** Global footer (design.md §8.2). */
export default function Footer() {
  const { lang, t } = useLang();
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink">
      <div className="mx-auto grid max-w-[1520px] gap-12 px-5 pb-24 pt-16 md:grid-cols-3 md:px-10">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-8 w-8" />
            <span className="font-grotesk text-sm font-bold tracking-[0.2em]">ROAD TO AGI</span>
          </div>
          <p className="mt-5 max-w-sm text-[14px] leading-[1.85] text-bone-dim">
            {lang === "zh"
              ? "通往 AGI 收录 14 家头部大模型公司掌舵者的公开语录，用 AI 总结每家公司的战略方向、他们认为最重要的事、如何理解 AGI、如何看待开源。所有引语均附出处链接；AI 总结仅供研究参考，不构成任何投资或商业建议。"
              : "Road to AGI collects public statements by the leaders of 14 frontier model companies, with AI-generated reads on each company's strategy, what they believe matters most, how they understand AGI, and how they see open source. Every quote links to its source; AI summaries are for research reference only and constitute no investment or business advice."}
          </p>
        </div>
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            {t("footerIndex")}
          </h3>
          <ul className="mt-5 space-y-3">
            {INDEX_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  data-cursor="OPEN ↗"
                  className="font-mono text-[13px] tracking-[0.08em] text-bone-dim transition-colors hover:text-gold"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            {t("footerData")}
          </h3>
          <div className="mt-5 space-y-3 font-mono text-[12px] leading-relaxed text-bone-dim">
            <p>
              {lang === "zh" ? "数据截至" : "Data as of"} <span className="text-gold">{updatedAt}</span>
            </p>
            <p>
              {lang === "zh"
                ? `收录 ${stats.companies} 家公司 / ${stats.quotes} 条引语 / ${stats.links} 条资料链接`
                : `${stats.companies} companies / ${stats.quotes} quotes / ${stats.links} sources`}
            </p>
            <p>
              {lang === "zh"
                ? "榜单数据以各榜快照日期为准，详见排行榜页。"
                : "Leaderboard figures carry their snapshot dates — see the rankings page."}
            </p>
          </div>
        </div>
      </div>

      {/* giant outline wordmark */}
      <div aria-hidden className="pointer-events-none select-none px-5 md:px-10">
        <div className="text-outline whitespace-nowrap text-center font-anton text-[13.5vw] leading-[0.9] opacity-[0.35]">
          ROAD TO AGI
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center justify-between gap-2 px-5 py-5 font-mono text-[11px] tracking-[0.08em] text-mute md:flex-row md:px-10">
          <span>{t("copyright")}</span>
          <span>{t("vol")}</span>
        </div>
      </div>
    </footer>
  );
}
