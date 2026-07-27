import { motion } from "framer-motion";
import FlipTitle from "@/components/archive/FlipTitle";
import CountUp from "@/components/archive/CountUp";
import { stats, updatedAt } from "@/lib/data";
import { useLang } from "@/lib/i18n";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const RULES: { no: string; title: string; titleEn: string; body: string; bodyEn: string }[] = [
  {
    no: "01",
    title: "言论优先原文",
    titleEn: "Verbatim first",
    body: "所有引语保留原始措辞；英文引语附中文翻译，翻译仅供参考。",
    bodyEn: "Every quote keeps its original wording; translations are provided for reference only.",
  },
  {
    no: "02",
    title: "一切皆可溯源",
    titleEn: "Everything is traceable",
    body: "每条引语注明来源、日期与原文链接；网传语录未经证实的（如「封闭筑墙开源建桥」）不予收录。",
    bodyEn: "Each quote carries its source, date and link. Unverified internet attributions (e.g. the viral 'walls and bridges' line) are excluded.",
  },
  {
    no: "03",
    title: "AI 总结有边界",
    titleEn: "AI reads have limits",
    body: "三维总结由 AI 基于在册引语生成，标注 AI ANALYSIS，不构成对该公司的完整评价。",
    bodyEn: "The three-dimension reads are AI-generated from the quotes on record, marked AI ANALYSIS — not a complete assessment of any company.",
  },
  {
    no: "04",
    title: "榜单是快照",
    titleEn: "Leaderboards are snapshots",
    body: "榜单名次随时间变化，本站展示采集时刻的快照并逐条注明日期；数据截至 2026-07-23。",
    bodyEn: "Ranks change over time; we show capture-time snapshots with a date on every row. Data as of 2026-07-23.",
  },
  {
    no: "05",
    title: "评分明示口径",
    titleEn: "Scores state their method",
    body: "开源立场评分 0–10 综合公开言论与实际开源行为（权重开放程度、协议宽松度、持续性），为主观标尺，口径见开源立场页。",
    bodyEn: "The 0–10 openness score weighs public statements against real open-source behavior (weight availability, license permissiveness, consistency). It is a subjective scale — see the spectrum page.",
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
  transition: { duration: 0.8, ease: EASE, delay },
});

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.3em] text-mute">{children}</p>
  );
}

/**
 * 关于 `/about`：本站定位、方法论守则、来源与版权、版本信息。
 */
export default function About() {
  const { lang } = useLang();
  const isZh = lang === "zh";
  return (
    <div className="relative">
      {/* S1 页眉 */}
      <section className="mx-auto max-w-[1520px] px-5 pb-14 pt-16 md:px-10 md:pt-20">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-mute">
          {isZh ? "METHODOLOGY · 方法论" : "METHODOLOGY & COLOPHON"}
        </p>
        <FlipTitle zh="关于" en="ABOUT" />
      </section>

      {/* S2 这是一个什么网站 */}
      <section className="mx-auto grid max-w-[1520px] gap-12 px-5 pb-24 md:grid-cols-12 md:px-10">
        <motion.div className="md:col-span-5" {...fadeUp(0)}>
          <SectionEyebrow>{isZh ? "01 · 这是一个什么网站" : "01 · WHAT THIS IS"}</SectionEyebrow>
          <p className="text-[17px] leading-[2.1] text-bone first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:font-serifsc first-letter:text-[64px] first-letter:font-black first-letter:leading-[0.8] first-letter:text-gold">
            {isZh
              ? "通往 AGI 收集主流大模型公司管理层的公开言论，用 AI 归纳每家公司在三个核心议题上的立场——公司的战略方向、他们认为最重要的事、如何理解 AGI、如何看待开源；引语全部保留原文、出处、日期与链接。"
              : "Road to AGI collects public statements by the leaders of frontier model companies, and uses AI to distill each company's position on the questions that matter — its strategy, what it believes counts most, how it understands AGI, and how it sees open source. Every quote keeps its original text, source, date and link."}
          </p>
          <p className="mt-6 text-[17px] leading-[2.1] text-bone-dim">
            {isZh
              ? "我们不做立场裁决，只做记录、翻译与分析——判断留给读者。谁将最先实现 AGI？答案藏在他们自己说过的话里。"
              : "We don't judge stances — we record, translate and analyze, and leave the verdict to you. Who will reach AGI first? The answers hide in their own words."}
          </p>
        </motion.div>
        <div className="grid content-start gap-4 md:col-span-7 md:grid-cols-3">
          {[
            {
              n: stats.companies,
              label: isZh ? "家收录公司" : "companies",
              note: isZh ? "核心 6 + 其他 8 · 中美双阵营" : "6 core + 8 others · China vs US",
            },
            {
              n: stats.quotes,
              label: isZh ? "条带出处引语" : "sourced quotes",
              note: isZh ? "战略 / AGI / 开源三维度" : "strategy / AGI / open source",
            },
            {
              n: stats.links,
              label: isZh ? "条资料链接" : "source links",
              note: isZh ? "采访 / 文章 / 博客 / 视频 / 论文" : "interviews / essays / blogs / videos / papers",
            },
          ].map((d, i) => (
            <motion.div key={d.label} className="border border-line bg-ink-2 p-6" {...fadeUp(0.12 * i)}>
              <CountUp
                to={d.n}
                duration={1.2}
                delay={0.2 + 0.12 * i}
                className="font-anton text-[56px] leading-none text-gold"
              />
              <p className="mt-4 font-serifsc text-[16px] font-bold text-bone">{d.label}</p>
              <p className="mt-2 font-mono text-[11px] leading-relaxed tracking-[0.08em] text-mute">
                {d.note}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* S3 方法论 */}
      <section className="border-t border-line bg-ink-2/40">
        <div className="mx-auto max-w-[1520px] px-5 py-24 md:px-10">
          <SectionEyebrow>{isZh ? "02 · 方法论" : "02 · METHODOLOGY"}</SectionEyebrow>
          <ol>
            {RULES.map((r, i) => (
              <motion.li
                key={r.no}
                className="flex flex-col gap-4 border-b border-line py-8 first:border-t sm:flex-row sm:items-baseline sm:gap-10"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-18% 0px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
              >
                <motion.span
                  aria-hidden
                  className="shrink-0 font-anton text-[48px] leading-none"
                  initial={{ color: "#5C5F68" }}
                  whileInView={{ color: "#C9A24B" }}
                  viewport={{ once: true, margin: "-18% 0px" }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                >
                  {r.no}
                </motion.span>
                <div>
                  <h3 className="font-serifsc text-[22px] font-black text-bone">
                    {isZh ? r.title : r.titleEn}
                  </h3>
                  <p className="mt-2 max-w-3xl text-[15px] leading-[1.85] text-bone-dim">
                    {isZh ? r.body : r.bodyEn}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* S4 来源与版权 */}
      <section className="mx-auto max-w-[1520px] px-5 py-24 md:px-10">
        <SectionEyebrow>{isZh ? "03 · 来源与版权" : "03 · SOURCES & CREDITS"}</SectionEyebrow>
        <div className="grid gap-10 md:grid-cols-2">
          <motion.div className="border border-line bg-ink-2 p-8" {...fadeUp(0)}>
            <h3 className="font-serifsc text-[20px] font-black text-bone">
              {isZh ? "数据来源" : "Data sources"}
            </h3>
            <ul className="mt-5 space-y-4 text-[15px] leading-[1.85] text-bone-dim">
              <li>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
                  {isZh ? "榜单 · " : "BOARDS · "}
                </span>
                {isZh
                  ? "LMArena、Artificial Analysis 公开榜单快照；名次以 "
                  : "Public snapshots of LMArena and Artificial Analysis; live ranks at "}
                <a
                  href="https://lmarena.ai"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="OPEN ↗"
                  className="text-bone underline decoration-line underline-offset-4 transition-colors hover:text-gold hover:decoration-gold"
                >
                  lmarena.ai ↗
                </a>{" "}
                {isZh ? "与 " : "and "}
                <a
                  href="https://artificialanalysis.ai"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="OPEN ↗"
                  className="text-bone underline decoration-line underline-offset-4 transition-colors hover:text-gold hover:decoration-gold"
                >
                  artificialanalysis.ai ↗
                </a>
                {isZh ? " 实时页面为准。" : "."}
              </li>
              <li>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
                  {isZh ? "专访与报道 · " : "INTERVIEWS · "}
                </span>
                {isZh
                  ? "36氪暗涌、财新、晚点、TechCrunch、Reddit AMA 等。"
                  : "Waves/36Kr, Caixin, LatePost, TechCrunch, Reddit AMA, podcasts and more."}
              </li>
              <li>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
                  {isZh ? "官方材料 · " : "OFFICIAL · "}
                </span>
                {isZh
                  ? "DeepSeek 官方文档、Nature 论文、各家官方博客、公告与技术报告。"
                  : "Official docs, the Nature paper, company blogs, announcements and technical reports."}
              </li>
            </ul>
            <p className="mt-5 font-mono text-[11px] leading-relaxed tracking-[0.08em] text-mute">
              {isZh
                ? `全部资料链接在公司详情页逐条列出，共 ${stats.links} 条。`
                : `All ${stats.links} source links are listed on each company page.`}
            </p>
          </motion.div>

          <motion.div className="border border-line bg-ink-2 p-8" {...fadeUp(0.15)}>
            <h3 className="font-serifsc text-[20px] font-black text-bone">
              {isZh ? "照片版权" : "Photo credits"}
            </h3>
            <ul className="mt-5 space-y-4 text-[15px] leading-[1.85] text-bone-dim">
              <li>
                {isZh ? (
                  <>
                    领袖照片来自公开授权渠道（Wikimedia Commons CC BY / CC BY-SA、官方媒体图），
                    <span className="text-bone">版权归原出处所有</span>，页内注明来源。
                  </>
                ) : (
                  <>
                    Portraits come from openly licensed sources (Wikimedia Commons CC BY / CC BY-SA,
                    official media). <span className="text-bone">Copyright stays with the original owners</span>;
                    sources are noted in-line.
                  </>
                )}
              </li>
              <li>
                {isZh
                  ? "无已验证照片的公司使用风格化字母肖像代替；本站不使用未授权照片。"
                  : "Companies without a verifiable photo use stylized monogram portraits; we use no unauthorized photos."}
              </li>
              <li>
                {isZh ? (
                  <>
                    三维立场总结由 AI 基于在册引语生成，<span className="text-bone">仅供研究参考</span>
                    ，不构成对任何公司的完整评价或投资建议。
                  </>
                ) : (
                  <>
                    The three-dimension reads are AI-generated from the quotes on record,{" "}
                    <span className="text-bone">for research reference only</span> — not a complete
                    assessment of, or investment advice on, any company.
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.p
          className="mt-10 font-mono text-[12px] leading-relaxed tracking-[0.08em] text-mute"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {isZh
            ? `本站为研究性非商业项目，与所列公司无任何隶属关系；公司名、模型名商标归各自所有者。数据截至 ${updatedAt}。`
            : `A non-commercial research project, unaffiliated with any listed company; company and model names are trademarks of their owners. Data as of ${updatedAt}.`}
        </motion.p>
      </section>

      {/* S5 版本带 */}
      <section className="mx-auto max-w-[1520px] px-5 pb-24 md:px-10">
        <div className="border border-line bg-ink-2 p-8">
          {[
            { k: "VERSION", v: "2026.07" },
            { k: isZh ? "数据截至" : "DATA AS OF", v: updatedAt },
            { k: isZh ? "收录公司" : "COMPANIES", v: String(stats.companies) },
            { k: isZh ? "下次复核" : "NEXT REVIEW", v: "——" },
          ].map((r, i) => (
            <motion.div
              key={r.k}
              className="flex items-baseline justify-between gap-6 border-b border-dashed border-line py-3 font-mono text-[12px] tracking-[0.16em] last:border-b-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <span className="uppercase text-mute">{r.k}</span>
              <span className={i === 1 ? "text-gold" : "text-bone-dim"}>{r.v}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
