import fs from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const name of [".env.local", ".env"]) {
  const file = resolve(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}

const { ensureSchema, SCHEMA_VERSION, getDb } = await import("../src/db/client.ts");
const { sql } = await import("drizzle-orm");

await ensureSchema();
console.log("applied", SCHEMA_VERSION);
const db = getDb();
const cols = await db.execute(
  sql`select column_name from information_schema.columns where table_name = 'projects' and column_name in ('needs_group_review','work_context') order by column_name`,
);
console.log("project cols", cols);
const types = await db.execute(sql`select slug, name, enabled from project_types order by sort_order`);
console.log("types", types);
const links = await db.execute(sql`select count(*)::int as n from project_type_links`);
console.log("links", links);
const projects = await db.execute(
  sql`select slug, category, work_context, coalesce(needs_group_review, 0) as needs_group_review from projects where status = 'published' order by sort_order`,
);
console.log("projects", projects);
