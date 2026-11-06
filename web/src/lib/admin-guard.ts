import { NextRequest } from "next/server";
import { requireAdminMutation, requireAdminSession } from "@/lib/auth";
import { apiError } from "@/lib/http";

export async function guardAdminRead(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return { session: null, error: apiError("UNAUTHORIZED", "Unauthorized") };
  return { session, error: null };
}

export async function guardAdminWrite(req: NextRequest) {
  const { session, csrfOk } = await requireAdminMutation(req);
  if (!session) return { session: null, error: apiError("UNAUTHORIZED", "Unauthorized") };
  if (!csrfOk) return { session: null, error: apiError("FORBIDDEN", "CSRF validation failed.") };
  return { session, error: null };
}
