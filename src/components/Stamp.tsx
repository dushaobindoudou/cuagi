import { motion } from "framer-motion";
import clsx from "clsx";

export type StampVariant = "verified" | "monogram" | "top";

const TEXT: Record<StampVariant, { zh: string; en: string }> = {
  verified: { zh: "已核实", en: "VERIFIED" },
  monogram: { zh: "剪影档案", en: "MONOGRAM" },
  top: { zh: "第一名", en: "TOP 1" },
};

const COLOR: Record<StampVariant, string> = {
  verified: "#D63A2C",
  monogram: "#5C5F68",
  top: "#C9A24B",
};

interface StampProps {
  variant?: StampVariant;
  color?: string;
  className?: string;
  /** disable entrance animation */
  static?: boolean;
}

/**
 * 密级章 / 验证章 (design.md §8.4).
 * Elliptical ink stamp, rotated -8°, with a "stamp-in" entrance
 * (scale 1.6 → 1 + opacity, back.out with a 2-frame shudder).
 */
export default function Stamp({ variant = "verified", color, className, static: isStatic }: StampProps) {
  const c = color ?? COLOR[variant];
  const t = TEXT[variant];

  const svg = (
    <svg viewBox="0 0 220 110" className="h-full w-full" fill="none" style={{ color: c }}>
      <g transform="rotate(-8 110 55)">
        <ellipse
          cx="110" cy="55" rx="100" ry="46"
          stroke="currentColor" strokeWidth="3"
          strokeDasharray="140 6 90 4 200 8" strokeLinecap="round"
        />
        <ellipse
          cx="110" cy="55" rx="88" ry="35"
          stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="120 5 70 3 160 6"
        />
        <text
          x="110" y="52" textAnchor="middle" fill="currentColor"
          fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="26" letterSpacing="6"
        >
          {t.zh}
        </text>
        <text
          x="110" y="76" textAnchor="middle" fill="currentColor"
          fontFamily="'IBM Plex Mono', monospace" fontWeight="500" fontSize="14" letterSpacing="4"
        >
          {t.en}
        </text>
        <rect x="18" y="48" width="14" height="6" fill="#0B0C0E" transform="rotate(-14 25 51)" />
        <rect x="188" y="60" width="12" height="5" fill="#0B0C0E" transform="rotate(9 194 62)" />
      </g>
    </svg>
  );

  if (isStatic) {
    return <span className={clsx("inline-block", className)}>{svg}</span>;
  }

  return (
    <motion.span
      className={clsx("inline-block", className)}
      initial={{ scale: 1.6, opacity: 0, rotate: -4 }}
      whileInView={{ scale: [1.6, 0.94, 1.04, 1], opacity: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.3, ease: "backOut", times: [0, 0.7, 0.85, 1] }}
    >
      {svg}
    </motion.span>
  );
}
