import { useEffect, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { useRef } from "react";
import QuoteMarquee from "@/components/QuoteMarquee";
import { stats, updatedAt } from "@/lib/data";
import { useLang } from "@/lib/i18n";

const CN_TITLE = "谁将最先实现 AGI？";
const EN_TITLE = "WHO WILL REACH AGI FIRST?";

function CountUp({ value, delay }: { value: number; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.2,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, delay]);
  return (
    <span ref={ref} className="text-bone">
      {display}
    </span>
  );
}

/** Per-character entrance for the giant titles (home.md S1). */
function SplitChars({
  text,
  delay,
  className,
  charClassName,
}: {
  text: string;
  delay: number;
  className?: string;
  charClassName?: (ch: string, i: number) => React.CSSProperties | undefined;
}) {
  return (
    <span className={className} style={{ perspective: 800 }}>
      {text.split("").map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            style={charClassName?.(ch, i)}
            initial={{ y: "110%", rotateX: -60, opacity: 0 }}
            animate={{ y: "0%", rotateX: 0, opacity: 1 }}
            transition={{ duration: 1, delay: delay + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** English title colored: left half cn / right half us / middle char gold. */
function enCharStyle(_ch: string, i: number): React.CSSProperties {
  const n = EN_TITLE.length;
  const mid = Math.floor(n / 2);
  if (i === mid || i === mid - 1) return { color: "var(--gold)" };
  return { color: i < mid ? "var(--cn)" : "var(--us)" };
}

interface HeroSectionProps {
  booted: boolean;
}

export default function HeroSection({ booted }: HeroSectionProps) {
  const { lang, t } = useLang();
  const isZh = lang === "zh";
  // 8% mouse parallax on the content, giant type counters at 4%
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const contentX = useTransform(sx, (v) => v * 0.08);
  const contentY = useTransform(sy, (v) => v * 0.08);
  const titleX = useTransform(sx, (v) => v * -0.04);
  const titleY = useTransform(sy, (v) => v * -0.04);

  const d = booted ? 0.15 : 999; // animations only start after boot

  return (
    <section
      className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - (r.left + r.width / 2));
        my.set(e.clientY - (r.top + r.height / 2));
      }}
    >
      {/* CSS fallback starfield (shows under/instead of WebGL) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 90% at 18% 50%, rgba(214,58,44,0.10), transparent 60%)," +
            "radial-gradient(60% 90% at 82% 50%, rgba(46,111,224,0.10), transparent 60%)",
        }}
      />

      {booted && (
        <motion.div
          className="relative z-10 flex flex-1 flex-col"
          style={{ x: contentX, y: contentY }}
        >
          {/* eyebrow */}
          <div className="mx-auto mt-10 w-full max-w-[1520px] px-5 md:px-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: d + 0.2, duration: 0.8 }}
              className="font-grotesk text-[12px] font-medium tracking-[0.3em] text-mute"
            >
              {t("heroEyebrow")}
            </motion.p>
          </div>

          {/* giant titles */}
          <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
            <motion.h1
              style={{ x: titleX, y: titleY }}
              className="font-serifsc text-[clamp(64px,9vw,150px)] font-black leading-[1.05] text-bone"
            >
              <SplitChars text={CN_TITLE} delay={d} />
            </motion.h1>

            {/* gold rule with rotating diamond */}
            <div className="relative my-5 flex w-full max-w-3xl items-center justify-center md:my-7">
              <motion.div
                className="h-px w-full bg-gold/70 origin-center"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: d + 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                className="absolute text-[14px] text-gold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                transition={{
                  opacity: { delay: d + 1.2, duration: 0.4 },
                  rotate: { delay: d + 1.2, duration: 6, repeat: Infinity, ease: "linear" },
                }}
              >
                ◆
              </motion.span>
            </div>

            {isZh && (
              <motion.div
                style={{ x: titleX, y: titleY }}
                className="font-anton text-[clamp(36px,5vw,80px)] uppercase leading-none tracking-[0.01em]"
              >
                <SplitChars text={EN_TITLE} delay={d + 0.5} charClassName={enCharStyle} />
              </motion.div>
            )}

            {/* archive data strip */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d + 1.3, duration: 0.8 }}
              className="mt-8 font-mono text-[12px] tracking-[0.08em] text-bone-dim"
            >
              {isZh ? (
                <>
                  已收录 <CountUp value={stats.companies} delay={d + 1.4} /> 家公司 ·{" "}
                  <CountUp value={stats.quotes} delay={d + 1.45} /> 条引语 ·{" "}
                  <CountUp value={stats.links} delay={d + 1.5} /> 条资料链接 · 数据截至{" "}
                  <span className="text-gold">{updatedAt}</span>
                </>
              ) : (
                <>
                  <CountUp value={stats.companies} delay={d + 1.4} /> companies ·{" "}
                  <CountUp value={stats.quotes} delay={d + 1.45} /> quotes ·{" "}
                  <CountUp value={stats.links} delay={d + 1.5} /> sources · data as of{" "}
                  <span className="text-gold">{updatedAt}</span>
                </>
              )}
            </motion.p>
          </div>

          {/* bottom: marquee + scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: d + 1.8, duration: 0.8 }}
          >
            <div className="mb-4 flex justify-center">
              <span className="flex flex-col items-center gap-1 font-mono text-[10px] tracking-[0.3em] text-mute">
                SCROLL
                <span className="h-6 w-[2px] animate-scroll-hint bg-mute" />
              </span>
            </div>
            <QuoteMarquee />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
