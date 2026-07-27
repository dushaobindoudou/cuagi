import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

interface PageHeaderProps {
  /** Chinese display title (Noto Serif SC 900), animated per character */
  title: string;
  /** English display title (Anton uppercase) */
  en: string;
  /** mono subtitle line (zh) */
  subtitle: string;
  /** mono subtitle line (en) */
  subtitleEn?: string;
}

/**
 * Shared page header for /spectrum and /arena: char-level rotateX entrance
 * for the title, blur-in outline wordmark, mono subtitle. Language-aware —
 * shows only the current language (no mixing).
 */
export default function PageHeader({ title, en, subtitle, subtitleEn }: PageHeaderProps) {
  const { lang } = useLang();
  const isZh = lang === "zh";
  const display = isZh ? title : en;
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="relative mx-auto max-w-[1520px] px-5 pb-14 pt-16 text-center md:px-10 md:pb-20 md:pt-24">
        {/* title — char-level y/rotateX entrance */}
        <h1
          className={
            isZh
              ? "font-serifsc text-[clamp(40px,5.5vw,72px)] font-black leading-[1.15] text-bone"
              : "font-anton uppercase tracking-[0.02em] text-[clamp(36px,5vw,64px)] leading-[1.1] text-bone"
          }
          style={{ perspective: 800 }}
        >
          {display.split("").map((ch, i) => (
            <span key={`${lang}-${i}`} className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "80%", rotateX: -50, opacity: 0 }}
                animate={{ y: "0%", rotateX: 0, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* outline wordmark of the other language — decorative, blur in */}
        <motion.p
          aria-hidden
          className="text-outline-bone mt-2 font-anton text-[clamp(24px,3.4vw,48px)] uppercase leading-none tracking-[0.02em] opacity-40"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 0.4, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {en}
        </motion.p>

        <motion.p
          className="mx-auto mt-6 max-w-3xl font-mono text-[13px] leading-relaxed tracking-[0.08em] text-bone-dim"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {isZh ? subtitle : (subtitleEn ?? subtitle)}
        </motion.p>
      </div>
    </section>
  );
}
