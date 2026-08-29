import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import fs from "fs";
import path from "path";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// 上传图片的存储目录（平台可持久化区域）
const UPLOAD_DIR = "/mnt/agents/output/uploads";
const UPLOAD_ROUTE = "/uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 图片上传：POST /api/upload
app.post("/api/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!(file instanceof File)) {
      return c.json({ error: "缺少文件字段 file" }, 400);
    }
    if (!file.type.startsWith("image/")) {
      return c.json({ error: "仅支持图片文件" }, 400);
    }
    const ext = path.extname(file.name).toLowerCase() || `.${file.type.split("/")[1] || "png"}`;
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const dest = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(dest, Buffer.from(await file.arrayBuffer()));
    return c.json({ url: `${UPLOAD_ROUTE}/${filename}` });
  } catch (e: any) {
    return c.json({ error: e?.message || "上传失败" }, 500);
  }
});

// 提供已上传图片的静态访问
app.get(`${UPLOAD_ROUTE}/:filename`, (c) => {
  const filename = c.req.param("filename");
  const filepath = path.join(UPLOAD_DIR, path.basename(filename));
  if (!fs.existsSync(filepath)) return c.json({ error: "Not Found" }, 404);
  const ext = path.extname(filepath).toLowerCase();
  const mime =
    { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml" }[ext] ||
    "application/octet-stream";
  return new Response(fs.readFileSync(filepath), { headers: { "Content-Type": mime } });
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
