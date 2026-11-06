import { apiError, apiOk, handleRouteError } from "@/lib/http";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return apiError("UNAUTHORIZED", "Not authenticated.");
    }
    return apiOk({
      authenticated: true,
      user: {
        id: session.sub,
        email: session.email,
        role: session.role,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
