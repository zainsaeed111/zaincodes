import { NextResponse } from "next/server";
import { checkDbHealth } from "@/db/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Lightweight DB ping so Neon free compute does not stay cold for long.
 * Protected by CRON_SECRET when set (Vercel Cron sends Authorization: Bearer).
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET?.trim();
  if (expected) {
    const auth = request.headers.get("authorization") || "";
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const db = await checkDbHealth();
  return NextResponse.json(
    {
      ok: db.ok,
      keepAlive: true,
      database: db.detail,
      time: new Date().toISOString(),
    },
    { status: db.ok ? 200 : 503 },
  );
}
