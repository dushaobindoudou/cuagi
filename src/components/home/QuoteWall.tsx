import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import clsx from "clsx";
import { quoteWall, campColor } from "@/lib/data";
import type { WallQuote } from "@/lib/data";
import { useLang } from "@/lib/i18n";

/** One word, lit up as the scrub progress passes its slice. */
function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  const y = useTransform(progress, [start, end], [12, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block">
      {word}
    </motion.span>
  );
}

function WallItem({ quote: q, index }: { quote: WallQuote; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 35%"],
  });
  const barScale = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const hex = campColor(q.camp);
  const { lang } = useLang();
  const display = lang === "en" ? q.en : q.zh;
  const words = lang === "en" ? display.split(" ") : display.split("");
  const alignLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={clsx("relative flex", alignLeft ? "justify-start" : "justify-end")}
    >
      <figure
        className={clsx(
          "relative max-w-[720px] pl-6",
          index % 3 === 1 ? "md:w-[60%]" : "md:w-[52%]",
          !alignLeft && "text-right pr-6 pl-0",
        )}
      >
        <motion.span
          aria-hidden
          className={clsx(
            "absolute inset-y-1 w-1 origin-top",
            alignLeft ? "left-0" : "right-0",
          )}
          style={{ backgroundColor: hex, scaleY: barScale }}
        />
        <blockquote className="font-serifsc text-[clamp(24px,3vw,40px)] font-bold leading-[1.5] text-bone">
          {words.map((w, i) => (
            <Word key={i} word={w === " " ? " " : lang === "en" ? w + " " : w} index={i} total={words.length} progress={scrollYProgress} />
          ))}
        </blockquote>
        {lang === "zh" && (
          <motion.p
            style={{ opacity: useTransform(scrollYProgress, [0.5, 0.8], [0, 1]) }}
            className="mt-3 font-serifsc text-[15px] italic leading-relaxed text-bone-dim"
          >
            {q.en}
          </motion.p>
        )}
        <motion.figcaption
          style={{ opacity: useTransform(scrollYProgress, [0.65, 0.9], [0, 1]) }}
          className="mt-4 font-mono text-[12px] tracking-[0.08em] text-mute"
        >
          —— {q.who} · {q.source} · {q.date}
          {q.url && (
            <>
              {" "}
              <a
                href={q.url}
                target="_blank"
                rel="noreferrer"
                data-cursor="OPEN ↗"
                className="text-bone-dim underline-offset-4 transition-colors hover:text-gold hover:underline"
              >
                {lang === "zh" ? "原文 ↗" : "SOURCE ↗"}
              </a>
            </>
          )}
        </motion.figcaption>
      </figure>
    </div>
  );
}

/**
 * S6 金句墙 (home.md): dossier texture backplate, parallax outline
 * QUOTES word, five curated bilingual quotes with scrub word-by-word
 * illumination.
 */
export default function QuoteWall() {
  const { t } = useLang();
  const bgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: bgRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <section ref={bgRef} className="relative overflow-hidden border-t border-line py-24 md:py-32">
      {/* texture backplate */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
        style={{ backgroundImage: "url(/dossier-texture.png)" }}
      />
      {/* parallax outline word */}
      <motion.div
        aria-hidden
        style={{ y: bgY }}
        className="text-outline pointer-events-none absolute left-0 top-8 select-none whitespace-nowrap font-anton text-[20vw] leading-none"
      >
        QUOTES QUOTES
      </motion.div>

      <div className="relative mx-auto max-w-[1520px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-mute">
            CLASH OF VIEWS
          </p>
          <h2 className="mt-3 font-serifsc text-[32px] font-black text-bone md:text-[40px]">
            {t("quoteWallTitle")}
          </h2>
        </motion.div>

        <div className="mt-16 space-y-16 md:space-y-20">
          {quoteWall.map((q, i) => (
            <WallItem key={q.companyId} quote={q} index={i} />
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            to="/quotes"
            data-cursor="OPEN ↗"
            className="border border-gold px-5 py-2.5 font-mono text-[12px] tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            {t("vaultTitle")} ▸
          </Link>
        </div>
      </div>
    </section>
  );
}
