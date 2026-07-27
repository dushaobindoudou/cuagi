import { motion } from "framer-motion";
import { others8 } from "@/lib/data";
import CompanyCard from "@/components/CompanyCard";
import { useLang } from "@/lib/i18n";

/**
 * S3 其余选手 — 其他 8 家档案盒 (home.md): two rows of four
 * CompanyCards, row-wise entrance stagger.
 */
export default function BenchRoster() {
  const { lang, t } = useLang();
  const rows = [others8.slice(0, 4), others8.slice(4, 8)];
  return (
    <section className="relative border-t border-line py-20 md:py-28">
      <div className="mx-auto max-w-[1520px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-mute">CN 04–08 + US 04–06</p>
          <h2 className="mt-3 font-serifsc text-[32px] font-black text-bone md:text-[40px]">
            {lang === "zh" ? (
              <>
                <span className="mr-3 font-anton text-[28px] tracking-[0.02em] text-bone-dim md:text-[36px]">
                  MORE CONTENDERS
                </span>
                · {t("othersTitle")}
              </>
            ) : (
              <span className="font-anton text-[32px] tracking-[0.02em] md:text-[40px]">
                MORE CONTENDERS
              </span>
            )}
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rows.flatMap((row, r) =>
            row.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.7, delay: i * 0.07 + r * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <CompanyCard company={c} />
              </motion.div>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
