"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", background: "#0b1020", color: "#f5f7fb" }}>
        <h1>ZainCodes temporarily unavailable</h1>
        <p>A critical error occurred. Please retry in a moment.</p>
        {error.digest ? <p style={{ opacity: 0.7 }}>Ref: {error.digest}</p> : null}
        <button type="button" onClick={reset} style={{ marginTop: "1rem", padding: "0.6rem 1rem" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
