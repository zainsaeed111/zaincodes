"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  // Start hidden so SSR/client hydration always match (pathname can be null on SSR).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), reduce ? 120 : 780);
    return () => window.clearTimeout(t);
  }, [pathname, reduce]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <div className="page-loader-inner">
            <img src="/brand/zaincodes-icon-dark.svg" alt="" width={96} height={68} className="page-loader-mark brand-logo-mark-dark" />
            <img src="/brand/zaincodes-icon-light.svg" alt="" width={96} height={68} className="page-loader-mark brand-logo-mark-light" />
            <div className="page-loader-word">
              <span>Zain</span>
              <span className="brand-logo-codes">Codes</span>
            </div>
            <div className="page-loader-track">
              <span />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
