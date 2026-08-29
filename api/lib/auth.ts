import { createHmac, timingSafeEqual } from "node:crypto";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { env } from "./env";

// 登录 Cookie 名称
export const AUTH_COOKIE = "liefeng_auth";
// Cookie 有效期：30 天
export const AUTH_MAX_AGE = 60 * 60 * 24 * 30;

/** 生成登录令牌：base64url(userId.exp) + HMAC-SHA256 签名 */
export function signToken(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + AUTH_MAX_AGE;
  const payload = Buffer.from(`${userId}.${exp}`).toString("base64url");
  const sig = createHmac("sha256", env.appSecret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

/** 校验令牌：合法则返回 userId，否则返回 null */
export function verifyToken(token: string): string | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = createHmac("sha256", env.appSecret)
      .update(payload)
      .digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const raw = Buffer.from(payload, "base64url").toString("utf8");
    const dot = raw.lastIndexOf(".");
    const userId = raw.slice(0, dot);
    const exp = Number(raw.slice(dot + 1));
    if (!userId || !Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return userId;
  } catch {
    return null;
  }
}

/** 从 Cookie 中解析当前用户；未登录返回 null */
export async function getCurrentUser(c: Context) {
  const token = getCookie(c, AUTH_COOKIE);
  const userId = token ? verifyToken(token) : null;
  if (!userId) return null;
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0] ?? null;
}

/** 要求登录；未登录返回 401 JSON */
export async function requireUser(c: Context) {
  const user = await getCurrentUser(c);
  if (!user) {
    return { user: null as null, error: c.json({ error: "请先登录" }, 401) };
  }
  return { user, error: null };
}

/** 要求管理员；非管理员返回 403 JSON */
export async function requireAdmin(c: Context) {
  const user = await getCurrentUser(c);
  if (!user) {
    return { user: null as null, error: c.json({ error: "请先登录" }, 401) };
  }
  if (user.role !== "ADMIN") {
    return { user: null as null, error: c.json({ error: "需要管理员权限" }, 403) };
  }
  return { user, error: null };
}