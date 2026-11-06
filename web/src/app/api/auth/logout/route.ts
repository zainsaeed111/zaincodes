import { NextRequest } from "next/server";
import {
  clearSessionCookie,
  getSessionFromRequest,
  revokeSessionByJti,
} from "@/lib/auth";
import { apiOk, handleRouteError } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (session?.jti) {
      await revokeSessionByJti(session.jti);
    }
    await clearSessionCookie();
    return apiOk({ loggedOut: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
