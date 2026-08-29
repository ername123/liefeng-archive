import "dotenv/config";

export const env = {
  appId: process.env.APP_ID || "liefeng",
  appSecret: process.env.APP_SECRET || "liefeng-dev-secret",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL || "file:./sqlite.db",
};