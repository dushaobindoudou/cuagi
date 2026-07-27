import { companies, type Camp, type Company, type Quote } from "@/lib/data";

/* ── 金句档案库数据聚合（quotes.md：聚合 14 家 × 3 议题 ≈ 98 条）────────── */

export type TopicKey = "strategy" | "agi" | "openSource";
export type TopicFilter = TopicKey | "all";
export type CampFilter = Camp | "all";
export type SortKey = "dateDesc" | "dateAsc" | "company";

export interface VaultEntry {
  key: string;
  companyId: string;
  camp: Camp;
  shortName: string;
  leaderName: string;
  topic: TopicKey;
  text: string;
  textEn?: string;
  translation: string;
  source: string;
  url: string;
  date: string;
  english: boolean;
}

const TOPIC_ORDER: TopicKey[] = ["strategy", "agi", "openSource"];

function isEnglish(text: string): boolean {
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  const cjk = (text.match(/[一-鿿]/g) ?? []).length;
  return latin > cjk;
}

/** All quotes in models.json order (camp-grouped, company order preserved). */
export const vault: VaultEntry[] = companies.flatMap((c: Company) =>
  TOPIC_ORDER.flatMap((topic) =>
    c.insights[topic].quotes.map((q: Quote, i: number) => ({
      key: `${c.id}-${topic}-${i}`,
      companyId: c.id,
      camp: c.camp,
      shortName: c.shortName,
      leaderName: c.leader.name,
      topic,
      text: q.text,
      translation: q.translation,
      source: q.source,
      url: q.url,
      date: q.date,
      english: isEnglish(q.text),
    })),
  ),
);

/** 议题色规范（quotes.md §素材）：战略=骨白 / AGI=金 / 开源=jade */
export const TOPIC_META: Record<TopicKey, { zh: string; en: string; color: string }> = {
  strategy: { zh: "战略", en: "STRATEGY", color: "#E9E4D6" },
  agi: { zh: "AGI", en: "AGI", color: "#C9A24B" },
  openSource: { zh: "开源", en: "OPEN SOURCE", color: "#35C48D" },
};

/* month-only dates ("2024-07") get a mid-month day for ordering */
const dateKey = (d: string): string => (d.length === 7 ? `${d}-15` : d);

export function filterVault(
  topic: TopicFilter,
  camp: CampFilter,
  companyIds: string[],
): VaultEntry[] {
  return vault.filter(
    (e) =>
      (topic === "all" || e.topic === topic) &&
      (camp === "all" || e.camp === camp) &&
      (companyIds.length === 0 || companyIds.includes(e.companyId)),
  );
}

export function sortVault(entries: VaultEntry[], sort: SortKey): VaultEntry[] {
  if (sort === "company") return entries; // vault order = models.json order (camp-grouped)
  const arr = [...entries];
  arr.sort((a, b) =>
    sort === "dateDesc"
      ? dateKey(b.date).localeCompare(dateKey(a.date))
      : dateKey(a.date).localeCompare(dateKey(b.date)),
  );
  return arr;
}

/* ── URL 参数预筛（quotes.md：?topic=openSource ?company=deepseek ?camp=china） */

export function parseTopicParam(v: string | null): TopicFilter {
  return v === "strategy" || v === "agi" || v === "openSource" ? v : "all";
}

export function parseCampParam(v: string | null): CampFilter {
  return v === "china" || v === "us" ? v : "all";
}

export function parseCompanyParam(v: string | null): string[] {
  if (!v) return [];
  const ids = new Set(companies.map((c) => c.id));
  return v
    .split(",")
    .map((s) => s.trim())
    .filter((s) => ids.has(s));
}

export const SORT_LABEL: Record<SortKey, Record<"zh" | "en", string>> = {
  dateDesc: { zh: "日期 ↓", en: "DATE ↓" },
  dateAsc: { zh: "日期 ↑", en: "DATE ↑" },
  company: { zh: "按公司", en: "BY COMPANY" },
};

export const SORT_CYCLE: Record<SortKey, SortKey> = {
  dateDesc: "dateAsc",
  dateAsc: "company",
  company: "dateDesc",
};
