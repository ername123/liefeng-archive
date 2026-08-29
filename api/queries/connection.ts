import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

// PostgreSQL 连接池：本地与 Railway 都通过 DATABASE_URL 连接。
const pool = new Pool({
  connectionString: env.databaseUrl,
  // Railway 等云平台一般要求 SSL；本地 PostgreSQL 可自动忽略。
  ssl: env.isProduction ? { rejectUnauthorized: false } : undefined,
});

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    instance = drizzle(pool, { schema: fullSchema });
  }
  return instance;
}