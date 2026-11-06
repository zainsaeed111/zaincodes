"use client";

import Link from "next/link";

type Size = "sm" | "md" | "lg" | "hero";

const sizes: Record<Size, { icon: number; text: string }> = {
  sm: { icon: 34, text: "1.2rem" },
  md: { icon: 42, text: "1.45rem" },
  lg: { icon: 56, text: "1.85rem" },
  hero: { icon: 88, text: "clamp(2.6rem, 6vw, 4.4rem)" },
};

export function BrandLogo({
  size = "md",
  href = "/",
  showText = true,
  className = "",
  asLink = true,
}: {
  size?: Size;
  href?: string;
  showText?: boolean;
  className?: string;
  asLink?: boolean;
}) {
  const s = sizes[size];
  const inner = (
    <span className={`brand-logo brand-logo-${size} ${className}`.trim()}>
      <img
        src="/brand/zaincodes-icon-dark.svg"
        alt=""
        width={s.icon * 1.42}
        height={s.icon}
        className="brand-logo-mark brand-logo-mark-dark"
        decoding="async"
      />
      <img
        src="/brand/zaincodes-icon-light.svg"
        alt=""
        width={s.icon * 1.42}
        height={s.icon}
        className="brand-logo-mark brand-logo-mark-light"
        decoding="async"
      />
      {showText ? (
        <span className="brand-logo-word" style={{ fontSize: s.text }}>
          <span className="brand-logo-zain">Zain</span>
          <span className="brand-logo-codes">Codes</span>
        </span>
      ) : (
        <span className="sr-only">ZainCodes</span>
      )}
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href={href} className="brand-logo-link" aria-label="ZainCodes home">
      {inner}
    </Link>
  );
}
