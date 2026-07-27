import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Company } from "@/lib/data";
import { fileNo, portrait, hasRealPhoto, campColor } from "@/lib/data";
import InkImage from "@/components/InkImage";
import ScoreBar from "@/components/ScoreBar";
import Stamp from "@/components/Stamp";
import { useLang } from "@/lib/i18n";
import { positioningOf } from "@/lib/data";

interface CompanyCardProps {
  company: Company;
  className?: string;
}

/**
 * 档案卡 · 小卡 (design.md §8.3): 320×420 archive-box card for the
 * bench roster. Hover = lift 6px + 1.5° tilt (spring), camp border,
 * photo develops to color, gold "打开档案 →" bar slides up.
 */
export default function CompanyCard({ company, className }: CompanyCardProps) {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const c = company;
  const hex = campColor(c.camp);

  return (
    <motion.article
      data-cursor="SELECT ▸"
      tabIndex={0}
      role="link"
      aria-label={`${c.name} — ${t("viewAnalysis")}`}
      onClick={() => navigate(`/company/${c.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/company/${c.id}`);
      }}
      whileHover={{ y: -6, rotate: 1.5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={clsx(
        "group relative flex h-[420px] w-full flex-col border border-line bg-ink-2 outline-none",
        "transition-[border-color,box-shadow] duration-300 hover:border-[var(--camp)] focus-visible:border-[var(--camp)]",
        className,
      )}
      style={{ "--camp": hex } as React.CSSProperties}
    >
      {/* header row */}
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="font-mono text-[11px] tracking-[0.16em] text-mute">NO. {fileNo(c)}</span>
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: hex }}
          aria-hidden
        />
      </div>

      {/* portrait */}
      <div className="relative mx-4 mt-3 h-[190px]">
        <InkImage
          src={portrait(c)}
          alt={`${c.leader.name} 肖像`}
          camp={c.camp}
          hoverDevelop
          className="h-full w-full"
          imgClassName="object-top"
        />
        {!hasRealPhoto(c) && (
          <Stamp variant="monogram" static className="absolute -right-1 -top-3 h-10 w-20 opacity-90" />
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <h3 className="font-serifsc text-[20px] font-black leading-tight text-bone">{c.shortName}</h3>
        <p className="mt-0.5 font-grotesk text-[12px] font-medium tracking-[0.08em] text-bone-dim">
          {c.englishName}
        </p>
        <p className="mt-2 font-mono text-[11px] tracking-[0.08em] text-gold">{c.flagshipModel}</p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-[1.7] text-bone-dim">{positioningOf(c, lang)}</p>
        <div className="mt-auto pt-3">
          <ScoreBar score={c.openSourceScore} mini showValue />
        </div>
      </div>

      {/* gold slide-up bar */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gold px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-ink transition-transform duration-300 ease-dossier group-hover:translate-y-0">
        {t("viewAnalysis")}
      </div>
    </motion.article>
  );
}
