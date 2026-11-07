import type { ReactNode } from "react";

/** Simple inline glyphs for project disciplines (extensible by icon id). */

const paths: Record<string, ReactNode> = {
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10 18.5h4" />
    </>
  ),
  android: (
    <>
      <path d="M8 9v7M16 9v7M7 16h10M9 9c0-2 1.3-3.5 3-3.5S15 7 15 9" />
      <path d="M9.2 5.8 8 4.2M14.8 5.8 16 4.2" />
    </>
  ),
  ios: (
    <>
      <path d="M14.5 5.2c.7-.9 1.1-2 1-3.1-1.1.1-2.3.7-3 1.6-.7.8-1.2 1.9-1.1 3 1.2 0 2.4-.5 3.1-1.5Z" />
      <path d="M18.5 20.5c-1.1 1.6-2.3 3.2-4.1 3.2-1.1 0-1.5-.7-2.9-.7s-1.9.7-2.9.7c-1.8.1-3.2-1.7-4.3-3.3-2.2-3.3-1.9-8 1.1-10.5 1.3-1.1 3-1.8 4.5-1.8 1.1 0 2.2.8 2.9.8s2.1-.9 3.6-.8c.7 0 2.7.3 4 2.2-3.5 2-2.9 7.5.1 10.2Z" />
    </>
  ),
  flutter: (
    <>
      <path d="M14 3 5.5 11.5 9 15l8.5-8.5L14 3Z" />
      <path d="M9 15l3.5 3.5L9 22l-3.5-3.5L9 15Z" />
      <path d="M12.5 18.5 16 15l3.2 3.2-3.5 3.3-3.2-3Z" />
    </>
  ),
  desktop: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  fullstack: (
    <>
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </>
  ),
  backend: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
      <path d="M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v4M12 17v4M4.5 12H8.5M15.5 12H19.5" />
      <path d="M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" />
    </>
  ),
};

export function CategoryGlyph({
  icon,
  size = 18,
  className = "",
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  const key = (icon || "spark").toLowerCase();
  const body = paths[key] || paths.spark;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {body}
    </svg>
  );
}

export const CATEGORY_ICON_OPTIONS = Object.keys(paths);
