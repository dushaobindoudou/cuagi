import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = ["LOADING ROAD TO AGI…", "DECRYPTING 14 LEADERS…", "READY"];
const SESSION_KEY = "road-to-agi-booted";

interface BootScreenProps {
  onDone: () => void;
}

/**
 * S0 预加载 (home.md): typewriter mono lines + bone progress bar,
 * then the whole screen peels up via clip-path. First visit per
 * session only.
 */
export default function BootScreen({ onDone }: BootScreenProps) {
  const [skip] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [lineIdx, setLineIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (skip) {
      onDone();
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((_, i) => timers.push(setTimeout(() => setLineIdx(i + 1), 250 * (i + 1))));
    // progress 0 → 100 over ~0.9s
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setProgress(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    timers.push(
      setTimeout(() => {
        setLeaving(true);
        sessionStorage.setItem(SESSION_KEY, "1");
        timers.push(setTimeout(onDone, 620));
      }, 1100),
    );
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  if (skip) return null;

  return (
    <AnimatePresence>
      {!leaving ? (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ink"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1] }}
        >
          <div className="w-[280px]">
            <div className="flex h-20 flex-col justify-end gap-1 font-mono text-[13px] tracking-[0.16em] text-bone-dim">
              {LINES.slice(0, lineIdx).map((l, i) => (
                <span key={l} className={i === LINES.length - 1 ? "text-gold" : undefined}>
                  {l}
                  {i === lineIdx - 1 && <span className="animate-caret-blink">▌</span>}
                </span>
              ))}
            </div>
            <div className="mt-4 h-px w-full bg-line">
              <div
                className="h-px bg-bone transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-right font-mono text-[14px] text-bone">{progress}%</div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="boot-exit"
          className="fixed inset-0 z-[90] bg-ink"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          animate={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1] }}
        />
      )}
    </AnimatePresence>
  );
}
