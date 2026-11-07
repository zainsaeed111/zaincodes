import { describe, expect, it, beforeAll } from "vitest";
import fs from "node:fs";
import { __resetRateLimitsForTests, rateLimit } from "../src/lib/rate-limit";
import { mintCsrfToken, verifyCsrfToken } from "../src/lib/csrf";
import { isPdfBuffer } from "../src/lib/storage";
import { createLocalStorageAdapter } from "../src/lib/storage/local";
import { hashPassword, verifyPassword } from "../src/lib/auth";
import { ensureSchema, getDb, getDataDir } from "../src/db/client";
import { projects } from "../src/db/schema";
import { count, eq } from "drizzle-orm";

describe("rate limiting", () => {
  it("blocks after limit", () => {
    __resetRateLimitsForTests();
    expect(rateLimit("t1", 2, 60_000).allowed).toBe(true);
    expect(rateLimit("t1", 2, 60_000).allowed).toBe(true);
    expect(rateLimit("t1", 2, 60_000).allowed).toBe(false);
  });
});

describe("csrf", () => {
  beforeAll(() => {
    if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
      process.env.AUTH_SECRET = "test-auth-secret-with-32plus-chars!!";
    }
  });

  it("mints and verifies tokens", () => {
    const token = mintCsrfToken();
    expect(verifyCsrfToken(token)).toBe(true);
    expect(verifyCsrfToken("tampered." + token.split(".")[1])).toBe(false);
  });
});

describe("password hashing", () => {
  it("verifies bcrypt hashes", async () => {
    const hash = await hashPassword("LocalDev-TestPass-123");
    expect(await verifyPassword("LocalDev-TestPass-123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("pdf magic bytes", () => {
  it("detects pdf headers", () => {
    expect(isPdfBuffer(Buffer.from("%PDF-1.4\n"))).toBe(true);
    expect(isPdfBuffer(Buffer.from("not-a-pdf"))).toBe(false);
  });
});

describe("local storage", () => {
  it("stores and reads files under safe keys", async () => {
    const prev = process.env.PGLITE_DATA_DIR;
    // storage uses getWebRoot(); uploads go under web/.data/uploads
    const adapter = createLocalStorageAdapter();
    const stored = await adapter.put(
      "brand",
      "logo.png",
      Buffer.from([137, 80, 78, 71]),
      "image/png",
    );
    expect(stored.key.startsWith("brand/")).toBe(true);
    const read = await adapter.read(stored.key);
    expect(read?.data.length).toBe(4);
    await adapter.delete(stored.key);
    expect(await adapter.exists(stored.key)).toBe(false);
    if (prev) process.env.PGLITE_DATA_DIR = prev;
  });

  it("rejects path traversal keys", async () => {
    const adapter = createLocalStorageAdapter();
    await expect(adapter.read("../secret")).rejects.toThrow();
  });
});

describe("database integrity", () => {
  it("has schema and can query projects table", async () => {
    await ensureSchema();
    const db = getDb();
    const [{ value }] = await db.select({ value: count() }).from(projects);
    expect(typeof value).toBe("number");
    expect(value).toBeGreaterThanOrEqual(0);
    // If already seeded in this data dir, enforce field presence
    if (value >= 8) {
      const rows = await db.select().from(projects);
      for (const row of rows) {
        expect(row.slug).toBeTruthy();
        expect(row.title).toBeTruthy();
        expect(row.category).toBeTruthy();
      }
      const sample = rows.find((r) => r.slug === "campus-insight-ii-skans");
      if (sample) {
        expect(sample.problem).toBeTruthy();
        expect(sample.githubLink).toBeTruthy();
      }
    }
    expect(fs.existsSync(getDataDir())).toBe(true);
  });

  it("upserts by slug without dropping required columns conceptually", async () => {
    await ensureSchema();
    const db = getDb();
    const slug = `tmp-foundation-${Date.now()}`;
    await db.insert(projects).values({
      slug,
      title: "Temp",
      category: "web-development",
      problem: "p",
      solution: "s",
      architecture: "a",
      githubLink: "https://github.com/example",
      status: "draft",
    });
    try {
      await db
        .update(projects)
        .set({ title: "Temp Updated", problem: "p2" })
        .where(eq(projects.slug, slug));
      const [row] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
      expect(row.title).toBe("Temp Updated");
      expect(row.problem).toBe("p2");
      expect(row.githubLink).toBe("https://github.com/example");
    } finally {
      await db.delete(projects).where(eq(projects.slug, slug));
    }
  });
});
