import {
  siAndroid,
  siAndroidstudio,
  siCss,
  siCursor,
  siDart,
  siExpress,
  siFirebase,
  siFlutter,
  siGit,
  siGithub,
  siGradle,
  siHtml5,
  siJavascript,
  siKotlin,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siReact,
  siSpringboot,
  siTypescript,
  siWordpress,
} from "simple-icons";

type SimpleIcon = { title: string; hex: string; path: string };

const ICON_MAP: Record<string, SimpleIcon> = {
  kotlin: siKotlin,
  flutter: siFlutter,
  dart: siDart,
  java: siOpenjdk,
  android: siAndroid,
  springboot: siSpringboot,
  firebase: siFirebase,
  nodejs: siNodedotjs,
  express: siExpress,
  react: siReact,
  nextjs: siNextdotjs,
  wordpress: siWordpress,
  html5: siHtml5,
  css3: siCss,
  javascript: siJavascript,
  typescript: siTypescript,
  vscode: siCursor,
  cursor: siCursor,
  git: siGit,
  github: siGithub,
  gradle: siGradle,
  androidstudio: siAndroidstudio,
};

function normalizeKey(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9+.#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveTechIcon(name: string): SimpleIcon | null {
  const n = normalizeKey(name);
  const checks = [
    n.includes("kotlin") && "kotlin",
    n.includes("flutter") && "flutter",
    n.includes("dart") && "dart",
    n.includes("android") && n.includes("java") && "java",
    n.includes("android studio") && "androidstudio",
    n.includes("android") && "android",
    n.includes("spring") && "springboot",
    n.includes("firebase") && "firebase",
    n.includes("express") && "express",
    n.includes("node") && "nodejs",
    n.includes("next") && "nextjs",
    n.includes("react") && "react",
    n.includes("wordpress") && "wordpress",
    n.includes("html") && "html5",
    n.includes("css") && "css3",
    (n.includes("javascript") || /\bjs\b/.test(n)) && "javascript",
    n.includes("typescript") && "typescript",
    (n.includes("vs code") || n.includes("vscode") || n.includes("cursor")) && "cursor",
    n.includes("github") && "github",
    n.includes("git") && "git",
    n.includes("gradle") && "gradle",
    n.includes("java") && "java",
  ].filter(Boolean) as string[];

  for (const key of checks) {
    const icon = ICON_MAP[key];
    if (icon) return icon;
  }
  return null;
}

function readableHex(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Too dark for dark UI surfaces — lift toward cyan/indigo brand tint
  if (lum < 0.28) return "#67e8f9";
  // Too pale for light UI — deepen slightly
  if (lum > 0.86) return "#0e7490";
  return `#${h}`;
}

export function TechIcon({ name, size = 22 }: { name: string; size?: number }) {
  const icon = resolveTechIcon(name);
  if (!icon) {
    return (
      <span className="tech-icon tech-icon-fallback" aria-hidden>
        {name.trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <svg
      className="tech-icon"
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
    >
      <title>{icon.title}</title>
      <path d={icon.path} fill={readableHex(icon.hex)} />
    </svg>
  );
}
