/** Compact discipline glyphs for category lane labels. */

export function CategoryGlyph({ icon, size = 16 }: { icon?: string | null; size?: number }) {
  const id = (icon || "spark").toLowerCase();
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (id === "android") {
    return (
      <svg {...common}>
        <path d="M7 9v7M17 9v7M5 16h14M8 16v3M16 16v3M9 6l-1.5-2.5M15 6l1.5-2.5" />
        <rect x="6" y="7" width="12" height="9" rx="2" />
      </svg>
    );
  }
  if (id === "ios" || id === "mobile") {
    return (
      <svg {...common}>
        <rect x="7" y="3" width="10" height="18" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
    );
  }
  if (id === "flutter") {
    return (
      <svg {...common}>
        <path d="M14 3L5 12l3 3 12-12" />
        <path d="M8 15l3 3 3-3-3-3" />
        <path d="M11 18l3 3 5-5" />
      </svg>
    );
  }
  if (id === "web") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    );
  }
  if (id === "desktop") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    );
  }
  if (id === "backend" || id === "fullstack") {
    return (
      <svg {...common}>
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </svg>
  );
}
