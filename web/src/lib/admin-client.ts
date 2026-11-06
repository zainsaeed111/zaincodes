"use client";

let csrfCache: string | null = null;

export function setAdminCsrf(token: string | null) {
  csrfCache = token;
}

export async function adminFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const cookieToken =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((c) => c.startsWith("zaincodes_csrf="))
          ?.split("=")
          .slice(1)
          .join("=")
      : undefined;
  const csrf = csrfCache || (cookieToken ? decodeURIComponent(cookieToken) : undefined);
  if (csrf && init.method && init.method !== "GET") {
    headers.set("x-csrf-token", csrf);
  }

  const res = await fetch(path, { ...init, headers, credentials: "include" });
  const data = await res.json().catch(() => ({}));

  if (data.csrfToken && typeof data.csrfToken === "string") {
    csrfCache = data.csrfToken;
  }
  if (path.includes("/api/auth/logout")) {
    csrfCache = null;
  }

  return { res, data };
}
