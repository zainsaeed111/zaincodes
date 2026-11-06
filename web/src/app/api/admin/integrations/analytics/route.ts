import { NextRequest } from "next/server";
import { ensureSchema, getDb } from "@/db/client";
import { analyticsIntegrations } from "@/db/schema";
import { guardAdminRead } from "@/lib/admin-guard";
import { apiOk, handleRouteError } from "@/lib/http";

/** Returns real metrics only when connected; otherwise honest empty state. */
export async function GET(req: NextRequest) {
  try {
    const { error } = await guardAdminRead(req);
    if (error) return error;
    await ensureSchema();
    const integrations = await getDb().select().from(analyticsIntegrations);
    const gsc = integrations.find((i) => i.provider === "gsc");
    const ga4 = integrations.find((i) => i.provider === "ga4");

    const range = req.nextUrl.searchParams.get("range") || "28d";

    return apiOk({
      range,
      gsc: {
        connected: gsc?.status === "connected",
        source: "Google Search Console",
        metrics:
          gsc?.status === "connected"
            ? null
            : null,
        message:
          gsc?.status === "connected"
            ? "Connected — sync not yet populated for this local environment."
            : "Not connected. Search impressions/clicks unavailable until Search Console OAuth is authorized.",
        rows: [] as Array<{ query?: string; page?: string; clicks: number; impressions: number; ctr: number; position: number }>,
      },
      ga4: {
        connected: ga4?.status === "connected",
        source: "Google Analytics 4",
        message:
          ga4?.status === "connected"
            ? "Connected — sync not yet populated for this local environment."
            : "Not connected. Users/sessions/pageviews unavailable until GA4 OAuth is authorized.",
        metrics: null,
        topPages: [] as Array<{ path: string; views: number }>,
        sources: [] as Array<{ source: string; sessions: number }>,
        countries: [] as Array<{ country: string; users: number }>,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}