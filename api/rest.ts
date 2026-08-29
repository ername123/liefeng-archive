import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { setCookie, deleteCookie } from "hono/cookie";
import { eq, and, desc, asc } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { users, exampleNotes, userNotes, posts, comments, resources, chapters, subjects } from "@db/schema";
import { getCurrentUser, signToken, AUTH_COOKIE, AUTH_MAX_AGE } from "./lib/auth";

/** 把用户对象里的敏感字段去掉后再返回给前端 */
function publicUser(u: typeof users.$inferSelect) {
  return { id: u.id, username: u.username, email: u.email, role: u.role };
}

/** 生成一个新 ID（用 UUID，简单且不引入额外依赖） */
function newId() {
  return randomUUID();
}

/** 注册所有新增的 REST 路由 */
export function registerRestRoutes(app: Hono<{ Bindings: HttpBindings }>) {
  /* ============ 认证 ============ */

  // 注册
  app.post("/api/auth/register", async (c) => {
    const body = await c.req.json();
    const username = String(body?.username ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    if (!username || !email || password.length < 6) {
      return c.json({ error: "请填写用户名、邮箱和至少 6 位密码" }, 400);
    }
    const db = getDb();
    const exists = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (exists.length) return c.json({ error: "用户名已存在" }, 409);
    const emailExists = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (emailExists.length) return c.json({ error: "邮箱已被注册" }, 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({ id: newId(), username, email, passwordHash, role: "USER" })
      .returning();
    setCookie(c, AUTH_COOKIE, signToken(user.id), {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
      maxAge: AUTH_MAX_AGE,
    });
    return c.json({ user: publicUser(user) });
  });

  // 登录
  app.post("/api/auth/login", async (c) => {
    const body = await c.req.json();
    const account = String(body?.account ?? "").trim();
    const password = String(body?.password ?? "");
    const db = getDb();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.username, account))
      .limit(1);
    const emailRows = rows.length
      ? rows
      : await db.select().from(users).where(eq(users.email, account.toLowerCase())).limit(1);
    const user = rows.length ? rows[0] : emailRows[0];
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return c.json({ error: "账号或密码错误" }, 401);
    }
    setCookie(c, AUTH_COOKIE, signToken(user.id), {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
      maxAge: AUTH_MAX_AGE,
    });
    return c.json({ user: publicUser(user) });
  });

  // 退出
  app.post("/api/auth/logout", (c) => {
    deleteCookie(c, AUTH_COOKIE, { path: "/" });
    return c.json({ ok: true });
  });

  // 当前用户
  app.get("/api/auth/me", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) return c.json({ error: "未登录" }, 401);
    return c.json({ user: publicUser(user) });
  });

  /* ============ 示例笔记（公开） ============ */

  app.get("/api/examples/:chapterId", async (c) => {
    const chapterId = Number(c.req.param("chapterId"));
    if (!Number.isFinite(chapterId)) return c.json({ error: "参数错误" }, 400);
    const db = getDb();
    const row = await db
      .select()
      .from(exampleNotes)
      .where(eq(exampleNotes.chapterId, chapterId))
      .limit(1);
    return c.json({ content: row[0]?.content ?? "" });
  });

  /* ============ 个人笔记（需登录） ============ */

  // 当前用户的全部个人笔记（个人中心用）
  app.get("/api/notes", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) return c.json({ error: "请先登录" }, 401);
    const db = getDb();
    const rows = await db
      .select({
        id: userNotes.id,
        chapterId: userNotes.chapterId,
        content: userNotes.content,
        updatedAt: userNotes.updatedAt,
        chapterTitle: chapters.title,
        subjectSlug: subjects.slug,
      })
      .from(userNotes)
      .leftJoin(chapters, eq(userNotes.chapterId, chapters.id))
      .leftJoin(subjects, eq(chapters.subjectId, subjects.id))
      .where(eq(userNotes.userId, user.id))
      .orderBy(desc(userNotes.updatedAt));
    return c.json({ notes: rows });
  });

  // 某章节的个人笔记
  app.get("/api/notes/:chapterId", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) return c.json({ error: "请先登录" }, 401);
    const chapterId = Number(c.req.param("chapterId"));
    if (!Number.isFinite(chapterId)) return c.json({ error: "参数错误" }, 400);
    const db = getDb();
    const rows = await db
      .select()
      .from(userNotes)
      .where(and(eq(userNotes.userId, user.id), eq(userNotes.chapterId, chapterId)))
      .limit(1);
    return c.json({ content: rows[0]?.content ?? "" });
  });

  // 保存/更新个人笔记（upsert）
  app.post("/api/notes/:chapterId", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) return c.json({ error: "请先登录" }, 401);
    const chapterId = Number(c.req.param("chapterId"));
    if (!Number.isFinite(chapterId)) return c.json({ error: "参数错误" }, 400);
    const body = await c.req.json();
    const content = String(body?.content ?? "");
    const db = getDb();
    const rows = await db
      .select()
      .from(userNotes)
      .where(and(eq(userNotes.userId, user.id), eq(userNotes.chapterId, chapterId)))
      .limit(1);
    if (rows.length) {
      await db
        .update(userNotes)
        .set({ content, updatedAt: new Date() })
        .where(eq(userNotes.id, rows[0].id));
      return c.json({ ok: true });
    }
    await db.insert(userNotes).values({ id: newId(), userId: user.id, chapterId, content });
    return c.json({ ok: true });
  });

  /* ============ 经验帖 ============ */

  // 公开列表；?mine=1 时只返回当前用户的
  app.get("/api/experiences", async (c) => {
    const db = getDb();
    const mine = c.req.query("mine") === "1";
    const user = await getCurrentUser(c);
    const where = mine && user ? eq(posts.userId, user.id) : eq(posts.isPublic, true);
    const rows = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        content: posts.content,
        tags: posts.tags,
        isPublic: posts.isPublic,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: users.username,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(where)
      .orderBy(desc(posts.createdAt));
    return c.json({ posts: rows });
  });

  // 详情
  app.get("/api/experiences/:id", async (c) => {
    const db = getDb();
    const rows = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        content: posts.content,
        tags: posts.tags,
        isPublic: posts.isPublic,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: users.username,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, c.req.param("id")))
      .limit(1);
    if (!rows.length) return c.json({ error: "帖子不存在" }, 404);
    return c.json({ post: rows[0] });
  });

  // 发布（需登录）
  app.post("/api/experiences", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) return c.json({ error: "请先登录" }, 401);
    const body = await c.req.json();
    const title = String(body?.title ?? "").trim();
    const content = String(body?.content ?? "").trim();
    if (!title || !content) return c.json({ error: "标题和内容不能为空" }, 400);
    const db = getDb();
    const [post] = await db
      .insert(posts)
      .values({
        id: newId(),
        userId: user.id,
        title,
        content,
        tags: String(body?.tags ?? "").trim() || null,
        isPublic: body?.isPublic !== false,
      })
      .returning();
    return c.json({ post });
  });

  // 删除（需登录 + 作者本人）
  app.delete("/api/experiences/:id", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) return c.json({ error: "请先登录" }, 401);
    const db = getDb();
    const rows = await db.select().from(posts).where(eq(posts.id, c.req.param("id"))).limit(1);
    if (!rows.length) return c.json({ error: "帖子不存在" }, 404);
    if (rows[0].userId !== user.id && user.role !== "ADMIN") {
      return c.json({ error: "没有权限" }, 403);
    }
    await db.delete(comments).where(eq(comments.postId, rows[0].id));
    await db.delete(posts).where(eq(posts.id, rows[0].id));
    return c.json({ ok: true });
  });

  /* ============ 评论 ============ */

  // 某帖子的评论列表（公开）
  app.get("/api/comments", async (c) => {
    const postId = c.req.query("postId");
    if (!postId) return c.json({ error: "缺少 postId" }, 400);
    const db = getDb();
    const rows = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        author: users.username,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));
    return c.json({ comments: rows });
  });

  // 发表评论（需登录）
  app.post("/api/comments", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) return c.json({ error: "请先登录" }, 401);
    const body = await c.req.json();
    const postId = String(body?.postId ?? "");
    const content = String(body?.content ?? "").trim();
    if (!postId || !content) return c.json({ error: "评论内容不能为空" }, 400);
    const db = getDb();
    const [comment] = await db
      .insert(comments)
      .values({ id: newId(), postId, userId: user.id, content })
      .returning();
    return c.json({ comment });
  });

  // 删除评论（需登录 + 作者本人）
  app.delete("/api/comments/:id", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) return c.json({ error: "请先登录" }, 401);
    const db = getDb();
    const rows = await db.select().from(comments).where(eq(comments.id, c.req.param("id"))).limit(1);
    if (!rows.length) return c.json({ error: "评论不存在" }, 404);
    if (rows[0].userId !== user.id && user.role !== "ADMIN") {
      return c.json({ error: "没有权限" }, 403);
    }
    await db.delete(comments).where(eq(comments.id, rows[0].id));
    return c.json({ ok: true });
  });

  /* ============ 资源管理（管理员） ============ */

  app.get("/api/resources", async (c) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(resources)
      .orderBy(asc(resources.category), asc(resources.grp), asc(resources.sortOrder));
    return c.json({ resources: rows });
  });

  app.post("/api/resources", async (c) => {
    const user = await getCurrentUser(c);
    if (!user || user.role !== "ADMIN") return c.json({ error: "需要管理员权限" }, 403);
    const body = await c.req.json();
    const db = getDb();
    const [row] = await db
      .insert(resources)
      .values({
        category: String(body?.category ?? ""),
        grp: String(body?.grp ?? ""),
        title: String(body?.title ?? ""),
        url: String(body?.url ?? ""),
        description: String(body?.description ?? ""),
        sortOrder: Number(body?.sortOrder ?? 0),
      })
      .returning();
    return c.json({ resource: row });
  });

  app.put("/api/resources/:id", async (c) => {
    const user = await getCurrentUser(c);
    if (!user || user.role !== "ADMIN") return c.json({ error: "需要管理员权限" }, 403);
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = getDb();
    const [row] = await db
      .update(resources)
      .set({
        category: String(body?.category ?? ""),
        grp: String(body?.grp ?? ""),
        title: String(body?.title ?? ""),
        url: String(body?.url ?? ""),
        description: String(body?.description ?? ""),
        sortOrder: Number(body?.sortOrder ?? 0),
      })
      .where(eq(resources.id, id))
      .returning();
    return c.json({ resource: row });
  });

  app.delete("/api/resources/:id", async (c) => {
    const user = await getCurrentUser(c);
    if (!user || user.role !== "ADMIN") return c.json({ error: "需要管理员权限" }, 403);
    const id = Number(c.req.param("id"));
    const db = getDb();
    await db.delete(resources).where(eq(resources.id, id));
    return c.json({ ok: true });
  });
}