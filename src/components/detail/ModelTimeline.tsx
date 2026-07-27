import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";
import type { Company } from "@/lib/data";
import { campColor } from "@/lib/data";
import SectionHead from "@/components/detail/SectionHead";
import { useLang } from "@/lib/i18n";
import { noteOf } from "@/lib/data";
import { timelineNodes } from "@/components/detail/helpers";

gsap.registerPlugin(ScrollTrigger);

interface ModelTimelineProps {
  company: Company;
}

/**
 * S4 模型时间线 (detail.md §S4): desktop = ScrollTrigger-pinned horizontal
 * scrub (vertical scroll maps to lateral track translation), date-proportional
 * node spacing, alternating above/below the rail; flagship = gold diamond
 * with FLAGSHIP tag + breathing glow + one gold flash sweep. Nodes light up
 * via containerAnimation triggers. Mobile = vertical rail. GSAP-only.
 */
export default function ModelTimeline({ company: c }: ModelTimelineProps) {
  const { lang } = useLang();
  const hex = campColor(c.camp);
  const nodes = useMemo(() => timelineNodes(c), [c]);

  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [trackW, setTrackW] = useState(1600);

  // measure / recompute track width
  useEffect(() => {
    const compute = () => {
      const vw = pinRef.current?.clientWidth ?? window.innerWidth;
      setTrackW(Math.max(vw * 1.5, nodes.length * 250 + 240));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [nodes.length]);

  // date-proportional x positions
  const positions = useMemo(() => {
    const months = nodes.map((n) => n.month);
    const min = Math.min(...months);
    const max = Math.max(...months);
    const span = Math.max(max - min, 1);
    const pad = 80;
    return nodes.map((n) => pad + ((n.month - min) / span) * (trackW - pad * 2));
  }, [nodes, trackW]);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const ctx = gsap.context(() => {
      if (!isDesktop) {
        // mobile: simple vertical reveals
        gsap.utils.toArray<HTMLElement>(".tl-mobile-node").forEach((el) => {
          gsap.fromTo(
            el,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
          );
        });
        return;
      }

      const track = trackRef.current;
      const pin = pinRef.current;
      if (!track || !pin) return;
      const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth);

      // vertical scroll → lateral translation (scrub 1)
      const scrollTween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top 64px",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // rail line draws out with the same scrub
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: pin,
            start: "top 64px",
            end: () => `+=${distance()}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );

      // node light-up when crossing the 60% viewport zone
      nodeRefs.current.forEach((el) => {
        if (!el) return;
        const dot = el.querySelector("[data-dot]");
        const ripple = el.querySelector("[data-ripple]");
        const body = el.querySelector("[data-body]");
        const flash = el.querySelector("[data-flash]");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            containerAnimation: scrollTween,
            start: "left 62%",
            toggleActions: "play none none none",
          },
        });
        if (dot) {
          tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(1.7)" }, 0);
        }
        if (ripple) {
          tl.fromTo(
            ripple,
            { scale: 0.5, opacity: 0.6 },
            { scale: 2.4, opacity: 0, duration: 0.7, ease: "power2.out" },
            0.1,
          );
        }
        if (body) {
          tl.fromTo(
            body,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
            0.15,
          );
        }
        if (flash) {
          tl.fromTo(
            flash,
            { xPercent: -140 },
            { xPercent: 240, duration: 0.6, ease: "power2.inOut" },
            0.2,
          );
        }
      });
    }, pinRef);
    return () => ctx.revert();
  }, [trackW, positions, c.id]);

  return (
    <section className="mx-auto max-w-[1520px] px-5 py-24 md:px-10">
      <SectionHead
        en="MODEL TIMELINE"
        zh="发布编年"
        note={`旗舰模型 · ${c.flagshipModel}`}
        noteEn={`Flagship · ${c.flagshipModel}`}
      />

      {/* ── desktop: pinned horizontal track ── */}
      <div ref={pinRef} className="relative mt-8 hidden overflow-hidden md:block">
        <div ref={trackRef} className="relative h-[460px]" style={{ width: trackW }}>
          {/* rail */}
          <div
            ref={lineRef}
            className="absolute left-0 top-1/2 h-[2px] w-full bg-line"
            aria-hidden
          />
          {nodes.map((n, i) => {
            const above = i % 2 === 0;
            return (
              <div
                key={`${n.entry.date}-${n.entry.model}`}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className="absolute top-1/2"
                style={{ left: positions[i] }}
              >
                {/* dot + ripple */}
                <span className="absolute -left-[7px] -top-[7px] block h-[14px] w-[14px]">
                  <span
                    data-ripple
                    aria-hidden
                    className="absolute inset-0 rounded-full opacity-0"
                    style={{ border: `1px solid ${n.flagship ? "var(--gold)" : hex}` }}
                  />
                  <span
                    data-dot
                    className={clsx(
                      "block h-full w-full",
                      n.flagship ? "rotate-45" : "rounded-full",
                      n.flagship && "animate-ring-breathe",
                    )}
                    style={{
                      backgroundColor: n.flagship ? "var(--gold)" : hex,
                      boxShadow: n.flagship ? "0 0 16px rgba(201,162,75,0.55)" : undefined,
                    }}
                  />
                </span>
                {/* stem */}
                <span
                  aria-hidden
                  className={clsx(
                    "absolute left-0 w-px bg-line",
                    above ? "bottom-[10px] h-10" : "top-[10px] h-10",
                  )}
                />
                {/* body */}
                <div
                  data-body
                  className={clsx(
                    "absolute w-[220px]",
                    above ? "bottom-[52px] left-[-6px]" : "top-[52px] left-[-6px]",
                  )}
                >
                  {n.flagship && (
                    <span className="mb-2 inline-block border border-gold px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] text-gold">
                      FLAGSHIP
                    </span>
                  )}
                  <p className="font-mono text-[12px] tracking-[0.12em] text-mute">{n.entry.date}</p>
                  <p className={clsx("mt-1 font-serifsc text-[18px] font-bold leading-snug", n.flagship ? "text-gold" : "text-bone")}>
                    {n.entry.model}
                  </p>
                  {n.entry.note && (
                    <p className="mt-1.5 text-[13px] leading-[1.7] text-bone-dim">{noteOf(n.entry, lang)}</p>
                  )}
                  {/* gold flash sweep for flagship nodes */}
                  {n.flagship && (
                    <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                      <span
                        data-flash
                        className="absolute inset-y-0 w-1/3"
                        style={{
                          background:
                            "linear-gradient(100deg, transparent 0%, rgba(201,162,75,0.28) 50%, transparent 100%)",
                        }}
                      />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── mobile: vertical rail ── */}
      <div className="relative mt-10 border-l border-line pl-6 md:hidden">
        {nodes.map((n) => (
          <div key={`${n.entry.date}-${n.entry.model}`} className="tl-mobile-node relative pb-8">
            <span
              aria-hidden
              className={clsx(
                "absolute -left-[31px] top-[5px] block h-[10px] w-[10px]",
                n.flagship ? "rotate-45" : "rounded-full",
              )}
              style={{ backgroundColor: n.flagship ? "var(--gold)" : hex }}
            />
            {n.flagship && (
              <span className="mb-1.5 inline-block border border-gold px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] text-gold">
                FLAGSHIP
              </span>
            )}
            <p className="font-mono text-[12px] tracking-[0.12em] text-mute">{n.entry.date}</p>
            <p className={clsx("mt-1 font-serifsc text-[17px] font-bold", n.flagship ? "text-gold" : "text-bone")}>
              {n.entry.model}
            </p>
            {n.entry.note && (
              <p className="mt-1 text-[13px] leading-[1.7] text-bone-dim">{noteOf(n.entry, lang)}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
