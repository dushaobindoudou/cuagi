import type { Company, TimelineEntry } from "@/lib/data";
import { companies } from "@/lib/data";

/* ── Local helpers for the company dossier page (detail.md) ─────────────── */

/** Global archive order: CN-01…CN-08 then US-01…US-06 (full-list cycle). */
export const dossierOrder: Company[] = [
  ...companies.filter((c) => c.camp === "china"),
  ...companies.filter((c) => c.camp === "us"),
];

export function neighbors(c: Company): { prev: Company; next: Company } {
  const i = dossierOrder.findIndex((x) => x.id === c.id);
  const n = dossierOrder.length;
  return {
    prev: dossierOrder[(i - 1 + n) % n],
    next: dossierOrder[(i + 1) % n],
  };
}

/** 立场判定词 mapping (detail.md §S3). */
export function stanceLabel(score: number, lang: "zh" | "en" = "zh"): string {
  if (lang === "en") {
    if (score <= 2) return "Firmly Closed";
    if (score <= 4) return "Mostly Closed";
    if (score <= 6) return "On the Fence";
    if (score <= 8) return "Mostly Open";
    return "Open-Source Flagbearer";
  }
  if (score <= 2) return "坚定闭源";
  if (score <= 4) return "闭源为主";
  if (score <= 6) return "摇摆中间";
  if (score <= 8) return "开源为主";
  return "开源旗手";
}

/**
 * Flagship matching for timeline nodes. The flagshipModel string does not
 * always literally appear in timeline entries, so we score token overlap
 * (alphanumeric tokens of length ≥ 2) and flag the best-matching entry/ies.
 * Fallback: the latest entry (unreleased flagship, e.g. Qwen3.7-Max).
 */
export function flagshipIndexes(c: Company): Set<number> {
  const tokens = Array.from(
    new Set(
      c.flagshipModel
        .split(/[\s/（）()]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2 && !/延期|待发|规划/.test(t)),
    ),
  );
  let best = 0;
  const scores = c.timeline.map((e) => {
    const compact = e.model.replace(/\s+/g, "");
    const s = tokens.reduce((acc, t) => acc + (compact.includes(t) ? 1 : 0), 0);
    if (s > best) best = s;
    return s;
  });
  const set = new Set<number>();
  if (best > 0) {
    scores.forEach((s, i) => {
      if (s === best) set.add(i);
    });
  } else if (c.timeline.length > 0) {
    set.add(c.timeline.length - 1);
  }
  return set;
}

/** Parse a timeline date ("2024", "2024-03", "2025-04-29", "规划中") to months. */
export function parseMonth(date: string): number | null {
  const m = date.match(/^(\d{4})(?:-(\d{2}))?/);
  if (!m) return null;
  return Number(m[1]) * 12 + (m[2] ? Number(m[2]) : 6);
}

export interface TimelineNode {
  entry: TimelineEntry;
  month: number; // parsed; unresolved ("规划中") pushed past the end
  flagship: boolean;
}

export function timelineNodes(c: Company): TimelineNode[] {
  const flags = flagshipIndexes(c);
  const parsed = c.timeline.map((entry, i) => ({
    entry,
    month: parseMonth(entry.date),
    flagship: flags.has(i),
  }));
  const dated = parsed.filter((p) => p.month !== null).map((p) => p.month as number);
  const max = dated.length ? Math.max(...dated) : 0;
  return parsed
    .map((p) => ({ entry: p.entry, month: p.month ?? max + 8, flagship: p.flagship }))
    .sort((a, b) => a.month - b.month);
}

/* ── Archive link type metadata (detail.md §S6) ─────────────────────────── */

export interface LinkTypeMeta {
  zh: string;
  abbr: string;
}

export const LINK_TYPE_META: Record<string, LinkTypeMeta> = {
  interview: { zh: "采访", abbr: "INT" },
  article: { zh: "文章", abbr: "ART" },
  blog: { zh: "博客", abbr: "BLG" },
  video: { zh: "视频", abbr: "VID" },
  paper: { zh: "论文", abbr: "PPR" },
};

export const LINK_TYPE_ORDER = ["interview", "article", "blog", "video", "paper"];

export function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
