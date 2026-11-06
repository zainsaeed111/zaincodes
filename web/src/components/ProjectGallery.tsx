"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Shot = { url: string; alt?: string | null };

export type GalleryVariant = "browser" | "browser-stack" | "phone-android" | "phone-flutter";

export function resolveGalleryVariant(category: string, technologies?: string[] | null): GalleryVariant {
  if (category === "flutter") return "phone-flutter";
  if (category === "android") return "phone-android";
  const fullstack = (technologies || []).some((t) =>
    /node|express|spring|nestjs|postgres|mongo|api|django|laravel/i.test(t),
  );
  return fullstack ? "browser-stack" : "browser";
}

export function ProjectGallery({
  images,
  category,
  technologies,
}: {
  images: Shot[];
  category: string;
  technologies?: string[] | null;
}) {
  const list = useMemo(() => images.filter((i) => i.url), [images]);
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchX = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const variant = resolveGalleryVariant(category, technologies);
  const active = list[idx] || list[0];
  const secondary = list[(idx + 1) % Math.max(list.length, 1)] || active;

  const next = useCallback(() => {
    if (!list.length) return;
    setIdx((i) => (i + 1) % list.length);
  }, [list.length]);
  const prev = useCallback(() => {
    if (!list.length) return;
    setIdx((i) => (i - 1 + list.length) % list.length);
  }, [list.length]);

  useEffect(() => {
    if (!lightbox && list.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, next, prev, list.length]);

  if (!active) return null;

  const media = (
    <AnimatePresence mode="wait">
      <motion.div
        key={active.url + idx}
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {variant === "phone-android" || variant === "phone-flutter" ? (
          <div className={`mock-phone ${variant === "phone-flutter" ? "flutter" : "android"}`}>
            <div className="notch" />
            <img src={active.url} alt={active.alt || "Project screenshot"} />
          </div>
        ) : variant === "browser-stack" ? (
          <div className="mock-stack">
            <div className="mock-browser back">
              <div className="mock-browser-bar">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <img src={secondary.url} alt="" />
            </div>
            <div className="mock-browser front">
              <div className="mock-browser-bar">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
                <span className="url-chip">full-stack</span>
              </div>
              <img src={active.url} alt={active.alt || "Project screenshot"} />
            </div>
          </div>
        ) : (
          <div className="mock-browser">
            <div className="mock-browser-bar">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
            <img src={active.url} alt={active.alt || "Project screenshot"} />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className={`gallery gallery-${variant}`}>
      <button
        type="button"
        className="gallery-stage"
        style={{ border: 0, background: "transparent", padding: 0, cursor: "zoom-in", width: "100%" }}
        onClick={() => setLightbox(true)}
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
        aria-label="Open image lightbox"
      >
        {media}
      </button>
      {list.length > 1 ? (
        <div className="gallery-nav" role="tablist" aria-label="Screenshots">
          <button type="button" onClick={prev} aria-label="Previous" style={{ width: "auto", padding: "0 0.75rem" }}>
            ‹
          </button>
          {list.map((shot, i) => (
            <button
              key={`${shot.url}-${i}`}
              type="button"
              className={i === idx ? "active" : ""}
              onClick={() => setIdx(i)}
              aria-label={`Screenshot ${i + 1}`}
            >
              <img src={shot.url} alt="" />
            </button>
          ))}
          <button type="button" onClick={next} aria-label="Next" style={{ width: "auto", padding: "0 0.75rem" }}>
            ›
          </button>
        </div>
      ) : null}
      {lightbox ? (
        <div className="lightbox" onClick={() => setLightbox(false)} role="dialog" aria-modal>
          <button className="lightbox-close" type="button" aria-label="Close">
            ×
          </button>
          <img
            src={active.url}
            alt={active.alt || "Expanded screenshot"}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
