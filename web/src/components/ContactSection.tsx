"use client";

import { FormEvent, useState } from "react";
import { SocialGlyph } from "@/components/brand/SocialGlyph";
import { Reveal } from "@/components/motion/Reveal";

type Social = { name: string; url: string; icon?: string | null };

export function ContactSection({
  email,
  phone,
  location,
  whatsapp,
  social,
}: {
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  whatsapp?: string | null;
  social: Social[];
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const waDigits = (whatsapp || phone || "").replace(/[^\d]/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent("Hi Zain — I’d like to discuss a project with ZainCodes.")}`
    : null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          platform: form.get("platform"),
          message: form.get("message"),
          website: form.get("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data.error?.message || "Could not send your message. Please try again." });
        return;
      }
      setMsg({
        type: "ok",
        text: "Thanks — your message is in. I’ll get back to you soon.",
      });
      e.currentTarget.reset();
    } catch {
      setMsg({ type: "err", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section contact-section" id="contact">
      <div className="container contact-shell">
        <Reveal>
          <div className="contact-intro">
            <p className="eyebrow">Contact</p>
            <h2>Let’s build something worth shipping</h2>
            <p className="contact-lede">
              Tell me about the product, timeline, and constraints. Prefer a quick chat? Reach out
              directly by email, WhatsApp, or socials.
            </p>

            <div className="contact-direct">
              {email ? (
                <a className="contact-direct-link" href={`mailto:${email}`}>
                  <span>Email</span>
                  <strong>{email}</strong>
                </a>
              ) : null}
              {waHref ? (
                <a className="contact-direct-link" href={waHref} target="_blank" rel="noopener noreferrer">
                  <span>WhatsApp</span>
                  <strong>{whatsapp || phone}</strong>
                </a>
              ) : null}
              {location ? (
                <div className="contact-direct-link static">
                  <span>Based in</span>
                  <strong>{location}</strong>
                </div>
              ) : null}
            </div>

            {social.length ? (
              <div className="contact-social">
                {social.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-btn"
                    aria-label={s.name}
                  >
                    <SocialGlyph name={s.name} />
                    <span>{s.name}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <form className="contact-form" onSubmit={onSubmit}>
            <div className="contact-form-row">
              <label>
                Name
                <input name="name" required minLength={2} placeholder="Your name" autoComplete="name" />
              </label>
              <label>
                Email
                <input name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
              </label>
            </div>
            <label>
              Focus
              <select name="platform" defaultValue="web">
                <option value="web">Web Development</option>
                <option value="full_stack">Full Stack</option>
                <option value="mobile">Mobile App</option>
                <option value="flutter">Flutter</option>
                <option value="android">Android</option>
              </select>
            </label>
            <label>
              Project details
              <textarea
                name="message"
                required
                minLength={10}
                rows={5}
                placeholder="Goals, timeline, and what success looks like…"
              />
            </label>
            <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
            <button className="btn contact-submit" type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send message"}
            </button>
            {msg ? <div className={`notice ${msg.type === "err" ? "error" : ""}`}>{msg.text}</div> : null}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
