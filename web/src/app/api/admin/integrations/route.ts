import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { analyticsIntegrations, siteSettings } from "@/db/schema";
import { guardAdminRead, guardAdminWrite } from "@/lib/admin-guard";
import { apiOk, fromZodError, handleRouteError } from "@/lib/http";

const monetizationSchema = z.object({
  monetizationEnabled: z.boolean().optional(),
  adsenseClientId: z.string().max(120).nullable().optional(),
  affiliateDisclosure: z.string().max(2000).nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await guardAdminRead(req);
    if (error) return error;
    await ensureSchema();
    const db = getDb();
    const integrations = await db.select().from(analyticsIntegrations);
    const [settings] = await db.select().from(siteSettings).limit(1);

    const gscEnv = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GSC_SITE_URL);
    const ga4Env = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GA4_PROPERTY_ID);

    const byProvider = Object.fromEntries(integrations.map((i) => [i.provider, i]));
    const gsc = byProvider.gsc || { provider: "gsc", status: "disconnected" };
    const ga4 = byProvider.ga4 || { provider: "ga4", status: "disconnected" };

    return apiOk({
      gsc: {
        status: gsc.status,
        propertyId: gsc.propertyId || process.env.GSC_SITE_URL || null,
        envConfigured: gscEnv,
        connected: gsc.status === "connected",
        lastSyncAt: gsc.lastSyncAt || null,
        lastError: gsc.lastError || null,
        nextStep: gsc.status === "connected"
          ? null
          : "Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GSC_SITE_URL to web/.env.local, enable Search Console API, then use Connect (OAuth).",
      },
      ga4: {
        status: ga4.status,
        propertyId: ga4.propertyId || process.env.GA4_PROPERTY_ID || null,
        envConfigured: ga4Env,
        connected: ga4.status === "connected",
        lastSyncAt: ga4.lastSyncAt || null,
        lastError: ga4.lastError || null,
        nextStep: ga4.status === "connected"
          ? null
          : "Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GA4_PROPERTY_ID to web/.env.local, enable Analytics Data API, then use Connect (OAuth).",
      },
      monetization: {
        enabled: Number(settings?.blogMonetizationEnabled || 0) === 1,
        adsenseClientId: settings?.adsenseClientId || null,
        affiliateDisclosure: settings?.affiliateDisclosure || null,
      },
      checklist: {
        blogCms: true,
        database: true,
        publicBlog: true,
        seoMetadata: true,
        sitemap: true,
        searchConsole: gsc.status === "connected",
        ga4: ga4.status === "connected",
        analyticsDashboard: true,
        monetization: Number(settings?.blogMonetizationEnabled || 0) === 1,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const parsed = monetizationSchema.safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);

    await ensureSchema();
    const db = getDb();
    const [settings] = await db.select().from(siteSettings).limit(1);
    if (!settings) {
      return apiOk({ monetization: { enabled: false } });
    }

    const [updated] = await db
      .update(siteSettings)
      .set({
        blogMonetizationEnabled:
          parsed.data.monetizationEnabled === undefined
            ? settings.blogMonetizationEnabled
            : parsed.data.monetizationEnabled
              ? 1
              : 0,
        adsenseClientId:
          parsed.data.adsenseClientId === undefined
            ? settings.adsenseClientId
            : parsed.data.adsenseClientId,
        affiliateDisclosure:
          parsed.data.affiliateDisclosure === undefined
            ? settings.affiliateDisclosure
            : parsed.data.affiliateDisclosure,
        updatedAt: new Date(),
      })
      .returning();

    return apiOk({
      monetization: {
        enabled: Number(updated.blogMonetizationEnabled || 0) === 1,
        adsenseClientId: updated.adsenseClientId,
        affiliateDisclosure: updated.affiliateDisclosure,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
