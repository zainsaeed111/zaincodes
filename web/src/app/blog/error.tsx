"use client";

import Link from "next/link";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <p className="blog-meta">Blog</p>
        <h1>This article could not be loaded</h1>
        <p className="muted">
          Other pages on ZainCodes remain available. Homepage and portfolio are not affected by this error.
        </p>
        {error.digest ? <p className="muted small">Ref: {error.digest}</p> : null}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button type="button" className="btn" onClick={reset}>
            Retry
          </button>
          <Link className="btn btn-secondary" href="/blog">
            All articles
          </Link>
          <Link className="btn btn-secondary" href="/">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
