export type ShowcaseMode = "static" | "slideshow" | "video" | "custom";
export type ImageFit = "cover" | "contain";
export type BannerAspect = "16/10" | "16/9" | "2/1" | "4/3";

export type ShowcaseProject = {
  title: string;
  category?: string | null;
  coverUrl?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  showcaseMode?: string | null;
  showcaseAutoplay?: number | boolean | null;
  slideshowIntervalMs?: number | null;
  imageFit?: string | null;
  bannerAspect?: string | null;
  scrollPreview?: number | boolean | null;
  showcaseImageOrder?: string[] | null;
  screenshots?: Array<{ url: string; alt?: string | null; isCover?: boolean }> | null;
};

export function normalizeShowcaseMode(value?: string | null): ShowcaseMode {
  const v = (value || "static").toLowerCase();
  if (v === "slideshow" || v === "video" || v === "custom") return v;
  return "static";
}

export function normalizeImageFit(value?: string | null): ImageFit {
  return value === "contain" ? "contain" : "cover";
}

export function normalizeBannerAspect(value?: string | null): BannerAspect {
  // Prefer compact landscape thumbs; 2/1 banners stay available when admin chooses them.
  if (value === "16/9" || value === "2/1" || value === "4/3" || value === "16/10") return value;
  return "16/10";
}

export function isTruthyFlag(value?: number | boolean | string | null) {
  return value === true || value === 1 || value === "1";
}

/** Build ordered media list for banner/slideshow based on admin settings. */
export function resolveShowcaseSlides(project: ShowcaseProject): string[] {
  const mode = normalizeShowcaseMode(project.showcaseMode);
  const cover = project.coverUrl?.trim() || project.thumbnailUrl?.trim() || "";
  const shots = (project.screenshots || [])
    .map((s) => s.url?.trim())
    .filter((u): u is string => Boolean(u));
  const ordered = (project.showcaseImageOrder || []).map((u) => u.trim()).filter(Boolean);

  if (mode === "static") {
    return cover ? [cover] : shots.slice(0, 1);
  }

  if (mode === "video") {
    // Video mode still needs a poster/fallback still for UI.
    const poster = project.videoPosterUrl?.trim() || cover;
    return poster ? [poster] : shots.slice(0, 1);
  }

  if (mode === "custom") {
    if (ordered.length) return Array.from(new Set(ordered));
    return cover ? [cover, ...shots.filter((u) => u !== cover)] : shots;
  }

  // slideshow: banner first, then remaining ordered/unique screenshots
  const restSource = ordered.length ? ordered : shots;
  const rest = restSource.filter((u) => u && u !== cover);
  if (cover) return [cover, ...Array.from(new Set(rest))];
  return Array.from(new Set(restSource));
}

export function aspectCss(aspect: BannerAspect) {
  switch (aspect) {
    case "16/9":
      return "16 / 9";
    case "2/1":
      return "2 / 1";
    case "4/3":
      return "4 / 3";
    default:
      return "16 / 10";
  }
}
