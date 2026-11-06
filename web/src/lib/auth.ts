import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { ensureSchema, getDb } from "@/db/client";
import { authSessions, users } from "@/db/schema";
import { assertCsrf } from "@/lib/csrf";

const COOKIE_NAME = "zaincodes_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: string;
  jti: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(
  user: { id: number; email: string; role: string },
  meta?: { ip?: string; userAgent?: string },
) {
  await ensureSchema();
  const db = getDb();
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db.insert(authSessions).values({
    userId: user.id,
    jti,
    expiresAt,
    ip: meta?.ip || null,
    userAgent: meta?.userAgent || null,
  });

  const token = await new SignJWT({ email: user.email, role: user.role, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  return { token, jti, expiresAt };
}

async function loadActiveSession(jti: string) {
  await ensureSchema();
  const db = getDb();
  const [row] = await db
    .select()
    .from(authSessions)
    .where(and(eq(authSessions.jti, jti), isNull(authSessions.revokedAt)))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  return row;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const jti = typeof payload.jti === "string" ? payload.jti : null;
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string" || !jti) {
      return null;
    }
    const active = await loadActiveSession(jti);
    if (!active) return null;
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      jti,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function revokeSessionByJti(jti: string) {
  await ensureSchema();
  const db = getDb();
  await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(authSessions.jti, jti), isNull(authSessions.revokedAt)));
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdminSession(req?: NextRequest) {
  const session = req ? await getSessionFromRequest(req) : await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

/** Admin mutating routes: session + CSRF */
export async function requireAdminMutation(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return { session: null as SessionPayload | null, csrfOk: false };
  const csrfOk = assertCsrf(req);
  return { session, csrfOk };
}

export async function authenticateAdmin(email: string, password: string) {
  await ensureSchema();
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export { COOKIE_NAME, SESSION_TTL_SECONDS };
