import type { ArenaRow } from "@/lib/data";
import { companies } from "@/lib/data";

/**
 * Arena ranking aggregations (arena.md S2/S3). Every row keeps its own
 * snapshot date — all boards are dynamic snapshots.
 */

export interface OpenLightRow extends ArenaRow {
  board: string;
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

/** LMArena text board incl. mirrors, excluding the historical-peak entry. */
export const lmArenaRows: ArenaRow[] = collect(
  (b) => b.startsWith("LMArena 文本榜") && !b.includes("历史峰值"),
);

/** Artificial Analysis intelligence index (incl. v4.x revisions). */
export const aaIndexRows: ArenaRow[] = collect((b) =>
  b.startsWith("Artificial Analysis 智能指数"),
);

/** Open-weights highlights: entries annotated with an open-source #1 note. */
export const openLightRows: OpenLightRow[] = companies
  .flatMap((c) =>
    c.rankings
      .filter((r) => r.score.includes("开源第1") || r.score.includes("开源第一"))
      .map((r) => ({
        rank: r.rank,
        model: r.model,
        company: c.shortName,
        companyId: c.id,
        camp: c.camp,
        score: r.score,
        date: r.date,
        board: r.board,
      })),
  )
  .sort((a, b) => a.rank - b.rank);

/** a score string flags an open-weights note, e.g. 「开源第1」「全球开源第一」 */
export const hasOpenNote = (score: string): boolean => score.includes("开源");
