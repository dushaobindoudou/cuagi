import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import clsx from "clsx";
import { companies, spectrumColor, campColor, quoteTextOf } from "@/lib/data";
import { useLang } from "@/lib/i18n";

/**
 * S4 开源光谱条 · 首页浓缩版 (home.md): a 4px cn → gold → jade axis with
 * 14 staggered diamond markers at each company's openSourceScore; hover a
 * marker for a stance tooltip. Full view lives at /spectrum.
 */
export default function SpectrumStrip() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const { lang, t } = useLang();
  const sorted = [...companies].sort((a, b) => b.openSourceScore - a.openSourceScore);

  return (
    <section className="relative border-t border-line py-20 md:py-28">
      <div className="mx-auto max-w-[1520px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <h2 className="font-serifsc text-[32px] font-black text-bone md:text-[40px]">
              {t("spectrumTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-[14px] leading-[1.85] text-bone-dim">
              {lang === "zh"
                ? "14 家公司，0–10 立场刻度。评分依据管理层公开言论与开源行为 · 2026-07"
                : "14 companies on a 0–10 stance scale, scored by public statements and open-source behavior · 2026-07"}
            </p>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.16em] text-mute">
            <span className="text-cn">0 · {lang === "zh" ? "闭源" : "CLOSED"}</span>
            <span className="text-jade">{lang === "zh" ? "开源" : "OPEN"} · 10</span>
          </div>
        </motion.div>

        <div className="relative mt-14 h-[190px] md:h-[170px]">
          {/* axis */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-1 origin-left"
            style={{
              background: "linear-gradient(90deg, var(--cn) 0%, var(--gold) 50%, var(--jade) 100%)",
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-25% 0px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* tick labels */}
          <div className="absolute left-0 right-0 top-1/2 mt-3 flex justify-between font-mono text-[10px] text-mute">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i}>{i}</span>
            ))}
          </div>

          {/* markers */}
          {sorted.map((c, i) => {
            const left = `${(c.openSourceScore / 10) * 100}%`;
            const above = i % 2 === 0;
            const hovered = hoverId === c.id;
            const q0 = c.insights.openSource.quotes[0];
            const stance =
              (q0 ? quoteTextOf(q0, lang) : undefined) ?? c.insights.openSource.summary ?? "";
            return (
              <motion.div
                key={c.id}
                className="absolute top-1/2"
                style={{ left }}
                initial={{ scale: 0, y: above ? -14 : 14, opacity: 0 }}
                whileInView={{ scale: 1, y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-25% 0px" }}
                transition={{ delay: 0.9 + i * 0.05, type: "spring", stiffness: 500, damping: 18 }}
              >
                <div
                  className={clsx(
                    "relative flex -translate-x-1/2 flex-col items-center",
                    above ? "-translate-y-full pb-3" : "pt-3",
                  )}
                  onMouseEnter={() => setHoverId(c.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  {/* hover beam */}
                  <span
                    aria-hidden
                    className={clsx(
                      "absolute left-1/2 w-px -translate-x-1/2 bg-gradient-to-b transition-opacity duration-300",
                      above ? "top-full h-6 from-gold/80 to-transparent" : "bottom-full h-6 from-transparent to-gold/80",
                      hovered ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <button
                    type="button"
                    data-cursor="VIEW ▸"
                    aria-label={`${c.shortName} 开源评分 ${c.openSourceScore}/10`}
                    className="block h-3.5 w-3.5 rotate-45 border transition-transform duration-200 hover:scale-125"
                    style={{
                      backgroundColor: spectrumColor(c.openSourceScore),
                      borderColor: campColor(c.camp),
                    }}
                  />
                  <span
                    className={clsx(
                      "whitespace-nowrap font-mono text-[11px] text-bone-dim",
                      above ? "order-first mb-1" : "mt-1",
                    )}
                  >
                    {c.shortName}
                  </span>

                  {/* tooltip */}
                  <div
                    className={clsx(
                      "pointer-events-none absolute left-1/2 z-20 w-56 -translate-x-1/2 border border-line bg-ink-2 p-3 transition-all duration-300",
                      above ? "bottom-full mb-8" : "top-full mt-8",
                      hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                    )}
                  >
                    <p className="flex items-baseline justify-between font-serifsc text-[14px] font-bold text-bone">
                      {c.shortName}
                      <span className="font-mono text-[11px] text-gold">
                        {c.openSourceScore}/10
                      </span>
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-bone-dim">
                      {stance}
                    </p>
                    <p className="mt-2 font-mono text-[10px] tracking-[0.16em] text-gold">
                      查看立场 →
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            to="/spectrum"
            data-cursor="OPEN ↗"
            className="border border-gold px-5 py-2.5 font-mono text-[12px] tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            {t("enterSpectrum")}
          </Link>
        </div>
      </div>
    </section>
  );
}
