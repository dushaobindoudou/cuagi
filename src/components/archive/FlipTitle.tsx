import { motion } from "framer-motion";
import clsx from "clsx";
import { useLang } from "@/lib/i18n";

interface FlipTitleProps {
  /** 中文主标题（Noto Serif SC 900，字符级翻转入场） */
  zh: string;
  /** Anton 英文标题（en 模式下为主标题，zh 模式下为描边衬词） */
  en: string;
  className?: string;
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

/**
 * 页眉标题（quotes.md S1 / about.md S1）：语言感知——
 * zh 模式显示中文标题（字符级 3D 翻转入场），en 模式显示 Anton 英文标题，不混排。
 */
export default function FlipTitle({ zh, en, className }: FlipTitleProps) {
  const { lang } = useLang();
  const isZh = lang === "zh";
  const chars = Array.from(isZh ? zh : en);
  return (
    <div className={clsx("relative", className)}>
      <h1
        className={clsx(
          "relative z-10 font-black leading-[1.1] text-bone",
          isZh
            ? "font-serifsc text-[clamp(40px,5.5vw,72px)]"
            : "font-anton uppercase tracking-[0.02em] text-[clamp(36px,5vw,64px)]",
        )}
        style={{ perspective: "600px" }}
      >
        {chars.map((ch, i) => (
          <motion.span
            key={`${lang}-${ch}-${i}`}
            className="inline-block will-change-transform"
            style={{ transformOrigin: "50% 100%" }}
            initial={{ rotateX: -95, opacity: 0, y: "0.35em" }}
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 + i * 0.05 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </h1>
      {isZh && (
        <motion.div
          aria-hidden
          className="text-outline-bone pointer-events-none mt-1 select-none whitespace-nowrap font-anton text-[clamp(28px,4vw,52px)] uppercase leading-none tracking-[0.04em] opacity-70"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 + chars.length * 0.05 }}
        >
          {en}
        </motion.div>
      )}
    </div>
  );
}
