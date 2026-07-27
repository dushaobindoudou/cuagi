import PageHeader from "@/components/intel/PageHeader";
import Podium from "@/components/intel/Podium";
import RankingTables from "@/components/intel/RankingTables";
import MasterTimeline from "@/components/intel/MasterTimeline";
import ArenaNotes from "@/components/intel/ArenaNotes";
import { updatedAt } from "@/lib/data";

/**
 * /arena — 竞技场 (arena.md): leaderboard snapshots × master model timeline.
 * S1 header (+data stamp) · S2 podium · S3 dual ranking tables ·
 * S4 master timeline · S5 notes. Footer comes from Layout.
 */
export default function Arena() {
  return (
    <>
      <PageHeader
        title="排行榜"
        en="RANKINGS"
        subtitle={`LMArena 用户盲测 Elo · Artificial Analysis 智能指数 · 均为动态快照，日期见各行 · 数据截至 ${updatedAt}`}
        subtitleEn={`LMArena human-vote Elo · Artificial Analysis intelligence index · rolling snapshots, date per row · data as of ${updatedAt}`}
      />
      <Podium />
      <RankingTables />
      <MasterTimeline />
      <ArenaNotes />
    </>
  );
}
