"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collectProjectSlides, parseVideoUrl } from "@/lib/media";

type Shot = { url: string; alt?: string | null; isCover?: boolean };

export type PreviewStyle = "banner" | "phone" | "browser" | "stack";

export function ProjectMediaPreview({
  title,
  category,
  technologies,
  coverUrl,
  thumbnailUrl,
  screenshots,
  videoUrl,
  previewStyle,
  size = "md",
  interactive = true,
}: {
  title: string;
  category: string;
  technologies?: string[] | null;
  coverUrl?: string | null;
  thumbnailUrl?: string | null;
  screenshots?: Shot[] | null;
  videoUrl?: string | null;
  /** Store-style banner by default (Play/App Store feature graphic). */
  previewStyle?: PreviewStyle | string | null;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const slides = useMemo(
    () => collectProjectSlides({ coverUrl, thumbnailUrl, screenshots }),
    [coverUrl, thumbnailUrl, screenshots],
  );
  const video = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);
  const mobile = category === "android" || category === "flutter";
  const fullstack = (technologies || []).some((t) =>
    /node|express|spring|api|postgres|mongo|nestjs/i.test(t),
  );

  const style: PreviewStyle = useMemo(() => {
    const raw = (previewStyle || "banner").toLowerCase();
    if (raw === "phone" || raw === "browser" || raw === "stack" || raw === "banner") return raw;
    // Legacy auto: still prefer banner for showcase consistency
    return "banner";
  }, [previewStyle]);

  const deviceFrame =
    style === "phone" ? "ppm-phone" : style === "stack" || (style === "browser" && fullstack) ? "ppm-stack" : style === "browser" ? "ppm-browser" : "ppm-banner";

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [broken, setBroken] = useState<Record<string, true>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const active = slides[idx] || null;
  const multi = slides.length > 1;

  const next = useCallback(() => {
    if (!multi) return;
    setIdx((i) => (i + 1) % slides.length);
  }, [multi, slides.length]);

  const prev = useCallback(() => {
    if (!multi) return;
    setIdx((i) => (i - 1 + slides.length) % slides.length);
  }, [multi, slides.length]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!interactive || !multi || paused || !inView || reduceMotion || playerOpen) return;
    const t = window.setInterval(next, 4200);
    return () => window.clearInterval(t);
  }, [interactive, multi, paused, inView, reduceMotion, playerOpen, next]);

  // Prefer cover/slide; fall back to video poster for banner when no stills
  const mediaSrc = active?.url && !broken[active.url] ? active.url : null;
  const posterOk = video?.posterUrl && !broken[video.posterUrl] ? video.posterUrl : null;
  const displaySrc = mediaSrc || posterOk || null;
  const showAsVideoHero = Boolean(video && (!mediaSrc || idx === 0));

  function markBroken(url?: string | null) {
    if (!url) return;
    setBroken((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }

  function openVideo(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (video) setPlayerOpen(true);
  }

  const stage = (
    <div className="ppm-stage">
      {displaySrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displaySrc}
          alt={active?.alt || `${title} banner`}
          loading="lazy"
          onError={() => markBroken(displaySrc)}
        />
      ) : (
        <div className="ppm-placeholder" role="img" aria-label={`${title} preview placeholder`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/zaincodes-icon-dark.svg" alt="" width={64} height={45} className="brand-logo-mark-dark" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/zaincodes-icon-light.svg" alt="" width={64} height={45} className="brand-logo-mark-light" />
          <span>Preview coming soon</span>
        </div>
      )}
      {style === "banner" ? (
        <div className="ppm-banner-caption" aria-hidden>
          <strong>{title}</strong>
          <span>{category}</span>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <div
        ref={rootRef}
        className={`ppm ${deviceFrame} ppm-${size}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
        }}
        onTouchStart={(e) => {
          touchX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx > 40) prev();
          if (dx < -40) next();
          touchX.current = null;
        }}
      >
        {style === "banner" ? (
          <div className="ppm-banner-shell">{stage}</div>
        ) : style === "phone" || (style !== "browser" && style !== "stack" && mobile) ? (
          <div className="ppm-phone-bezel">
            <div className="ppm-phone-notch" />
            {stage}
          </div>
        ) : (
          <div className={`ppm-browser-shell ${style === "stack" || fullstack ? "is-stack" : ""}`}>
            {style === "stack" || fullstack ? <div className="ppm-browser-back" aria-hidden /> : null}
            <div className="ppm-browser-front">
              <div className="ppm-chrome">
                <span />
                <span />
                <span />
                <em>{title}</em>
              </div>
              {stage}
            </div>
          </div>
        )}

        {video ? (
          <button type="button" className="ppm-play" aria-label={`Play video for ${title}`} onClick={openVideo}>
            <span />
            {showAsVideoHero && style === "banner" ? <em className="ppm-play-label">Watch</em> : null}
          </button>
        ) : null}

        {interactive && multi ? (
          <div className="ppm-controls" onClick={(e) => e.preventDefault()}>
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prev();
              }}
            >
              ‹
            </button>
            <div className="ppm-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === idx ? "active" : ""}
                  aria-label={`Slide ${i + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIdx(i);
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                next();
              }}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      {playerOpen && video ? (
        <div
          className="video-lightbox"
          role="dialog"
          aria-modal
          aria-label={`${title} video`}
          onClick={() => setPlayerOpen(false)}
        >
          <button type="button" className="lightbox-close" aria-label="Close video" onClick={() => setPlayerOpen(false)}>
            ×
          </button>
          <div className="video-lightbox-frame" onClick={(e) => e.stopPropagation()}>
            {video.canEmbed && video.embedUrl && video.provider !== "direct" ? (
              <iframe
                src={video.embedUrl}
                title={`${title} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : video.provider === "direct" && video.embedUrl ? (
              <video src={video.embedUrl} controls autoPlay playsInline />
            ) : (
              <div className="video-fallback">
                <p>This video can’t be embedded here.</p>
                <a className="btn" href={video.watchUrl} target="_blank" rel="noopener noreferrer">
                  Open externally
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
