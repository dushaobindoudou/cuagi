import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * 自定义「瞄准镜」光标 (design.md §6): 12px hollow square + 2px center dot,
 * spring physics (stiffness 400 / damping 28); grows to 40px and takes the
 * camp color over interactive targets; IBM Plex Mono micro label from the
 * nearest [data-cursor] element. Desktop (fine pointer) only.
 */
export default function CustomCursor() {
  const [enabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );
  const [label, setLabel] = useState("");
  const [accent, setAccent] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 400, damping: 28 });
  const sy = useSpring(y, { stiffness: 400, damping: 28 });

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = e.target as HTMLElement | null;
      const tagged = el?.closest?.("[data-cursor]") as HTMLElement | null;
      if (tagged) {
        setLabel(tagged.dataset.cursor ?? "");
        setAccent(tagged.dataset.cursorColor ?? null);
      } else if (el?.closest?.("a, button, [role='button'], [role='link'], input, textarea, select")) {
        setLabel("OPEN ↗");
        setAccent(null);
      } else {
        setLabel("");
        setAccent(null);
      }
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const active = Boolean(label);
  const size = active ? 40 : 12;
  const color = accent ?? "#E9E4D6";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border transition-all duration-200"
          style={{ width: size, height: size, borderColor: color }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: color }}
        />
        {label && (
          <div
            className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-[0.16em]"
            style={{ color }}
          >
            {label}
          </div>
        )}
      </div>
    </motion.div>
  );
}
