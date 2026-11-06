import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { apiError, apiOk, fromZodError, handleRouteError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  platform: z.string().max(80).optional(),
  message: z.string().min(10).max(5000),
  website: z.string().max(0).optional(), // honeypot must be empty
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const limited = rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
    if (!limited.allowed) return apiError("RATE_LIMITED", "Too many messages. Try again later.");

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);
    if (parsed.data.website) {
      // Bot filled honeypot — pretend success without storing.
      return apiOk({ received: true });
    }

    await ensureSchema();
    const db = getDb();
    await db.insert(contactMessages).values({
      name: parsed.data.name,
      email: parsed.data.email,
      platform: parsed.data.platform || null,
      message: parsed.data.message,
      status: "new",
    });

    // Email delivery BLOCKED until RESEND_API_KEY / SMTP is provisioned.
    // Message is persisted locally for admin review.
    return apiOk({
      received: true,
      delivery: process.env.RESEND_API_KEY ? "queued" : "stored_local_only",
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
