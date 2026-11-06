"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <p className="blog-meta">Something went wrong</p>
        <h1>We could not load this page</h1>
        <p className="muted">
          Your portfolio and other articles are unaffected. Try again, or return home.
        </p>
        {error.digest ? <p className="muted small">Ref: {error.digest}</p> : null}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
          <a className="btn btn-secondary" href="/">
            Home
          </a>
        </div>
      </div>
    </main>
  );
}
