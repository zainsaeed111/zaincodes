"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SocialGlyph } from "@/components/brand/SocialGlyph";

type Props = {
  blurb?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  social?: Array<{ name: string; url: string }>;
  hasResume?: boolean;
};

export function SiteFooter({ blurb, email, whatsapp, social, hasResume }: Props) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const waDigits = (whatsapp || "").replace(/[^\d]/g, "");
  const waHref = waDigits ? `https://wa.me/${waDigits}` : null;
  const links = (social || []).filter((s) => s.url && s.name);

  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand-block">
          <BrandLogo size="md" />
          <p className="footer-blurb">
            {blurb ||
              "ZainCodes designs and ships web platforms, full-stack systems, and mobile applications with clear architecture."}
          </p>
          {links.length ? (
            <div className="footer-social" aria-label="Social links">
              {links.map((s) => (
                <a
                  key={`${s.name}-${s.url}`}
                  className="footer-social-btn"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={s.name}
                >
                  <SocialGlyph name={s.name} size={17} />
                </a>
              ))}
            </div>
          ) : null}
          <p className="footer-closing">Built for clarity, craft, and shipping.</p>
        </div>

        <div className="footer-cols">
          <div>
            <h4>Explore</h4>
            <div className="footer-links">
              <Link href="/projects">Projects</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/#about">About</Link>
              <Link href="/#contact">Contact</Link>
              {hasResume ? <a href="/api/resume">Resume</a> : null}
            </div>
          </div>
          <div>
            <h4>Services</h4>
            <div className="footer-links">
              <Link href="/services/web-development">Web Development</Link>
              <Link href="/services/full-stack-development">Full-Stack</Link>
              <Link href="/services/mobile-app-development">Mobile Apps</Link>
              <Link href="/services/custom-software-development">Custom Software</Link>
              <Link href="/services/desktop-application-development">Desktop Apps</Link>
            </div>
          </div>
          <div>
            <h4>Connect</h4>
            <div className="footer-links">
              {email ? <a href={`mailto:${email}`}>{email}</a> : null}
              {waHref ? (
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              ) : null}
              {links.map((s) => (
                <a key={`text-${s.name}-${s.url}`} href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ZainCodes. All rights reserved.</span>
        <span className="footer-tagline">Web · Full-Stack · Mobile</span>
      </div>
    </footer>
  );
}
