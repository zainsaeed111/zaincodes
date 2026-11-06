import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../src/db/client";
import { services } from "../src/db/schema";

async function main() {
  await ensureSchema();
  const db = getDb();
  const extras = [
    {
      slug: "custom-software-development",
      title: "Custom Software Development",
      summary:
        "Tailored software shaped around your workflows, integrations, and operational constraints.",
      body: "Internal tools, workflow systems, and productized services with honest scope and maintainable code.",
      sortOrder: 3,
    },
    {
      slug: "desktop-application-development",
      title: "Desktop Application Development",
      summary: "Desktop clients and companion tools when a browser or phone is not the right surface.",
      body: "Desktop-oriented work as part of a broader product system — utilities and operator tools beside web/mobile.",
      sortOrder: 4,
    },
  ];

  for (const svc of extras) {
    const existing = await db.select().from(services).where(eq(services.slug, svc.slug)).limit(1);
    const values = {
      title: svc.title,
      summary: svc.summary,
      body: svc.body,
      status: "published" as const,
      sortOrder: svc.sortOrder,
      updatedAt: new Date(),
    };
    if (existing[0]) {
      await db.update(services).set(values).where(eq(services.id, existing[0].id));
    } else {
      await db.insert(services).values({ slug: svc.slug, ...values });
    }
  }

  const order = [
    "web-development",
    "full-stack-development",
    "mobile-app-development",
    "custom-software-development",
    "desktop-application-development",
    "flutter-development",
    "android-development",
  ];
  for (const [i, slug] of order.entries()) {
    await db
      .update(services)
      .set({ sortOrder: i, status: "published", updatedAt: new Date() })
      .where(eq(services.slug, slug));
  }

  const rows = await db.select().from(services);
  console.log(
    rows
      .map((r) => `${r.sortOrder}:${r.slug}:${r.status}`)
      .sort()
      .join("\n"),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
