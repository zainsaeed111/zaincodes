/**
 * Production-like local acceptance checks against localhost:3001.
 * Does not deploy. Does not print secrets.
 */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.SMOKE_BASE || "http://127.0.0.1:3001";
const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

const results = [];
function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function req(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  return { res, text, json };
}

function cookieJar(setCookie) {
  if (!setCookie) return "";
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  return parts.map((c) => c.split(";")[0]).join("; ");
}

async function main() {
  if (!email || !password) {
    console.error("ADMIN_BOOTSTRAP_EMAIL/PASSWORD required via env");
    process.exit(2);
  }

  // Public surfaces
  for (const p of ["/", "/projects", "/blog", "/robots.txt", "/sitemap.xml", "/blog/rss.xml", "/api/health"]) {
    const { res } = await req(`${BASE}${p}`);
    record(`GET ${p}`, res.status === 200, `status=${res.status}`);
  }

  const health = await req(`${BASE}/api/health`);
  record("health.db", Boolean(health.json?.database?.ok), health.json?.database?.driver || "");
  record(
    "health.productionPersistenceReady",
    health.json?.productionPersistenceReady === false || health.json?.productionPersistenceReady === true,
    String(health.json?.productionPersistenceReady),
  );

  // Unauthorized admin write
  const unauth = await req(`${BASE}/api/admin/blog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "nope" }),
  });
  record("admin write unauthorized", unauth.res.status === 401 || unauth.res.status === 403, `status=${unauth.res.status}`);

  // Login
  const login = await req(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookies = cookieJar(login.res.headers.getSetCookie?.() || login.res.headers.get("set-cookie"));
  const csrf = login.json?.csrfToken;
  record("admin login", Boolean(login.json?.ok && csrf && cookies), `ok=${login.json?.ok}`);

  const headers = {
    "Content-Type": "application/json",
    "x-csrf-token": csrf,
    Cookie: cookies,
  };

  const slug = `launch-accept-${Date.now()}`;
  const create = await req(`${BASE}/api/admin/blog`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "Launch Acceptance Article",
      slug,
      excerpt: "Acceptance test article for local verification.",
      bodyHtml: "<h2>Paste test</h2><p>Formatted <strong>content</strong> from ChatGPT-style paste.</p><ul><li>One</li><li>Two</li></ul>",
      status: "draft",
      seoTitle: "Launch Acceptance Article — ZainCodes",
      seoDescription: "Local acceptance verification for draft, preview, publish, and unpublish flows.",
    }),
  });
  const postId = create.json?.post?.id;
  record("create draft", Boolean(create.json?.ok && postId), `id=${postId}`);

  const draftPublic = await req(`${BASE}/blog/${slug}`);
  record("draft not public", draftPublic.res.status === 404, `status=${draftPublic.res.status}`);

  const preview = await req(`${BASE}/blog/preview/${postId}`, { headers: { Cookie: cookies } });
  record("admin preview", preview.res.status === 200, `status=${preview.res.status}`);

  const publish = await req(`${BASE}/api/admin/blog/${postId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "published", expectedVersion: create.json.post.contentVersion }),
  });
  record("publish", Boolean(publish.json?.ok && publish.json?.post?.status === "published"));

  const publicArticle = await req(`${BASE}/blog/${slug}`);
  record(
    "public article",
    publicArticle.res.status === 200 && publicArticle.text.includes("Paste test"),
    `status=${publicArticle.res.status}`,
  );
  record("article metadata html", publicArticle.text.includes("<title>") || publicArticle.text.includes("og:"), "html head present");

  const sitemap = await req(`${BASE}/sitemap.xml`);
  record("sitemap includes slug", sitemap.text.includes(`/blog/${slug}`));

  // Upload tiny PNG
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const form = new FormData();
  form.append("kind", "blog");
  form.append("file", new Blob([png], { type: "image/png" }), "pixel.png");
  const upload = await fetch(`${BASE}/api/admin/uploads`, {
    method: "POST",
    headers: { "x-csrf-token": csrf, Cookie: cookies },
    body: form,
  });
  const uploadJson = await upload.json();
  record("blog image upload", Boolean(uploadJson?.ok && uploadJson?.uploaded?.url), uploadJson?.uploaded?.url || "");
  if (uploadJson?.uploaded?.url) {
    const media = await req(`${BASE}${uploadJson.uploaded.url}`);
    record("media persistence GET", media.res.status === 200, `status=${media.res.status}`);
  }

  const unpublish = await req(`${BASE}/api/admin/blog/${postId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "draft", expectedVersion: publish.json.post.contentVersion }),
  });
  record("unpublish", Boolean(unpublish.json?.ok && unpublish.json?.post?.status === "draft"));
  const gone = await req(`${BASE}/blog/${slug}`);
  record("unpublished removed", gone.res.status === 404, `status=${gone.res.status}`);

  const home = await req(`${BASE}/`);
  record("homepage intact", home.res.status === 200 && home.text.toLowerCase().includes("zain"));

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
