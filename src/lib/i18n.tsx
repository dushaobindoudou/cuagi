import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "zh" | "en";

/** UI string dictionary: [zh, en] */
export const S = {
  brandEn: ["ROAD TO AGI", "ROAD TO AGI"],
  brandZh: ["通往 AGI", "通往 AGI · ROAD TO AGI"],
  navHome: ["全景", "OVERVIEW"],
  navSpectrum: ["开源立场", "OPEN↔CLOSED"],
  navArena: ["排行榜", "RANKINGS"],
  navQuotes: ["原声", "VOICES"],
  navAbout: ["关于", "ABOUT"],
  china: ["中国", "CHINA"],
  us: ["美国", "US"],
  heroEyebrow: ["大模型公司领袖语录分析 · VOL.2026.07", "LLM LEADERS IN THEIR OWN WORDS · VOL.2026.07"],
  heroTitle: ["谁将最先实现 AGI？", "WHO WILL REACH AGI FIRST?"],
  scroll: ["SCROLL", "SCROLL"],
  sideA: ["中国阵营", "CHINA"],
  sideB: ["美国阵营", "UNITED STATES"],
  stageHint: ["← → 移动光标 · TAB 切换阵营 · ENTER 查看语录分析 · ESC 取消", "← → MOVE · TAB SWITCH SIDE · ENTER VIEW ANALYSIS · ESC CANCEL"],
  viewAnalysis: ["查看语录分析 →", "VIEW ANALYSIS →"],
  enterCard: ["查看语录分析 ENTER ▸", "VIEW ANALYSIS ENTER ▸"],
  othersTitle: ["更多阵营成员", "MORE CONTENDERS"],
  othersSub: ["其余八家公司掌舵者的语录与战略研判", "Quotes and strategy reads on the other eight leaders"],
  spectrumTitle: ["开源立场", "OPEN ↔ CLOSED"],
  spectrumSub: ["开源与闭源之间，14 家公司各自站在哪里？", "Where do 14 companies stand between open and closed?"],
  enterSpectrum: ["进入立场光谱 →", "ENTER THE SPECTRUM →"],
  arenaTitle: ["排行榜", "RANKINGS"],
  arenaSub: ["两大榜单快照对照 · 注明快照日期", "Two leaderboards side by side · snapshot dates noted"],
  enterArena: ["查看完整榜单 →", "FULL RANKINGS →"],
  quoteWallTitle: ["观点交锋", "CLASH OF VIEWS"],
  quoteWallSub: ["同一议题，两种答案", "Same questions, opposite answers"],
  vaultTitle: ["原声", "IN THEIR WORDS"],
  overview: ["公司概览", "OVERVIEW"],
  tabStrategy: ["战略方向", "STRATEGY"],
  tabAgi: ["AGI 观", "ON AGI"],
  tabOpen: ["开源立场", "OPEN SOURCE"],
  openScore: ["开源立场评分", "OPENNESS SCORE"],
  timelineTitle: ["模型时间线", "MODEL TIMELINE"],
  rankingsTitle: ["榜单名次", "LEADERBOARD"],
  sourcesTitle: ["公开语录与资料", "SOURCES"],
  nextCompany: ["下一家公司", "NEXT"],
  prevCompany: ["上一家公司", "PREV"],
  backHome: ["返回全景", "BACK TO OVERVIEW"],
  all: ["全部", "ALL"],
  empty: ["暂无数据", "NO DATA"],
  footerIndex: ["索引", "INDEX"],
  footerData: ["数据", "DATA"],
  copyright: ["© 2026 通往 AGI · ROAD TO AGI", "© 2026 ROAD TO AGI · 通往 AGI"],
  vol: ["LLM LEADERS ARCHIVE · VOL.2026.07", "LLM LEADERS ARCHIVE · VOL.2026.07"],
  boot1: ["LOADING ROAD TO AGI…", "LOADING ROAD TO AGI…"],
  boot2: ["DECRYPTING 14 LEADERS…", "DECRYPTING 14 LEADERS…"],
  boot3: ["READY", "READY"],
  aboutTitle: ["关于", "ABOUT"],
} as const;

export type Key = keyof typeof S;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
}

const Ctx = createContext<LangCtx>({ lang: "zh", setLang: () => {}, t: (k) => S[k][0] });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("rta-lang") as Lang) || "zh";
    } catch {
      return "zh";
    }
  });
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("rta-lang", l);
    } catch {
      /* noop */
    }
  };
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);
  const t = (k: Key) => S[k][lang === "zh" ? 0 : 1];
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
