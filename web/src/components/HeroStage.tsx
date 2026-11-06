"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useRef } from "react";

type Props = {
  badge?: string | null;
  badgeEnabled?: boolean;
  greeting?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
};

const DEFAULT_BADGE = "Available for Web, Full-Stack & Mobile Projects";

export function HeroStage({ badge, badgeEnabled = true, greeting, description, avatarUrl }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 20 });
  const sy = useSpring(my, { stiffness: 55, damping: 20 });
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 65, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 65, damping: 18 });
  const glow = useMotionTemplate`radial-gradient(560px circle at ${sx}px ${sy}px, rgba(34,211,238,0.12), transparent 42%)`;

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    mx.set(px);
    my.set(py);
    const nx = (px / r.width - 0.5) * 2;
    const ny = (py / r.height - 0.5) * 2;
    ry.set(nx * 5);
    rx.set(-ny * 3.5);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  const lede =
    description && description.length < 220
      ? description
      : "I build production web platforms, full-stack systems, and mobile apps with clear architecture and careful craft.";

  return (
    <section
      ref={ref}
      className="hero-stage"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-label="Introduction"
    >
      <motion.div className="hero-glow" style={{ background: glow }} aria-hidden />
      <div className="hero-ambient" aria-hidden />
      <div className="container hero-layout">
        <div className="hero-copy">
          {badgeEnabled ? (
            <motion.p
              className="hero-badge"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="hero-badge-dot" />
              {badge?.trim() || DEFAULT_BADGE}
            </motion.p>
          ) : null}

          <motion.p
            className="hero-kicker"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.55 }}
          >
            {greeting || "ZainCodes"}
          </motion.p>

          <motion.h1
            className="hero-title"
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Web, full-stack &amp; mobile
            <span className="hero-title-accent"> products that ship</span>
          </motion.h1>

          <motion.p
            className="hero-position-line"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.55 }}
          >
            Web Development · Full-Stack · Mobile Apps
          </motion.p>

          <motion.p
            className="hero-lede"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.6 }}
          >
            {lede}
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.55 }}
          >
            <MagneticButton href="/#contact">Start a project</MagneticButton>
            <MagneticButton href="/projects" secondary>
              View selected work
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual-3d"
          style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-visual-back" aria-hidden />
          <div className="hero-visual-mid" aria-hidden />
          <div className="hero-frame">
            <img
              src={avatarUrl || "/Profile.webp"}
              alt="Zain Saeed — ZainCodes"
              className="hero-portrait"
              loading="eager"
              fetchPriority="high"
            />
            <div className="hero-frame-sheen" aria-hidden />
            <div className="hero-frame-caption">
              <span>Zain Saeed</span>
              <span>Engineer · Founder</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
