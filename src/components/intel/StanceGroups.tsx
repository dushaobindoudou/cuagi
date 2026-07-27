import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Company } from "@/lib/data";
import { companies, spectrumColor } from "@/lib/data";
import ScoreBar from "@/components/ScoreBar";
import { stanceWord } from "@/components/intel/stance";
import { useLang } from "@/lib/i18n";
import { quoteTextOf } from "@/lib/data";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface Group {
  label: string;
  labelEn: string;
  range: string;
  /** representative score used for the group color */
  colorScore: number;
  match: (c: Company) => boolean;
}

const GROUPS: Group[] = [
  { label: "开源旗手", labelEn: "FLAGBEARERS", range: "SCORE 9–10", colorScore: 10, match: (c) => c.openSourceScore >= 9 },
  { label: "开源为主", labelEn: "MOSTLY OPEN", range: "SCORE 7–8", colorScore: 8, match: (c) => c.openSourceScore >= 7 && c.openSourceScore <= 8 },
  { label: "摇摆中间", labelEn: "ON THE FENCE", range: "SCORE 5–6", colorScore: 5, match: (c) => c.openSourceScore >= 5 && c.openSourceScore <= 6 },
  { label: "闭源为主", labelEn: "MOSTLY CLOSED", range: "SCORE 0–4", colorScore: 1, match: (c) => c.openSourceScore <= 4 },
];

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

/**
 * S3 立场分组墙 (spectrum.md): four stance columns — 开源旗手 9–10 /
 * 开源为主 7–8 / 摇摆中间 5–6 / 闭源为主 ≤4 — with mini company cards
 * (name + leader + ScoreBar + a 40-char stance quote).
 */
export default function StanceGroups() {
  const navigate = useNavigate();
  const { lang, t } = useLang();

  return (
    <section className="border-t border-line py-20 md:py-28">
      <div className="mx-auto max-w-[1520px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="font-grotesk text-[12px] font-medium tracking-[0.3em] text-mute">
            STANCE GROUPS
          </p>
          <h2 className="mt-3 font-serifsc text-[32px] font-black text-bone md:text-[40px]">
            {lang === "zh" ? "立场分组墙" : "STANCE GROUPS"}
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-4">
          {GROUPS.map((g, gi) => {
            const list = companies
              .filter(g.match)
              .sort((a, b) => b.openSourceScore - a.openSourceScore);
            const color = spectrumColor(g.colorScore);
            return (
              <motion.div
                key={g.label}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.8, delay: gi * 0.12, ease: EASE }}
                className="bg-ink p-6"
              >
                <p className="font-mono text-[11px] tracking-[0.16em] text-mute">{g.range}</p>
                <h3 className="mt-2 font-serifsc text-[24px] font-black" style={{ color }}>
                  {lang === "zh" ? g.label : g.labelEn}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-mute">{list.length} {lang === "zh" ? "家" : "cos."}</p>

                <div className="mt-6 space-y-3">
                  {list.map((c, i) => {
                    const q = c.insights.openSource.quotes[0];
                    return (
                      <motion.button
                        key={c.id}
                        type="button"
                        data-cursor="SELECT ▸"
                        onClick={() => navigate(`/company/${c.id}`)}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10% 0px" }}
                        transition={{ duration: 0.6, delay: gi * 0.12 + 0.2 + i * 0.06, ease: EASE }}
                        className={clsx(
                          "group block w-full border border-line bg-ink-2 p-4 text-left",
                          "transition-all duration-300 hover:-translate-y-1 hover:bg-ink-3",
                        )}
                        style={{ ["--camp" as string]: c.camp === "china" ? "#D63A2C" : "#2E6FE0" }}
                      >
                        <p className="flex items-baseline justify-between gap-2">
                          <span className="font-serifsc text-[16px] font-bold text-bone transition-colors group-hover:text-[var(--camp)]">
                            {c.shortName}
                          </span>
                          <span className="font-mono text-[10px] tracking-[0.12em] text-mute">
                            {c.leader.name.split("（")[0]}
                          </span>
                        </p>
                        <ScoreBar score={c.openSourceScore} mini showValue className="mt-3" />
                        {q && (
                          <p className="mt-3 text-[12px] leading-[1.7] text-bone-dim">
                            {truncate(quoteTextOf(q, lang), 40)}
                          </p>
                        )}
                        <p className="mt-2 font-mono text-[10px] tracking-[0.16em] text-mute transition-colors group-hover:text-gold">
                          {stanceWord(c.openSourceScore, lang)} · {t("viewAnalysis")}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
