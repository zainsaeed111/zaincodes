import { NextRequest } from "next/server";
import { z } from "zod";
import {
  authenticateAdmin,
  COOKIE_NAME,
  createSession,
  SESSION_TTL_SECONDS,
} from "@/lib/auth";
import { mintCsrfToken, attachCsrfCookie } from "@/lib/csrf";
import { apiError, apiOk, handleRouteError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const limited = rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
    if (!limited.allowed) {
      return apiError("RATE_LIMITED", "Too many login attempts. Try again later.");
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid credentials payload.", parsed.error.flatten());
    }

    const user = await authenticateAdmin(parsed.data.email, parsed.data.password);
    if (!user) {
      return apiError("UNAUTHORIZED", "Invalid email or password.");
    }

    const { token } = await createSession(
      { id: user.id, email: user.email, role: user.role },
      { ip, userAgent: req.headers.get("user-agent") || undefined },
    );

    const csrf = mintCsrfToken();
    const res = apiOk({
      user: { id: user.id, email: user.email, role: user.role },
      csrfToken: csrf,
    });
    // Attach session on the returned response (more reliable than cookies() alone).
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return attachCsrfCookie(res, csrf);
  } catch (err) {
    return handleRouteError(err);
  }
}
