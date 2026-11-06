"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";

export function BlogSetupPanel() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [adsense, setAdsense] = useState("");
  const [disclosure, setDisclosure] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    adminFetch("/api/admin/integrations")
      .then(({ res, data: d }) => {
        if (!res.ok) setError(d.error?.message || "Failed to load setup status");
        else {
          setData(d);
          setEnabled(Boolean(d.monetization?.enabled));
          setAdsense(d.monetization?.adsenseClientId || "");
          setDisclosure(d.monetization?.affiliateDisclosure || "");
        }
      })
      .catch(() => setError("Failed to load setup status"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveMonetization() {
    setBusy(true);
    const { res, data: d } = await adminFetch("/api/admin/integrations", {
      method: "PATCH",
      body: JSON.stringify({
        monetizationEnabled: enabled,
        adsenseClientId: adsense.trim() || null,
        affiliateDisclosure: disclosure.trim() || null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setNotice(d.error?.message || "Could not save monetization settings");
      return;
    }
    setNotice(enabled ? "Monetization enabled (ads stay off until you wire AdSense tags)." : "Monetization kept disabled.");
    load();
  }

  if (error) return <div className="notice error">{error}</div>;
  if (!data) return <p className="muted">Loading setup checklist…</p>;

  const rows: Array<{ label: string; ok: boolean; detail?: string }> = [
    { label: "Blog CMS ready", ok: data.checklist.blogCms },
    { label: "Database ready", ok: data.checklist.database },
    { label: "Public blog ready", ok: data.checklist.publicBlog },
    { label: "SEO metadata ready", ok: data.checklist.seoMetadata },
    { label: "Sitemap ready", ok: data.checklist.sitemap },
    {
      label: "Search Console",
      ok: data.checklist.searchConsole,
      detail: data.gsc.connected ? "Connected" : data.gsc.nextStep,
    },
    {
      label: "GA4",
      ok: data.checklist.ga4,
      detail: data.ga4.connected ? "Connected" : data.ga4.nextStep,
    },
    { label: "Analytics dashboard ready", ok: data.checklist.analyticsDashboard },
    {
      label: "Monetization",
      ok: false,
      detail: data.monetization.enabled ? "Enabled" : "Disabled by default (safe)",
    },
  ];

  return (
    <div className="admin-card">
      <h2>Blog setup</h2>
      <p className="muted">Live status for the blogging workflow. Google connections stay disconnected until you authorize OAuth.</p>
      {notice ? <div className="notice" style={{ marginBottom: "1rem" }}>{notice}</div> : null}
      <ul className="blog-setup-list">
        {rows.map((r) => (
          <li key={r.label}>
            <span className={r.ok ? "ok" : "pending"}>{r.ok ? "Ready" : "Pending"}</span>
            <div>
              <strong>{r.label}</strong>
              {r.detail ? <p className="muted small">{r.detail}</p> : null}
            </div>
          </li>
        ))}
      </ul>
      <div className="admin-media-block" style={{ marginTop: "1rem" }}>
        <h4>Monetization (off by default)</h4>
        <label className="admin-check">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enable monetization config
        </label>
        <label>
          AdSense client ID
          <input value={adsense} onChange={(e) => setAdsense(e.target.value)} placeholder="ca-pub-…" disabled={!enabled} />
        </label>
        <label>
          Affiliate disclosure
          <textarea value={disclosure} onChange={(e) => setDisclosure(e.target.value)} rows={3} disabled={!enabled} />
        </label>
        <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => void saveMonetization()}>
          Save monetization
        </button>
      </div>
      <div className="admin-media-block" style={{ marginTop: "1rem" }}>
        <h4>Google connection guide</h4>
        <ol className="muted" style={{ paddingLeft: "1.2rem", display: "grid", gap: "0.35rem" }}>
          <li>Create a Google Cloud OAuth client (Web).</li>
          <li>Enable Search Console API and Analytics Data API.</li>
          <li>
            Set <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>, <code>GSC_SITE_URL</code>,{" "}
            <code>GA4_PROPERTY_ID</code> in <code>web/.env.local</code>.
          </li>
          <li>Restart localhost:3001 and complete Google consent in browser (never paste Google passwords into source).</li>
        </ol>
        <p className="muted small">Current: GSC {data.gsc.status} · GA4 {data.ga4.status}</p>
      </div>
    </div>
  );
}
