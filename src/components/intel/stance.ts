/** 立场判定词映射 (spectrum.md 素材引用 / detail S3 一致) */
export function stanceWord(score: number, lang: "zh" | "en" = "zh"): string {
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
