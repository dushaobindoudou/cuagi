import { useEffect, useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";
import type { Company } from "@/lib/data";
import { campColor, fileNo, portrait } from "@/lib/data";
import InkImage from "@/components/InkImage";
import { neighbors } from "@/components/detail/helpers";

gsap.registerPlugin(ScrollTrigger);

interface AdjacentNavProps {
  company: Company;
}

/**
 * S7 相邻档案导航 (detail.md §S7): dual full-width cards to the previous /
 * next dossier (full-list cycle). Hover = target-camp border + leader
 * thumbnail slides in from the edge. Entrance = cards approach from both
 * sides (x ±60 → 0). GSAP entrance, CSS hover.
 */
export default function AdjacentNav({ company: c }: AdjacentNavProps) {
  const { prev, next } = neighbors(c);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-adj='prev']",
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 85%", once: true },
        },
      );
      gsap.fromTo(
        "[data-adj='next']",
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 85%", once: true },
        },
      );
    }, rootRef);
    return () => ctx.revert();
  }, [c.id]);

  const card = (target: Company, dir: "prev" | "next") => {
    const hex = campColor(target.camp);
    return (
      <Link
        key={target.id}
        data-adj={dir}
        to={`/company/${target.id}`}
        data-cursor="OPEN ↗"
        className={clsx(
          "group relative flex-1 overflow-hidden border border-line bg-ink-2 px-6 py-8 transition-colors duration-300 hover:bg-ink-3",
          dir === "next" && "text-right",
        )}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = hex)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
          {dir === "prev" ? `← NO. ${fileNo(target)}` : `NO. ${fileNo(target)} →`}
        </p>
        <p className="mt-3 font-serifsc text-[24px] font-black text-bone transition-colors duration-300 group-hover:text-[var(--adj)]"
          style={{ ["--adj" as string]: hex }}
        >
          {target.name}
        </p>
        <p className="mt-1 font-mono text-[12px] tracking-[0.1em] text-bone-dim">
          {target.leader.name} · {target.leader.role}
        </p>
        {/* leader thumbnail slides in on hover */}
        <span
          aria-hidden
          className={clsx(
            "pointer-events-none absolute inset-y-0 w-20 opacity-0 transition-all ease-dossier group-hover:translate-x-0 group-hover:opacity-100 [transition-duration:0.4s]",
            dir === "prev"
              ? "right-0 translate-x-[40px]"
              : "left-0 -translate-x-[40px]",
          )}
        >
          <InkImage
            src={portrait(target)}
            alt=""
            camp={target.camp}
            className="h-full w-full"
            imgClassName="object-top opacity-80"
          />
        </span>
      </Link>
    );
  };

  return (
    <nav
      ref={rootRef}
      aria-label="adjacent companies"
      className="mx-auto flex max-w-[1520px] flex-col gap-4 px-5 pb-24 pt-4 md:flex-row md:px-10"
    >
      {card(prev, "prev")}
      {card(next, "next")}
    </nav>
  );
}
