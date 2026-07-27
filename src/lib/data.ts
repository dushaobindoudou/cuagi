import modelsJson from "@/data/models.json";

/* ── Types ─────────────────────────────────────────────────────────────── */

export interface Quote {
  text: string;
  translation: string;
  source: string;
  url: string;
  date: string;
  textEn?: string;
}

export interface Photo {
  url: string;
  source: string;
  verified: boolean;
}

export interface Leader {
  name: string;
  role: string;
  bio: string;
  bioEn?: string;
  photos: Photo[];
}

export interface Ranking {
  board: string;
  rank: number;
  score: string;
  model: string;
  date: string;
}

export interface TimelineEntry {
  date: string;
  model: string;
  note?: string;
  noteEn?: string;
}

export type Camp = "china" | "us";

export interface Company {
  id: string;
  camp: Camp;
  tier: "core" | "other";
  name: string;
  shortName: string;
  englishName: string;
  founded: string;
  hq: string;
  valuation: string;
  positioning: string;
  positioningEn?: string;
  tags: string[];
  tagsEn?: string[];
  leader: Leader;
  models: string[];
  flagshipModel: string;
  insights: {
    strategy: { summary: string; summaryEn?: string; quotes: Quote[] };
    agi: { summary: string; summaryEn?: string; quotes: Quote[] };
    openSource: { summary: string; summaryEn?: string; quotes: Quote[] };
  };
  openSourceScore: number;
  timeline: TimelineEntry[];
  rankings: Ranking[];
  links: { title: string; titleEn?: string; type: string; url: string; date: string; summary?: string; summaryEn?: string }[];
  notes?: string;
}

interface Dataset {
  updatedAt: string;
  companies: Company[];
}

export const dataset = modelsJson as Dataset;
export const companies: Company[] = dataset.companies;
export const updatedAt = dataset.updatedAt; // 2026-07-23

/* ── Lookups ───────────────────────────────────────────────────────────── */

export const byId = (id: string): Company | undefined =>
  companies.find((c) => c.id === id);

export const coreChina = companies.filter((c) => c.camp === "china" && c.tier === "core");
export const coreUs = companies.filter((c) => c.camp === "us" && c.tier === "core");
export const othersChina = companies.filter((c) => c.camp === "china" && c.tier === "other");
export const othersUs = companies.filter((c) => c.camp === "us" && c.tier === "other");
export const core6 = [...coreChina, ...coreUs];
export const others8 = [...othersChina, ...othersUs];

/** Archive file number, e.g. CN-01 / US-04, ordered as listed in models.json per camp. */
export function fileNo(c: Company): string {
  const campCompanies = companies.filter((x) => x.camp === c.camp);
  const idx = campCompanies.findIndex((x) => x.id === c.id) + 1;
  return `${c.camp === "china" ? "CN" : "US"}-${String(idx).padStart(2, "0")}`;
}

const PLACEHOLDERS: Record<string, string> = {
  stepfun: "/portrait-placeholder-stepfun.png",
  baichuan: "/portrait-placeholder-baichuan.png",
  meta: "/portrait-placeholder-meta.png",
  xai: "/portrait-placeholder-xai.png",
  mistral: "/portrait-placeholder-mistral.png",
};

export const hasRealPhoto = (c: Company): boolean => c.leader.photos.length > 0;
export const placeholderFor = (id: string): string | undefined => PLACEHOLDERS[id];
export const portrait = (c: Company): string =>
  c.leader.photos[0]?.url ?? PLACEHOLDERS[c.id] ?? "";

export const campColor = (camp: Camp): string => (camp === "china" ? "#D63A2C" : "#2E6FE0");

/* ── Language-aware field helpers (zh fallback) ────────────────────────── */

import type { Lang } from "@/lib/i18n";

export const pick = (zh: string | undefined, en: string | undefined, lang: Lang): string =>
  (lang === "en" ? en : zh) ?? zh ?? en ?? "";

export const positioningOf = (c: Company, lang: Lang) => pick(c.positioning, c.positioningEn, lang);
export const tagsOf = (c: Company, lang: Lang) => (lang === "en" && c.tagsEn ? c.tagsEn : c.tags);
export const bioOf = (c: Company, lang: Lang) => pick(c.leader.bio, c.leader.bioEn, lang);
export const summaryOf = (i: { summary: string; summaryEn?: string }, lang: Lang) =>
  pick(i.summary, i.summaryEn, lang);
export const noteOf = (t: TimelineEntry, lang: Lang) => pick(t.note, t.noteEn, lang);
/** Quote display text: zh mode → original text; en mode → English version (original if already EN). */
export const quoteTextOf = (q: Quote, lang: Lang) => pick(q.text, q.textEn, lang);

/* ── Aggregate stats (Hero data strip / footer) ────────────────────────── */

const quoteCount = companies.reduce(
  (n, c) =>
    n +
    c.insights.strategy.quotes.length +
    c.insights.agi.quotes.length +
    c.insights.openSource.quotes.length,
  0,
);
const linkCount = companies.reduce((n, c) => n + c.links.length, 0);

export const stats = {
  companies: companies.length, // 14
  quotes: quoteCount, // 98
  links: linkCount, // 127 links entries + unique quote urls
};

/* ── Spectrum helpers ──────────────────────────────────────────────────── */

/** Interpolate --cn (0) → --gold (5) → --jade (10). */
export function spectrumColor(score: number): string {
  const lerp = (a: number[], b: number[], t: number) =>
    a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const cn = [214, 58, 44];
  const gold = [201, 162, 75];
  const jade = [53, 196, 141];
  const s = Math.max(0, Math.min(10, score));
  const rgb = s <= 5 ? lerp(cn, gold, s / 5) : lerp(gold, jade, (s - 5) / 5);
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

/* ── Arena snapshot columns (home S5) ──────────────────────────────────── */

export interface ArenaRow {
  rank: number;
  model: string;
  company: string;
  companyId: string;
  camp: Camp;
  score: string;
  date: string;
}

export interface ArenaColumn {
  key: string;
  title: string;
  en: string;
  rows: ArenaRow[];
}

function collect(match: (board: string) => boolean): ArenaRow[] {
  const rows: ArenaRow[] = [];
  for (const c of companies) {
    for (const r of c.rankings) {
      if (match(r.board)) {
        rows.push({
          rank: r.rank,
          model: r.model,
          company: c.shortName,
          companyId: c.id,
          camp: c.camp,
          score: r.score,
          date: r.date,
        });
      }
    }
  }
  rows.sort((a, b) => a.rank - b.rank);
  // de-duplicate same company+model, keep best rank
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = `${r.companyId}:${r.model}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export const arenaColumns: ArenaColumn[] = [
  {
    key: "lmarena",
    title: "LMArena 文本榜",
    en: "TEXT ARENA",
    rows: collect((b) => b.startsWith("LMArena 文本榜")).slice(0, 5),
  },
  {
    key: "aa-index",
    title: "Artificial Analysis 智能指数",
    en: "INTELLIGENCE INDEX",
    rows: collect((b) => b.startsWith("Artificial Analysis 智能指数")).slice(0, 5),
  },
  {
    key: "aa-coding",
    title: "AA Coding Agent",
    en: "CODING AGENT",
    rows: collect(
      (b) => b.includes("Coding") || b.includes("Code Arena") || b.includes("SWE-bench"),
    ).slice(0, 5),
  },
];

/* ── Signature quotes (marquee / big cards) ────────────────────────────── */

function findQuote(companyId: string, keyword: string): Quote | undefined {
  const c = byId(companyId);
  if (!c) return undefined;
  const all = [
    ...c.insights.strategy.quotes,
    ...c.insights.agi.quotes,
    ...c.insights.openSource.quotes,
  ];
  return all.find((q) => q.text.includes(keyword) || q.translation.includes(keyword));
}

/** One short signature line per core company (for marquee & big-card hover panel). */
export function signatureQuote(c: Company, lang: Lang = "zh"): string {
  const preferred: Record<string, string> = {
    deepseek: "护城河是短暂的",
    zhipu: "开源和闭源",
    minimax: "第一天就应该开源",
    openai: "wrong side of history",
    anthropic: "geniuses in a datacenter",
    google: "profound",
  };
  const kw = preferred[c.id];
  const q = kw ? findQuote(c.id, kw) : undefined;
  const fallback = c.insights.openSource.quotes[0] ?? c.insights.strategy.quotes[0];
  const picked = q ?? fallback;
  if (!picked) return "";
  const t = quoteTextOf(picked, lang);
  const cut = t.split(/(?<=[。！？.!?])/)[0] ?? t;
  return cut.length > 60 ? `${cut.slice(0, 57)}…` : cut;
}

/* ── Quote wall (home S6) — curated bilingual pairs ────────────────────── */

export interface WallQuote {
  companyId: string;
  camp: Camp;
  zh: string;
  en: string;
  who: string;
  source: string;
  date: string;
  url: string;
}

export const quoteWall: WallQuote[] = [
  {
    companyId: "deepseek",
    camp: "china",
    zh: "在颠覆性的技术面前，闭源形成的护城河是短暂的。",
    en: "In the face of disruptive technology, a closed-source moat is short-lived.",
    who: "梁文锋 · DeepSeek",
    source: "暗涌专访（36氪）",
    date: "2024-07",
    url: findQuote("deepseek", "护城河是短暂的")?.url ?? "",
  },
  {
    companyId: "openai",
    camp: "us",
    zh: "我个人认为我们一直站在历史的错误一边。",
    en: "I personally think we have been on the wrong side of history here.",
    who: "Sam Altman · OpenAI",
    source: "Reddit AMA（TechCrunch报道）",
    date: "2025-01",
    url: findQuote("openai", "wrong side of history")?.url ?? "",
  },
  {
    companyId: "anthropic",
    camp: "us",
    zh: "数据中心里的天才之国。",
    en: "A country of geniuses in a datacenter.",
    who: "Dario Amodei · Anthropic",
    source: "Machines of Loving Grace",
    date: "2024-10",
    url: findQuote("anthropic", "Nobel Prize")?.url ?? "",
  },
  {
    companyId: "minimax",
    camp: "china",
    zh: "如果重新选，第一天就应该开源。",
    en: "If I could choose again, I would open-source from day one.",
    who: "闫俊杰 · MiniMax",
    source: "晚点对话",
    date: "2025-01",
    url: findQuote("minimax", "第一天就应该开源")?.url ?? "",
  },
  {
    companyId: "google",
    camp: "us",
    zh: "比火与电更深远的技术。",
    en: "AI is more profound than fire or electricity.",
    who: "Sundar Pichai · Google",
    source: "Lex Fridman #471",
    date: "2025-06",
    url: findQuote("google", "profound")?.url ?? "",
  },
];
