export function SocialGlyph({ name, size = 18 }: { name: string; size?: number }) {
  const n = name.toLowerCase();
  if (n.includes("github")) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
        <path
          fill="currentColor"
          d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1-.9-1.3-.9-1.3-.8-.5.1-.5.1-.5.9.1 1.3.9 1.3.9.8 1.3 2 1 2.5.7.1-.6.3-1 .5-1.2-2.2-.2-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.3.3.6.8.6 1.6v2.4c0 .3.2.6.7.5A10 10 0 0 0 12 2z"
        />
      </svg>
    );
  }
  if (n.includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
        <path
          fill="currentColor"
          d="M6.9 8.7H3.8V20h3.1V8.7zM5.4 4A1.8 1.8 0 1 0 5.4 7.6 1.8 1.8 0 0 0 5.4 4zM20.2 20h-3.1v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H10v-11h3v1.5h.1c.4-.8 1.5-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.9V20z"
        />
      </svg>
    );
  }
  if (n.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
        <path
          fill="currentColor"
          d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.8A4.2 4.2 0 1 0 16.2 12 4.2 4.2 0 0 0 12 7.8zm0 6.9A2.7 2.7 0 1 1 14.7 12 2.7 2.7 0 0 1 12 14.7zm5.1-7.9a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"
        />
      </svg>
    );
  }
  if (n.includes("x") || n.includes("twitter")) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
        <path
          fill="currentColor"
          d="M18.9 3H22l-6.8 7.8L23 21h-6.2l-4.9-6.4L6.3 21H3.2l7.3-8.3L1 3h6.3l4.4 5.8L18.9 3zm-1.1 16.2h1.7L6.3 4.7H4.5l13.3 14.5z"
        />
      </svg>
    );
  }
  if (n.includes("youtube")) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
        <path
          fill="currentColor"
          d="M23 12.2s0-3.2-.4-4.7a3 3 0 0 0-2.1-2.1C18.9 5 12 5 12 5s-6.9 0-8.5.4A3 3 0 0 0 1.4 7.5C1 9 1 12.2 1 12.2s0 3.2.4 4.7a3 3 0 0 0 2.1 2.1C5.1 19.4 12 19.4 12 19.4s6.9 0 8.5-.4a3 3 0 0 0 2.1-2.1c.4-1.5.4-4.7.4-4.7zM9.8 15.5v-6.6l5.8 3.3-5.8 3.3z"
        />
      </svg>
    );
  }
  return (
    <span aria-hidden style={{ fontSize: size * 0.7, fontWeight: 800 }}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
