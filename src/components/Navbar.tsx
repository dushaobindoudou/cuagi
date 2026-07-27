import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import clsx from "clsx";
import { useLang, type Key } from "@/lib/i18n";

const NAV_ITEMS: { to: string; key: Key }[] = [
  { to: "/", key: "navHome" },
  { to: "/spectrum", key: "navSpectrum" },
  { to: "/arena", key: "navArena" },
  { to: "/quotes", key: "navQuotes" },
  { to: "/about", key: "navAbout" },
];

/**
 * Global fixed navbar (design.md §8.1).
 * 64px tall, shrinks to 52px after 40px of scroll.
 * Layout owns the matching top padding on the content slot.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 border-b border-line bg-[rgba(11,12,14,0.82)] backdrop-blur-[12px]",
        "transition-all duration-300",
        scrolled ? "h-[52px]" : "h-16",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1520px] items-center justify-between gap-6 px-5 md:px-10">
        {/* brand */}
        <Link to="/" className="flex items-center gap-3" data-cursor="OPEN ↗">
          <img
            src="/logo.svg"
            alt="Road to AGI"
            className={clsx("text-bone transition-all duration-300", scrolled ? "h-6 w-6" : "h-7 w-7")}
          />
          <span className="flex flex-col leading-none">
            <span className="font-grotesk text-[13px] font-bold tracking-[0.2em] text-bone">
              ROAD TO AGI
            </span>
            <span className="mt-1 font-serifsc text-[13px] font-bold text-bone-dim">
              {lang === "zh" ? "通往 AGI" : "通往 AGI"}
            </span>
          </span>
        </Link>

        {/* nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              data-cursor="OPEN ↗"
              className={({ isActive }) =>
                clsx(
                  "group relative flex items-baseline gap-1.5 py-1 font-mono text-[12px] uppercase tracking-[0.16em]",
                  isActive ? "text-bone" : "text-bone-dim hover:text-bone",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span>{t(item.key)}</span>
                  <span
                    className={clsx(
                      "absolute -bottom-[2px] left-0 h-[2px] w-full bg-gold transition-transform duration-300 origin-left",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50",
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* right: camp legend + language toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-bone-dim lg:flex">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-cn" /> {t("china")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-us" /> {t("us")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            data-cursor="SELECT ▸"
            aria-label="Switch language / 切换语言"
            className="flex items-center border border-line font-mono text-[11px] tracking-[0.12em] transition-colors hover:border-gold"
          >
            <span
              className={clsx(
                "px-2 py-1 transition-colors",
                lang === "zh" ? "bg-gold text-ink" : "text-bone-dim",
              )}
            >
              中
            </span>
            <span
              className={clsx(
                "px-2 py-1 transition-colors",
                lang === "en" ? "bg-gold text-ink" : "text-bone-dim",
              )}
            >
              EN
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
