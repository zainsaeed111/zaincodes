import { NextResponse } from "next/server";
import { SCHEMA_VERSION, checkDbHealth, useExternalPostgres } from "@/db/client";
import { storageDriverName } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await checkDbHealth();
  const storage = storageDriverName();
  const productionReady =
    useExternalPostgres() && (storage === "s3" || storage === "r2");

  const body = {
    ok: db.ok,
    service: "zaincodes-web",
    schemaVersion: SCHEMA_VERSION,
    database: {
      ok: db.ok,
      driver: useExternalPostgres() ? "postgres" : "pglite",
      detail: db.detail,
    },
    storage: {
      driver: storage,
      durable: storage === "s3" || storage === "r2",
    },
    productionPersistenceReady: productionReady,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
    time: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: db.ok ? 200 : 503 });
}
