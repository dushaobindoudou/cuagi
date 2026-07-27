import { useState } from "react";
import clsx from "clsx";
import type { Camp } from "@/lib/data";

interface InkImageProps {
  src: string;
  alt: string;
  camp: Camp;
  /** when true the photo "develops" from halftone monochrome to full color */
  active?: boolean;
  /** when true, hovering a parent `.group` develops the photo to full color */
  hoverDevelop?: boolean;
  className?: string;
  imgClassName?: string;
}

/**
 * W2 照片油墨置换 — CSS 兜底实现 (design.md W2 fallback):
 * default = grayscale + contrast with a camp-color duotone wash and a
 * halftone dot screen; `active` (hover) washes it out to full color.
 */
export default function InkImage({
  src,
  alt,
  camp,
  active,
  hoverDevelop,
  className,
  imgClassName,
}: InkImageProps) {
  const [loaded, setLoaded] = useState(false);
  const campHex = camp === "china" ? "#D63A2C" : "#2E6FE0";

  return (
    <span className={clsx("relative block overflow-hidden bg-ink-2", className)}>
      {/* halftone placeholder while loading */}
      <span
        aria-hidden
        className="halftone-dots absolute inset-0 opacity-30"
        style={{ color: campHex }}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={clsx(
          "h-full w-full object-cover transition-all duration-700 ease-dossier",
          loaded ? "opacity-100" : "opacity-0",
          active
            ? "grayscale-0 contrast-100 brightness-100"
            : "grayscale contrast-[1.15] brightness-[0.88]",
          hoverDevelop &&
            "group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100",
          imgClassName,
        )}
      />
      {/* camp duotone wash */}
      <span
        aria-hidden
        className={clsx(
          "pointer-events-none absolute inset-0 mix-blend-color transition-opacity duration-700",
          active ? "opacity-0" : "opacity-90",
          hoverDevelop && "group-hover:opacity-0",
        )}
        style={{ backgroundColor: campHex }}
      />
      {/* halftone screen on top of photo */}
      <span
        aria-hidden
        className={clsx(
          "halftone-dots pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-700",
          active ? "opacity-0" : "opacity-45",
          hoverDevelop && "group-hover:opacity-0",
        )}
        style={{ color: campHex }}
      />
    </span>
  );
}
