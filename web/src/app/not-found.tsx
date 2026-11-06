import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <p className="blog-meta">404</p>
        <h1>Page not found</h1>
        <p className="muted">This URL is not published, was moved, or never existed.</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <Link className="btn" href="/">
            Home
          </Link>
          <Link className="btn btn-secondary" href="/blog">
            Blog
          </Link>
          <Link className="btn btn-secondary" href="/projects">
            Projects
          </Link>
        </div>
      </div>
    </main>
  );
}
