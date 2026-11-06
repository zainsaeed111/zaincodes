"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";

export function BlogTrafficPanel() {
  const [range, setRange] = useState("28d");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    adminFetch(`/api/admin/integrations/analytics?range=${range}`).then(({ res, data: d }) => {
      if (res.ok) setData(d);
    });
  }, [range]);

  return (
    <div className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Blog traffic</h2>
          <p className="muted small">Real Google metrics only. Empty until Search Console / GA4 are authorized.</p>
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="7d">Last 7 days</option>
          <option value="28d">Last 28 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {!data ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="blog-traffic-grid">
          <section>
            <h3>Search Console</h3>
            <p className="muted small">Source: {data.gsc.source}</p>
            <p>{data.gsc.connected ? data.gsc.message : "Not connected"}</p>
            {!data.gsc.connected ? <p className="muted small">{data.gsc.message}</p> : null}
            <div className="blog-metric-cards">
              <div><span>Impressions</span><strong>—</strong></div>
              <div><span>Clicks</span><strong>—</strong></div>
              <div><span>Avg CTR</span><strong>—</strong></div>
              <div><span>Avg position</span><strong>—</strong></div>
            </div>
          </section>
          <section>
            <h3>GA4</h3>
            <p className="muted small">Source: {data.ga4.source}</p>
            <p>{data.ga4.connected ? data.ga4.message : "Not connected"}</p>
            {!data.ga4.connected ? <p className="muted small">{data.ga4.message}</p> : null}
            <div className="blog-metric-cards">
              <div><span>Users</span><strong>—</strong></div>
              <div><span>Sessions</span><strong>—</strong></div>
              <div><span>Pageviews</span><strong>—</strong></div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
