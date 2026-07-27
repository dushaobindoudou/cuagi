import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Company } from "@/lib/data";
import { campColor, fileNo, hasRealPhoto, portrait } from "@/lib/data";
import InkImage from "@/components/InkImage";
import ScoreBar from "@/components/ScoreBar";
import Stamp from "@/components/Stamp";
import ScanlineCanvas from "@/components/detail/ScanlineCanvas";
import { neighbors } from "@/components/detail/helpers";
import { useLang } from "@/lib/i18n";
import { bioOf, tagsOf } from "@/lib/data";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface DossierPosterProps {
  company: Company;
}

/**
 * S1 页眉海报 (detail.md §S1): 92dvh dossier poster — W4 scanline canvas +
 * dossier texture background, leader portrait (W2 ink treatment, hover
 * develops to color) on the left, archive head / field table on the right.
 */
export default function DossierPoster({ company: c }: DossierPosterProps) {
  const hex = campColor(c.camp);
  const { prev, next } = neighbors(c);
  const [bioOpen, setBioOpen] = useState(false);
  const { lang, t } = useLang();

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "成立 FOUNDED", value: c.founded },
    { label: "总部 HQ", value: c.hq },
    { label: "估值 VALUATION", value: c.valuation },
    { label: "旗舰模型 FLAGSHIP", value: <span className="text-gold">{c.flagshipModel}</span> },
    {
      label: "开源立场 OPEN SOURCE",
      value: <ScoreBar score={c.openSourceScore} showValue />,
    },
  ];

  return (
    <section className="relative flex min-h-[92dvh] items-center overflow-hidden border-b border-line">
      {/* W4 scanline canvas + dossier texture backdrop */}
      <img
        src="/dossier-texture.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
      />
      <ScanlineCanvas />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(11,12,14,0.25) 0%, rgba(11,12,14,0.72) 78%, var(--ink) 100%)`,
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1520px] gap-10 px-5 pb-16 pt-12 md:grid-cols-12 md:gap-8 md:px-10 lg:gap-12">
        {/* ── left: leader portrait (5 cols) ── */}
        <motion.div
          initial={{ clipPath: "inset(8%)", opacity: 0.6 }}
          animate={{ clipPath: "inset(0%)", opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="md:col-span-5"
        >
          <div className="group relative border border-line bg-ink-2">
            <InkImage
              src={portrait(c)}
              alt={`${c.leader.name} 肖像`}
              camp={c.camp}
              hoverDevelop
              className="aspect-[4/5] w-full"
              imgClassName="object-top"
            />
            <Stamp
              variant={hasRealPhoto(c) ? "verified" : "monogram"}
              className="absolute -left-3 -top-4 h-12 w-24 opacity-95 md:h-14 md:w-28"
            />
          </div>
          <p className="mt-3 border-l-2 pl-3 font-mono text-[11px] uppercase tracking-[0.16em] text-mute" style={{ borderColor: hex }}>
            SUBJECT · {c.leader.name} · {c.leader.role}
          </p>
        </motion.div>

        {/* ── right: archive head (7 cols) ── */}
        <div className="flex flex-col md:col-span-7">
          {/* top-right nav row */}
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.16em]">
            <Link to="/" data-cursor="OPEN ↗" className="text-bone-dim transition-colors hover:text-gold">
              ← {t("backHome")}
            </Link>
            <span className="flex items-center gap-4">
              <Link
                to={`/company/${prev.id}`}
                data-cursor="OPEN ↗"
                className="text-mute transition-colors hover:text-bone"
              >
                {t("prevCompany")} ← {fileNo(prev)}
              </Link>
              <span className="text-line" aria-hidden>/</span>
              <Link
                to={`/company/${next.id}`}
                data-cursor="OPEN ↗"
                className="text-mute transition-colors hover:text-bone"
              >
                {t("nextCompany")} → {fileNo(next)}
              </Link>
            </span>
          </div>

          {/* eyebrow */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 font-mono text-[12px] uppercase tracking-[0.2em]"
            style={{ color: hex }}
          >
            NO. {fileNo(c)} · {c.camp === "china" ? `SIDE A · ${t("sideA")}` : `SIDE B · ${t("sideB")}`}
          </motion.p>

          {/* company names */}
          <div className="relative mt-4">
            <h1 className="font-serifsc text-[clamp(44px,6vw,84px)] font-black leading-[1.05] text-bone">
              {Array.from(c.name).map((ch, i) => (
                <motion.span
                  key={`${c.id}-${i}`}
                  className="inline-block"
                  initial={{ y: 26, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.04, ease: EASE }}
                >
                  {ch === " " ? " " : ch}
                </motion.span>
              ))}
            </h1>
            <motion.p
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-outline-bone pointer-events-none -mt-[0.32em] select-none whitespace-nowrap font-anton text-[clamp(28px,4vw,56px)] uppercase leading-none tracking-[0.01em] opacity-60"
            >
              {c.englishName}
            </motion.p>
          </div>

          {/* leader */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
            className="mt-6"
          >
            <p className="font-serifsc text-[24px] font-bold text-bone">
              {c.leader.name}
              <span className="ml-3 align-middle font-mono text-[12px] font-normal uppercase tracking-[0.16em] text-mute">
                {c.leader.role}
              </span>
            </p>
            <p
              className={clsx(
                "mt-3 max-w-2xl text-[15px] leading-[1.9] text-bone-dim",
                !bioOpen && "line-clamp-5",
              )}
            >
              {bioOf(c, lang)}
            </p>
            <button
              type="button"
              data-cursor="OPEN ↗"
              onClick={() => setBioOpen((v) => !v)}
              className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-gold"
              style={{ color: hex }}
            >
              {bioOpen ? "收起 ↑" : "展开全文 ↓"}
            </button>
          </motion.div>

          {/* field table */}
          <motion.dl
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06, delayChildren: 0.55 } },
            }}
            className="mt-8 border-t border-line"
          >
            {fields.map((f) => (
              <motion.div
                key={f.label}
                variants={{
                  hidden: { x: 24, opacity: 0 },
                  show: { x: 0, opacity: 1, transition: { duration: 0.5, ease: EASE } },
                }}
                className="flex items-center justify-between gap-6 border-b border-line py-3"
              >
                <dt className="shrink-0 font-mono text-[12px] uppercase tracking-[0.16em] text-mute">
                  {f.label}
                </dt>
                <dd className="text-right font-mono text-[13px] tracking-[0.04em] text-bone">
                  {f.value}
                </dd>
              </motion.div>
            ))}
          </motion.dl>

          {/* tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {tagsOf(c, lang).map((t) => (
              <span
                key={t}
                className="border border-line px-2.5 py-1 font-mono text-[11px] tracking-[0.12em] text-bone-dim transition-colors duration-300 hover:text-bone"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${hex}1A`)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
