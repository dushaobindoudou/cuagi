import clsx from "clsx";
import { spectrumColor } from "@/lib/data";

interface ScoreBarProps {
  score: number; // 0–10
  mini?: boolean;
  showValue?: boolean;
  className?: string;
}

/**
 * 评分条 / 光谱标记 (design.md §8.6): 10-segment slot; filled
 * segments follow the openSourceScore with a cn → gold → jade
 * interpolation; the current (last filled) segment breathes.
 */
export default function ScoreBar({ score, mini, showValue, className }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(10, Math.round(score)));
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <span className={clsx("flex", mini ? "gap-[3px]" : "gap-1")}>
        {Array.from({ length: 10 }, (_, i) => {
          const filled = i < clamped;
          const isCurrent = i === clamped - 1;
          return (
            <span
              key={i}
              className={clsx(
                mini ? "h-[10px] w-[4px]" : "h-[14px] w-[6px]",
                "border",
                isCurrent && filled && "animate-pulse-segment",
              )}
              style={{
                backgroundColor: filled ? spectrumColor(i + 1) : "transparent",
                borderColor: filled ? spectrumColor(i + 1) : "var(--line)",
              }}
            />
          );
        })}
      </span>
      {showValue && (
        <span className="font-mono text-[11px] tracking-[0.08em] text-bone-dim">
          {clamped}/10
        </span>
      )}
    </span>
  );
}
