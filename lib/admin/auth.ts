import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * The admin login. One secret: ADMIN_PASSWORD, set by Abhinav on Vercel. Nothing here has a default password.
 * The cookie is "v1.<expiry ms>.<HMAC-SHA256 of 'v1.<expiry ms>'>", signed with a key derived from the password
 * and a fixed label. Changing the password changes the key, so every open session is logged out.
 */
export const ADMIN_COOKIE = "od_admin";
/** A login lasts 7 days. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** The fixed label the cookie key is derived with. Bump it to log everyone out without a new password. */
export const KEY_LABEL = "onlydevs-admin-v1";
const VERSION = "v1";

/** Login attempts per IP per window. In memory per server instance (lib/ogi/rateLimit.ts). */
export const LOGIN_LIMIT = 5;
export const LOGIN_WINDOW_MS = 15 * 60_000;

type Env = Record<string, string | undefined>;

/** The password, or null when admin is not set up. Only ever from the environment. */
export function adminPassword(env: Env = process.env): string | null {
  const password = env.ADMIN_PASSWORD;
  return password && password.length > 0 ? password : null;
}

/** The cookie key: HMAC-SHA256 keyed with the password, over the fixed label. */
export function sessionKey(password: string): Buffer {
  return createHmac("sha256", password).update(KEY_LABEL).digest();
}

const sign = (key: Buffer, payload: string) => createHmac("sha256", key).update(payload).digest("base64url");

/** Constant-time compare. Hashing first gives both sides the same length, so length leaks nothing either. */
export function sameText(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(given: unknown, expected: string) {
  return typeof given === "string" && given.length > 0 && given.length <= 512 && sameText(given, expected);
}

export function signSession(password: string, now = Date.now(), ttlMs = SESSION_TTL_MS) {
  const payload = `${VERSION}.${now + ttlMs}`;
  return `${payload}.${sign(sessionKey(password), payload)}`;
}

/** True for an untouched, unexpired cookie signed with this password's key. */
export function verifySession(token: string | undefined, password: string, now = Date.now()) {
  if (!token || token.length > 200) return false;
  const m = /^(v1\.(\d{13}))\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!m) return false;
  const [, payload, expiry, sig] = m;
  if (!sameText(sig, sign(sessionKey(password), payload))) return false;
  const expiresAt = Number(expiry);
  // A cookie good for longer than one login lasts was not made here.
  return expiresAt > now && expiresAt <= now + SESSION_TTL_MS;
}

export function isAdmin(cookieValue: string | undefined, env: Env = process.env, now = Date.now()) {
  const password = adminPassword(env);
  return password !== null && verifySession(cookieValue, password, now);
}

export function sessionCookieOptions(env: Env = process.env) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
