"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
        setMsg({ type: "err", text: data.error?.message || "Could not send message." });
        return;
      }
      setMsg({
        type: "ok",
        text:
          data.delivery === "stored_local_only"
            ? "Request received and stored. Email delivery is not configured yet — Zain will review messages from admin."
            : "Request received. We’ll respond soon.",
      });
      e.currentTarget.reset();
    } catch {
      setMsg({ type: "err", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label>
        Name
        <input name="name" required minLength={2} placeholder="Your name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required placeholder="you@company.com" />
      </label>
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
        <textarea name="message" required minLength={10} rows={5} placeholder="Goals, timeline, constraints…" />
      </label>
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send discovery request"}
      </button>
      {msg ? <div className={`notice ${msg.type === "err" ? "error" : ""}`}>{msg.text}</div> : null}
    </form>
  );
}
