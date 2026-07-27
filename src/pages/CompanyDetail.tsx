import { Link, useParams } from "react-router";
import { byId, fileNo } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import DossierPoster from "@/components/detail/DossierPoster";
import StatementsTabs from "@/components/detail/StatementsTabs";
import ScoreDial from "@/components/detail/ScoreDial";
import ModelTimeline from "@/components/detail/ModelTimeline";
import RankingsTable from "@/components/detail/RankingsTable";
import ArchiveLinks from "@/components/detail/ArchiveLinks";
import AdjacentNav from "@/components/detail/AdjacentNav";

/**
 * 公司档案详情页 `/company/:id` — 14 家共用模板 (detail.md).
 * S1 poster → S2 statements → S3 score dial → S4 timeline → S5 rankings →
 * S6 archive → S7 adjacent nav. `key={company.id}` forces a full remount
 * (fresh GSAP contexts / entrance animations) on prev/next navigation.
 */
export default function CompanyDetail() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const company = id ? byId(id) : undefined;

  if (!company) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[1520px] flex-col items-start justify-center px-5 py-24 md:px-10">
        <p className="font-mono text-[11px] tracking-[0.3em] text-mute">NO. —</p>
        <h1 className="mt-4 font-serifsc text-[40px] font-black text-bone">
          {lang === "zh" ? "未找到该公司" : "Company not found"}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.85] text-bone-dim">
          {lang === "zh"
            ? `编号「${id}」不在收录范围内（共 14 家）。`
            : `"${id}" is not among the 14 companies covered.`}
        </p>
        <Link
          to="/"
          data-cursor="OPEN ↗"
          className="mt-8 font-mono text-[12px] tracking-[0.16em] text-bone-dim transition-colors hover:text-gold"
        >
          ← {t("backHome")}
        </Link>
      </div>
    );
  }

  return (
    <article key={`${company.id}-${lang}`} aria-label={`${company.name} ${fileNo(company)}`}>
      <DossierPoster company={company} />
      <StatementsTabs company={company} />
      <ScoreDial company={company} />
      <ModelTimeline company={company} />
      <RankingsTable company={company} />
      <ArchiveLinks company={company} />
      <AdjacentNav company={company} />
    </article>
  );
}
