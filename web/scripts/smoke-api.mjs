const base = process.env.SMOKE_BASE_URL || "http://localhost:3001";

async function req(path, options = {}) {
  const res = await fetch(`${base}${path}`, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json, headers: res.headers };
}

function cookieHeader(setCookie) {
  return (setCookie || []).map((c) => c.split(";")[0]).join("; ");
}

async function main() {
  const results = [];

  const publicProjects = await req("/api/projects");
  const projectList = publicProjects.json.projects || [];
  const requiredSlugs = [
    "campus-insight-ii-skans",
    "rabbet-paylink-fintech",
    "parrotpal-ai-calorie-tracker",
    "forsa-multivendor-ecommerce",
    "baby-sos-childcare",
    "jkl-therapy-medical",
    "foxtinn-hotel-operations",
    "flutter-web-ecommerce",
  ];
  const hasAll = requiredSlugs.every((slug) => projectList.some((p) => p.slug === slug));
  const fieldsOk = projectList
    .filter((p) => requiredSlugs.includes(p.slug))
    .every((p) => p.problem && p.solution && p.architecture && p.githubLink);
  results.push({
    name: "GET /api/projects",
    pass: publicProjects.status === 200 && publicProjects.json.count >= 8 && hasAll && fieldsOk,
    detail: `status=${publicProjects.status} count=${publicProjects.json.count} slugs=${hasAll} fields=${fieldsOk}`,
  });

  const home = await req("/api/content/home");
  results.push({
    name: "GET /api/content/home",
    pass: home.status === 200 && home.json.ok === true,
    detail: `status=${home.status}`,
  });

  const anonAdmin = await req("/api/admin/projects");
  results.push({
    name: "GET /api/admin/projects anonymous",
    pass: anonAdmin.status === 401,
    detail: `status=${anonAdmin.status}`,
  });

  const anonWrite = await req("/api/admin/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "nope" }),
  });
  results.push({
    name: "POST /api/admin/projects anonymous",
    pass: anonWrite.status === 401,
    detail: `status=${anonWrite.status}`,
  });

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    results.push({ name: "login flow", pass: false, detail: "missing bootstrap env" });
  } else {
    const login = await req("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const setCookie = login.headers.getSetCookie?.() || [];
    const cookies = cookieHeader(setCookie);
    const csrf = login.json.csrfToken;
    results.push({
      name: "POST /api/auth/login",
      pass: login.status === 200 && Boolean(cookies) && Boolean(csrf),
      detail: `status=${login.status} cookie=${Boolean(cookies)} csrf=${Boolean(csrf)}`,
    });

    const me = await req("/api/auth/me", { headers: { Cookie: cookies } });
    results.push({
      name: "GET /api/auth/me authenticated",
      pass: me.status === 200 && me.json.authenticated === true,
      detail: `status=${me.status}`,
    });

    const adminProjects = await req("/api/admin/projects", { headers: { Cookie: cookies } });
    results.push({
      name: "GET /api/admin/projects authenticated",
      pass: adminProjects.status === 200 && adminProjects.json.count >= 8,
      detail: `status=${adminProjects.status} count=${adminProjects.json.count}`,
    });

    const noCsrf = await req("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookies },
      body: JSON.stringify({ title: "x" }),
    });
    results.push({
      name: "POST admin without CSRF",
      pass: noCsrf.status === 403,
      detail: `status=${noCsrf.status}`,
    });

    const smokeSlug = `smoke-temp-${Date.now()}`;
    const withCsrf = await req("/api/admin/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${cookies}; zaincodes_csrf=${csrf}`,
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({
        title: "Smoke Temp Project",
        slug: smokeSlug,
        category: "web",
        description: "Temporary smoke project",
        status: "draft",
      }),
    });
    const createdId = withCsrf.json?.project?.id;
    results.push({
      name: "POST admin project with CSRF",
      pass: withCsrf.status === 200 && Boolean(createdId),
      detail: `status=${withCsrf.status} id=${createdId || "none"}`,
    });

    if (createdId) {
      const del = await req(`/api/admin/projects/${createdId}`, {
        method: "DELETE",
        headers: {
          Cookie: `${cookies}; zaincodes_csrf=${csrf}`,
          "x-csrf-token": csrf,
        },
      });
      results.push({
        name: "DELETE admin smoke project",
        pass: del.status === 200,
        detail: `status=${del.status}`,
      });
    }

    // Tiny valid PDF for upload foundation check
    const pdfBytes = Buffer.from(
      "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n",
      "utf8",
    );
    const form = new FormData();
    form.append("kind", "resumes");
    form.append("file", new Blob([pdfBytes], { type: "application/pdf" }), "smoke-resume.pdf");
    const upload = await fetch(`${base}/api/admin/uploads`, {
      method: "POST",
      headers: {
        Cookie: `${cookies}; zaincodes_csrf=${csrf}`,
        "x-csrf-token": csrf,
      },
      body: form,
    });
    const uploadJson = await upload.json();
    results.push({
      name: "POST /api/admin/uploads resume",
      pass: upload.status === 200 && uploadJson.ok === true,
      detail: `status=${upload.status}`,
    });

    const resumeGet = await req("/api/resume");
    results.push({
      name: "GET /api/resume after upload",
      pass: resumeGet.status === 200,
      detail: `status=${resumeGet.status}`,
    });

    const anonUpload = await fetch(`${base}/api/admin/uploads`, {
      method: "POST",
      body: form,
    });
    results.push({
      name: "POST /api/admin/uploads anonymous",
      pass: anonUpload.status === 401,
      detail: `status=${anonUpload.status}`,
    });

    const logout = await req("/api/auth/logout", {
      method: "POST",
      headers: { Cookie: cookies },
    });
    results.push({
      name: "POST /api/auth/logout",
      pass: logout.status === 200,
      detail: `status=${logout.status}`,
    });

    const meAfter = await req("/api/auth/me", { headers: { Cookie: cookies } });
    results.push({
      name: "GET /api/auth/me after logout revocation",
      pass: meAfter.status === 401,
      detail: `status=${meAfter.status}`,
    });
  }

  let failed = 0;
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name} — ${r.detail}`);
    if (!r.pass) failed += 1;
  }
  if (failed) process.exit(1);
  console.log(`All ${results.length} smoke checks passed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
