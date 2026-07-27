import { useEffect, useRef } from "react";
import clsx from "clsx";

/**
 * W4 档案扫描线 (design.md §7 / detail.md §S1): dark canvas with slowly
 * descending scanlines + occasional signal-noise flicker bands, like a
 * surveillance monitor. Pauses off-screen; static under reduced-motion.
 */
export default function ScanlineCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let visible = true;
    let t = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    io.observe(canvas);

    const paint = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      // descending scanlines, 4px pitch
      const gap = 4 * dpr;
      const off = (t * 0.35 * dpr) % gap;
      ctx.fillStyle = "rgba(233,228,214,0.028)";
      for (let y = -gap + off; y < h; y += gap) {
        ctx.fillRect(0, Math.round(y), w, Math.max(1, dpr * 0.6));
      }
      // occasional noise band flicker
      if (Math.random() < 0.05) {
        const y = Math.random() * h;
        ctx.fillStyle = "rgba(233,228,214,0.05)";
        ctx.fillRect(0, y, w, 2 * dpr);
        ctx.fillStyle = "rgba(92,95,104,0.08)";
        ctx.fillRect(0, y + 3 * dpr, w * Math.random(), dpr);
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      t = 40; // arbitrary offset so lines are visible
      paint();
    } else {
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        t += 1;
        paint();
      };
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={clsx("pointer-events-none", className)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
