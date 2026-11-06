import { mintCsrfToken, attachCsrfCookie } from "@/lib/csrf";
import { apiOk, handleRouteError } from "@/lib/http";
import { requireAdminSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdminSession(req);
    if (!session) {
      return apiOk({ csrfToken: null, authenticated: false });
    }
    const token = mintCsrfToken();
    const res = apiOk({ csrfToken: token, authenticated: true });
    return attachCsrfCookie(res, token);
  } catch (err) {
    return handleRouteError(err);
  }
}
