import { NextRequest } from "next/server";
import { apiError, handleRouteError } from "@/lib/http";
import { getStorage } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string[] }> },
) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const limited = rateLimit(`media:${ip}`, 120, 60 * 1000);
    if (!limited.allowed) return apiError("RATE_LIMITED", "Too many media requests.");

    const { key: parts } = await context.params;
    const key = parts.join("/");
    const storage = getStorage();
    const file = await storage.read(key);
    if (!file) return apiError("NOT_FOUND", "File not found.");

    return new Response(new Uint8Array(file.data), {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
