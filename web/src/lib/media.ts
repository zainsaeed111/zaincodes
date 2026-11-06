export type VideoProvider = "youtube" | "vimeo" | "gdrive" | "direct" | "unknown";

export type ParsedVideo = {
  provider: VideoProvider;
  id?: string;
  embedUrl?: string;
  watchUrl: string;
  posterUrl?: string | null;
  canEmbed: boolean;
};

export function parseVideoUrl(raw?: string | null): ParsedVideo | null {
  if (!raw) return null;
  const input = raw.trim();
  if (!input) return null;

  // Uploaded / relative media (e.g. /api/media/projects/uuid-demo.mp4)
  if (input.startsWith("/") || input.startsWith("./")) {
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(input) || input.includes("/api/media/")) {
      return {
        provider: "direct",
        embedUrl: input,
        watchUrl: input,
        posterUrl: null,
        canEmbed: true,
      };
    }
    return null;
  }

  try {
    const url = new URL(input);

    // YouTube
    const ytHost = /youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(url.hostname);
    if (ytHost) {
      let id = url.searchParams.get("v") || "";
      if (!id && url.hostname.includes("youtu.be")) id = url.pathname.replace("/", "");
      if (!id) {
        const m = url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);
        if (m) id = m[1];
      }
      if (id) {
        return {
          provider: "youtube",
          id,
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
          watchUrl: `https://www.youtube.com/watch?v=${id}`,
          posterUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          canEmbed: true,
        };
      }
    }

    // Vimeo
    if (/vimeo\.com/i.test(url.hostname)) {
      const m = url.pathname.match(/\/(?:video\/)?(\d+)/);
      if (m) {
        return {
          provider: "vimeo",
          id: m[1],
          embedUrl: `https://player.vimeo.com/video/${m[1]}`,
          watchUrl: `https://vimeo.com/${m[1]}`,
          posterUrl: null,
          canEmbed: true,
        };
      }
    }

    // Google Drive
    if (/drive\.google\.com/i.test(url.hostname)) {
      const m = url.pathname.match(/\/file\/d\/([^/]+)/) || url.searchParams.get("id");
      const id = typeof m === "string" ? m : m?.[1];
      if (id) {
        return {
          provider: "gdrive",
          id,
          embedUrl: `https://drive.google.com/file/d/${id}/preview`,
          watchUrl: `https://drive.google.com/file/d/${id}/view`,
          posterUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1280`,
          canEmbed: true,
        };
      }
    }

    // Direct video file
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(url.pathname)) {
      return {
        provider: "direct",
        embedUrl: input,
        watchUrl: input,
        posterUrl: null,
        canEmbed: true,
      };
    }

    return {
      provider: "unknown",
      watchUrl: input,
      canEmbed: false,
    };
  } catch {
    return null;
  }
}

export function collectProjectSlides(input: {
  coverUrl?: string | null;
  thumbnailUrl?: string | null;
  screenshots?: Array<{ url: string; alt?: string | null; isCover?: boolean }> | null;
}) {
  const list: Array<{ url: string; alt?: string | null }> = [];
  const push = (url?: string | null, alt?: string | null) => {
    if (!url) return;
    if (list.some((x) => x.url === url)) return;
    list.push({ url, alt: alt || null });
  };

  const covers = (input.screenshots || []).filter((s) => s.isCover);
  covers.forEach((s) => push(s.url, s.alt));
  push(input.coverUrl);
  push(input.thumbnailUrl);
  (input.screenshots || []).forEach((s) => push(s.url, s.alt));
  return list;
}
