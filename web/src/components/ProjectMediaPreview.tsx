"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collectProjectSlides, parseVideoUrl } from "@/lib/media";
import { resolvePreviewFrame, type PreviewFrame } from "@/lib/project-taxonomy";

type Shot = { url: string; alt?: string | null; isCover?: boolean };

export type PreviewStyle = "banner" | "phone" | "browser" | "stack" | "auto";

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
  previewStyle?: PreviewStyle | string | null;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const slides = useMemo(
    () => collectProjectSlides({ coverUrl, thumbnailUrl, screenshots }),
    [coverUrl, thumbnailUrl, screenshots],
  );
  const video = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);

  const style: PreviewFrame = useMemo(
    () => resolvePreviewFrame(category, previewStyle, technologies),
    [category, previewStyle, technologies],
  );

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
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!interactive || !multi || paused || !inView || reduceMotion || playerOpen) return;
    const t = window.setInterval(next, 4500);
    return () => window.clearInterval(t);
  }, [interactive, multi, paused, inView, reduceMotion, playerOpen, next]);

  const mediaSrc = active?.url && !broken[active.url] ? active.url : null;
  const posterOk = video?.posterUrl && !broken[video.posterUrl] ? video.posterUrl : null;
  const displaySrc = mediaSrc || posterOk || null;

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
          alt={active?.alt || `${title} preview`}
          loading="lazy"
          onError={() => markBroken(displaySrc)}
        />
      ) : (
        <div className="ppm-placeholder" role="img" aria-label={`${title} preview placeholder`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/zaincodes-icon-dark.svg" alt="" width={56} height={40} className="brand-logo-mark-dark" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/zaincodes-icon-light.svg" alt="" width={56} height={40} className="brand-logo-mark-light" />
          <span>Preview coming soon</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        ref={rootRef}
        className={`ppm ppm-${style} ppm-${size}`}
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
        {style === "phone" ? (
          <div className="ppm-phone-bezel">
            <div className="ppm-phone-notch" aria-hidden />
            {stage}
          </div>
        ) : (
          <div className={`ppm-browser-shell ${style === "stack" ? "is-stack" : ""}`}>
            {style === "stack" ? <div className="ppm-browser-back" aria-hidden /> : null}
            <div className="ppm-browser-front">
              <div className="ppm-chrome" aria-hidden>
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
          </button>
        ) : null}

        {interactive && multi ? (
          <div className="ppm-controls" onClick={(e) => e.preventDefault()}>
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
