import { motion } from "framer-motion";
import clsx from "clsx";
import { useLang } from "@/lib/i18n";

interface SectionHeadProps {
  /** latin eyebrow, e.g. "STATEMENTS" */
  en: string;
  /** chinese title, e.g. "三维言论拆解" */
  zh: string;
  note?: string;
  noteEn?: string;
  className?: string;
}

/**
 * Shared section heading for the dossier page. Shows the Chinese title in
 * zh mode and the latin title in en mode (no mixing). Block-level entrance
 * y:40 → 0 (self-contained framer whileInView).
 */
export default function SectionHead({ en, zh, note, noteEn, className }: SectionHeadProps) {
  const { lang } = useLang();
  return (
    <motion.header
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className={clsx("border-t border-line pt-10", className)}
    >
      <h2
        className={clsx(
          "font-black leading-[1.15] text-bone",
          lang === "zh"
            ? "font-serifsc text-[clamp(30px,4.4vw,56px)]"
            : "font-anton uppercase tracking-[0.02em] text-[clamp(28px,4vw,50px)]",
        )}
      >
        {lang === "zh" ? zh : en}
      </h2>
      {(note || noteEn) && (
        <p className="mt-3 font-mono text-[12px] tracking-[0.12em] text-mute">
          {lang === "en" && noteEn ? noteEn : note}
        </p>
      )}
    </motion.header>
  );
}
