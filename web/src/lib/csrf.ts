import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const CSRF_COOKIE = "zaincodes_csrf";
export const CSRF_HEADER = "x-csrf-token";

function getCsrfSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET required for CSRF.");
  }
  return secret;
}

export function mintCsrfToken() {
  const nonce = randomBytes(24).toString("hex");
  const sig = createHmac("sha256", getCsrfSecret()).update(nonce).digest("hex");
  return `${nonce}.${sig}`;
}

export function verifyCsrfToken(token: string | null | undefined) {
  if (!token || !token.includes(".")) return false;
  const [nonce, sig] = token.split(".");
  if (!nonce || !sig) return false;
  const expected = createHmac("sha256", getCsrfSecret()).update(nonce).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function setCsrfCookie(token: string) {
  const jar = await cookies();
  jar.set(CSRF_COOKIE, token, {
    httpOnly: false, // readable by JS for double-submit header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function assertCsrf(req: NextRequest) {
  const header = req.headers.get(CSRF_HEADER);
  const cookie = req.cookies.get(CSRF_COOKIE)?.value;
  if (!header || !cookie || header !== cookie || !verifyCsrfToken(header)) {
    return false;
  }
  return true;
}

export function attachCsrfCookie(res: NextResponse, token: string) {
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
