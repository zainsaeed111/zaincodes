import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import * as schema from "./schema";

const SCHEMA_VERSION = "phase8-blog-cms-v2";

type AppDb =
  | ReturnType<typeof drizzlePglite<typeof schema>>
  | ReturnType<typeof drizzlePg<typeof schema>>;

type Migrator = {
  exec: (sql: string) => Promise<void>;
  query: <T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: T[] }>;
};

const globalForDb = globalThis as unknown as {
  pglite?: PGlite;
  pgSql?: ReturnType<typeof postgres>;
  db?: AppDb;
  schemaReady?: Promise<void>;
  appliedSchemaVersion?: string;
};

function getWebRoot() {
  return path.resolve(__dirname, "..", "..");
}

export function useExternalPostgres() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDataDir() {
  const configured = process.env.PGLITE_DATA_DIR;
  const dir = configured
    ? path.isAbsolute(configured)
      ? configured
      : path.resolve(/* turbopackIgnore: true */ getWebRoot(), configured)
    : path.join(/* turbopackIgnore: true */ getWebRoot(), ".data", "pglite");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getPGlite() {
  if (!globalForDb.pglite) {
    globalForDb.pglite = new PGlite(getDataDir());
  }
  return globalForDb.pglite;
}

function getPostgresSql() {
  if (!globalForDb.pgSql) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) throw new Error("DATABASE_URL is required for Postgres mode.");
    globalForDb.pgSql = postgres(url, {
      max: 5,
      idle_timeout: 20,
      prepare: false,
      ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : "require",
    });
  }
  return globalForDb.pgSql;
}

export function getDb(): AppDb {
  if (!globalForDb.db) {
    if (useExternalPostgres()) {
      globalForDb.db = drizzlePg(getPostgresSql(), { schema });
    } else {
      globalForDb.db = drizzlePglite(getPGlite(), { schema });
    }
  }
  return globalForDb.db;
}

function getMigrator(): Migrator {
  if (useExternalPostgres()) {
    const sql = getPostgresSql();
    return {
      async exec(text: string) {
        await sql.unsafe(text);
      },
      async query<T extends Record<string, unknown> = Record<string, unknown>>(
        text: string,
        params: unknown[] = [],
      ) {
        const rows = (await sql.unsafe(text, params as (string | number | boolean | null)[])) as unknown as T[];
        return { rows: Array.isArray(rows) ? rows : [] };
      },
    };
  }
  const client = getPGlite();
  return {
    async exec(text: string) {
      await client.exec(text);
    },
    async query<T extends Record<string, unknown> = Record<string, unknown>>(
      text: string,
      params: unknown[] = [],
    ) {
      const result = await client.query<T>(text, params);
      return { rows: result.rows };
    },
  };
}

export async function checkDbHealth(): Promise<{ ok: boolean; detail: string }> {
  try {
    await ensureSchema();
    const m = getMigrator();
    const r = await m.query<{ ok: number }>("SELECT 1::int AS ok");
    if (!r.rows.length) return { ok: false, detail: "empty health result" };
    return {
      ok: true,
      detail: useExternalPostgres() ? "postgres" : "pglite",
    };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : "db health failed" };
  }
}

const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jti TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS auth_sessions_jti_idx ON auth_sessions(jti);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  brand_name TEXT NOT NULL DEFAULT 'ZainCodes',
  theme TEXT NOT NULL DEFAULT 'dark',
  whatsapp_e164 TEXT,
  footer_blurb TEXT,
  resume_link TEXT,
  logo_url TEXT,
  blog_monetization_enabled INTEGER NOT NULL DEFAULT 0,
  adsense_client_id TEXT,
  affiliate_disclosure TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hero_content (
  id SERIAL PRIMARY KEY,
  badge TEXT,
  badge_enabled INTEGER NOT NULL DEFAULT 1,
  greeting TEXT,
  title TEXT,
  description TEXT,
  avatar_url TEXT,
  stat_apps INTEGER DEFAULT 0,
  stat_years INTEGER DEFAULT 0,
  stat_satisfaction INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_content (
  id SERIAL PRIMARY KEY,
  subtitle TEXT,
  intro_title TEXT,
  intro_text TEXT,
  location TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  experience_summary TEXT,
  education_summary TEXT,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience_entries (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  summary TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS education_entries (
  id SERIAL PRIMARY KEY,
  school TEXT NOT NULL,
  degree TEXT,
  field TEXT,
  start_date TEXT,
  end_date TEXT,
  summary TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact_content (
  id SERIAL PRIMARY KEY,
  email TEXT,
  phone TEXT,
  location TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  platform TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skill_categories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 80,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  capabilities JSONB DEFAULT '[]'::jsonb,
  href TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_idx ON services(slug);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  legacy_id INTEGER,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  problem TEXT,
  solution TEXT,
  architecture TEXT,
  technologies JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '[]'::jsonb,
  cover_url TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  preview_style TEXT NOT NULL DEFAULT 'banner',
  play_store_link TEXT,
  live_link TEXT,
  github_link TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_idx ON projects(slug);

CREATE TABLE IF NOT EXISTS project_images (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS blog_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS blog_categories_slug_idx ON blog_categories(slug);

CREATE TABLE IF NOT EXISTS blog_tags (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS blog_tags_slug_idx ON blog_tags(slug);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  body_html TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  category_id INTEGER REFERENCES blog_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  og_image_url TEXT,
  author_name TEXT DEFAULT 'Zain Saeed',
  author_bio TEXT,
  reading_minutes INTEGER DEFAULT 1,
  content_version INTEGER NOT NULL DEFAULT 1,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS blog_post_tags_unique ON blog_post_tags(post_id, tag_id);

CREATE TABLE IF NOT EXISTS blog_post_revisions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  body_html TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_slug_redirects (
  id SERIAL PRIMARY KEY,
  from_slug TEXT NOT NULL,
  to_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS blog_slug_redirects_from_idx ON blog_slug_redirects(from_slug);

CREATE TABLE IF NOT EXISTS analytics_integrations (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  property_id TEXT,
  token_cipher TEXT,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS analytics_integrations_provider_idx ON analytics_integrations(provider);

CREATE TABLE IF NOT EXISTS resume_assets (
  id SERIAL PRIMARY KEY,
  storage_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  bytes INTEGER NOT NULL DEFAULT 0,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id SERIAL PRIMARY KEY,
  storage_key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  bytes INTEGER NOT NULL DEFAULT 0,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_entries (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  title TEXT,
  description TEXT,
  canonical_url TEXT,
  og_image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS seo_entries_entity_idx ON seo_entries(entity_type, entity_key);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function addColumn(client: Migrator, table: string, column: string, definition: string) {
  try {
    await client.exec(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${definition}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/already exists|duplicate column/i.test(msg)) {
      console.warn(`[db] add column ${table}.${column}:`, msg);
    }
  }
}

async function applySchema() {
  const client = getMigrator();
  // Idempotent DDL — safe to re-run after code upgrades (PGlite local or external Postgres).
  await client.exec(CREATE_SQL);
  await addColumn(client, "site_settings", "logo_url", "TEXT");
  await addColumn(client, "site_settings", "blog_monetization_enabled", "INTEGER NOT NULL DEFAULT 0");
  await addColumn(client, "site_settings", "adsense_client_id", "TEXT");
  await addColumn(client, "site_settings", "affiliate_disclosure", "TEXT");
  try {
    await client.exec("ALTER TABLE services ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '[]'::jsonb");
    await client.exec("ALTER TABLE services ADD COLUMN IF NOT EXISTS href TEXT");
  } catch {
    // ignore
  }
  await addColumn(client, "hero_content", "badge_enabled", "INTEGER NOT NULL DEFAULT 1");
  await addColumn(client, "projects", "preview_style", "TEXT DEFAULT 'banner'");
  try {
    await client.exec("UPDATE projects SET preview_style = 'banner' WHERE preview_style IS NULL");
  } catch (err) {
    console.warn("[db] preview_style migrate:", err instanceof Error ? err.message : err);
  }

  await addColumn(client, "blog_posts", "body_html", "TEXT");
  await addColumn(client, "blog_posts", "featured_image_alt", "TEXT");
  await addColumn(client, "blog_posts", "seo_title", "TEXT");
  await addColumn(client, "blog_posts", "seo_description", "TEXT");
  await addColumn(client, "blog_posts", "canonical_url", "TEXT");
  await addColumn(client, "blog_posts", "og_image_url", "TEXT");
  await addColumn(client, "blog_posts", "author_name", "TEXT DEFAULT 'Zain Saeed'");
  await addColumn(client, "blog_posts", "author_bio", "TEXT");
  await addColumn(client, "blog_posts", "reading_minutes", "INTEGER DEFAULT 1");
  await addColumn(client, "blog_posts", "content_version", "INTEGER NOT NULL DEFAULT 1");
  await addColumn(client, "blog_posts", "scheduled_for", "TIMESTAMPTZ");

  try {
    await client.exec(`
      CREATE TABLE IF NOT EXISTS blog_post_revisions (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        version INTEGER NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        excerpt TEXT,
        body_html TEXT,
        meta JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.exec(`
      CREATE TABLE IF NOT EXISTS blog_slug_redirects (
        id SERIAL PRIMARY KEY,
        from_slug TEXT NOT NULL,
        to_slug TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.exec("CREATE UNIQUE INDEX IF NOT EXISTS blog_slug_redirects_from_idx ON blog_slug_redirects(from_slug)");
    await client.exec(`
      CREATE TABLE IF NOT EXISTS analytics_integrations (
        id SERIAL PRIMARY KEY,
        provider TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'disconnected',
        property_id TEXT,
        token_cipher TEXT,
        last_sync_at TIMESTAMPTZ,
        last_error TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS analytics_integrations_provider_idx ON analytics_integrations(provider)",
    );
  } catch (err) {
    console.warn("[db] blog tables migrate:", err instanceof Error ? err.message : err);
  }

  const cats = [
    ["ai-tools-automation", "AI Tools & Automation"],
    ["web-full-stack-development", "Web & Full-Stack Development"],
    ["mobile-development", "Mobile Development"],
    ["developer-tutorials", "Developer Tutorials"],
    ["technology-trends-analysis", "Technology Trends & Analysis"],
  ];
  for (const [slug, name] of cats) {
    try {
      await client.query(
        `INSERT INTO blog_categories (slug, name)
         SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = $1)`,
        [slug, name],
      );
    } catch (err) {
      console.warn("[db] category seed:", err instanceof Error ? err.message : err);
    }
  }
  for (const provider of ["gsc", "ga4"]) {
    try {
      await client.query(
        `INSERT INTO analytics_integrations (provider, status)
         SELECT $1, 'disconnected' WHERE NOT EXISTS (SELECT 1 FROM analytics_integrations WHERE provider = $1)`,
        [provider],
      );
    } catch (err) {
      console.warn("[db] analytics seed:", err instanceof Error ? err.message : err);
    }
  }

  const existing = await client.query<{ version: string }>(
    "SELECT version FROM schema_migrations WHERE version = $1",
    [SCHEMA_VERSION],
  );
  if (!existing.rows.length) {
    await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [SCHEMA_VERSION]);
  }
  globalForDb.appliedSchemaVersion = SCHEMA_VERSION;
}

export async function ensureSchema() {
  if (globalForDb.appliedSchemaVersion === SCHEMA_VERSION && globalForDb.schemaReady) {
    await globalForDb.schemaReady;
    return;
  }
  globalForDb.schemaReady = applySchema().catch((err) => {
    globalForDb.schemaReady = undefined;
    globalForDb.appliedSchemaVersion = undefined;
    throw err;
  });
  await globalForDb.schemaReady;
}

export type Db = ReturnType<typeof getDb>;
export { SCHEMA_VERSION, getWebRoot };
