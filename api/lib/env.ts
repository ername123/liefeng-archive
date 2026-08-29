import "dotenv/config";

export const env = {
  appId: process.env.APP_ID || "liefeng",
  appSecret: process.env.APP_SECRET || "liefeng-dev-secret",
  isProduction: process.env.NODE_ENV === "production",
  // PostgreSQL 连接字符串，由 .env 或平台环境变量提供。
  databaseUrl: process.env.DATABASE_URL || "",
};