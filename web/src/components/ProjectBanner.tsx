"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseVideoUrl } from "@/lib/media";
import {
  aspectCss,
  isTruthyFlag,
  normalizeBannerAspect,
  normalizeImageFit,
  normalizeShowcaseMode,
  resolveShowcaseSlides,
  type ShowcaseProject,
} from "@/lib/showcase";

type Props = ShowcaseProject & {
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
};

export function ProjectBanner({
  title,
  category,
  coverUrl,
  thumbnailUrl,
  videoUrl,
  videoPosterUrl,
  showcaseMode,
  showcaseAutoplay,
  slideshowIntervalMs,
  imageFit,
  bannerAspect,
  scrollPreview,
  showcaseImageOrder,
  screenshots,
  size = "md",
  interactive = true,
  className = "",
}: Props) {
  const mode = normalizeShowcaseMode(showcaseMode);
  const fit = normalizeImageFit(imageFit);
  const aspect = normalizeBannerAspect(bannerAspect);
  const autoplay = isTruthyFlag(showcaseAutoplay);
  const scroll = isTruthyFlag(scrollPreview);
  const interval = Math.max(2200, Number(slideshowIntervalMs) || 4200);
  const reduceMotion = useReducedMotion();

  const slides = useMemo(
    () =>
      resolveShowcaseSlides({
        title,
        coverUrl,
        thumbnailUrl,
        videoUrl,
        videoPosterUrl,
        showcaseMode: mode,
        showcaseImageOrder,
        screenshots,
      }),
    [title, coverUrl, thumbnailUrl, videoUrl, videoPosterUrl, mode, showcaseImageOrder, screenshots],
  );

  const video = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [broken, setBroken] = useState<Record<string, true>>({});
  const [playerOpen, setPlayerOpen] = useState(false);
  const [inlineFailed, setInlineFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Slideshow mode always allows multi-image controls when >1. Custom only cycles when autoplay is on.
  const multi =
    slides.length > 1 && (mode === "slideshow" || (mode === "custom" && autoplay));
  const active = slides[idx] || slides[0] || null;
  const activeOk = active && !broken[active] ? active : null;
  const poster =
    (videoPosterUrl && !broken[videoPosterUrl] ? videoPosterUrl : null) ||
    (coverUrl && !broken[coverUrl] ? coverUrl : null) ||
    activeOk;

  const next = useCallback(() => {
    if (!multi) return;
    setIdx((i) => (i + 1) % slides.length);
  }, [multi, slides.length]);

  useEffect(() => {
    setIdx(0);
    setInlineFailed(false);
  }, [slides.join("|"), mode]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!interactive || !multi || !autoplay || paused || !inView || reduceMotion || playerOpen) return;
    const t = window.setInterval(next, interval);
    return () => window.clearInterval(t);
  }, [interactive, multi, autoplay, paused, inView, reduceMotion, playerOpen, next, interval]);

  const showVideo = mode === "video" && Boolean(video);
  const canInlineDirect =
    showVideo &&
    video?.provider === "direct" &&
    Boolean(video.embedUrl) &&
    autoplay &&
    interactive &&
    inView &&
    !reduceMotion &&
    !inlineFailed;
  const showScroll = scroll && Boolean(activeOk) && mode !== "video";

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (canInlineDirect && !paused) {
      el.muted = true;
      void el.play().catch(() => setInlineFailed(true));
    } else {
      el.pause();
    }
  }, [canInlineDirect, paused]);

  return (
    <>
      <div
        ref={rootRef}
        className={`pbanner pbanner-${size} ${className}`}
        style={{ ["--pbanner-aspect" as string]: aspectCss(aspect) }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
        }}
      >
        <div
          className={`pbanner-stage fit-${fit} ${showScroll ? "is-scroll" : ""} ${paused || reduceMotion ? "is-paused" : ""}`}
        >
          {showVideo ? (
            canInlineDirect && video?.embedUrl ? (
              <video
                ref={videoRef}
                className="pbanner-video-inline"
                src={video.embedUrl}
                muted
                playsInline
                loop
                preload="metadata"
                poster={poster || undefined}
                onError={() => setInlineFailed(true)}
              />
            ) : (
              <>
                {poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={poster}
                    alt={`${title} video poster`}
                    className="pbanner-img"
                    loading="lazy"
                    onError={() => poster && setBroken((b) => ({ ...b, [poster]: true }))}
                  />
                ) : (
                  <Placeholder title={title} category={category} />
                )}
                <button
                  type="button"
                  className="pbanner-play"
                  aria-label={`Play video for ${title}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPlayerOpen(true);
                  }}
                >
                  <span />
                </button>
              </>
            )
          ) : activeOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={activeOk}
              src={activeOk}
              alt={`${title} banner`}
              className={`pbanner-img ${showScroll ? "pbanner-scroll-img" : ""}`}
              loading="lazy"
              onError={() => setBroken((b) => ({ ...b, [activeOk]: true }))}
            />
          ) : (
            <Placeholder title={title} category={category} />
          )}
        </div>

        {interactive && multi ? (
          <div className="pbanner-dots" onClick={(e) => e.preventDefault()}>
            {slides.map((url, i) => (
              <button
                key={`${url}-${i}`}
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
              <video src={video.embedUrl} controls autoPlay playsInline poster={poster || undefined} />
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

function Placeholder({ title, category }: { title: string; category?: string | null }) {
  return (
    <div className="pbanner-placeholder" role="img" aria-label={`${title} placeholder`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/zaincodes-icon-dark.svg" alt="" width={48} height={34} className="brand-logo-mark-dark" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/zaincodes-icon-light.svg" alt="" width={48} height={34} className="brand-logo-mark-light" />
      <strong>{title}</strong>
      {category ? <span>{category}</span> : null}
    </div>
  );
}
