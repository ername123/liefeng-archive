import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

/** 学科：系统解剖学、生理学…… */
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** 章节笔记：内容以 Markdown 存储，支持 ==高亮== 语法 */
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  subjectId: integer("subjectId").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content").notNull(),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/** 资源导航外链 */
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 大类
  grp: text("grp").notNull().default(""), // 小分类
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  sortOrder: integer("sortOrder").notNull().default(0),
});

/** 自测题库：单选题 */
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subjectId").notNull(),
  stem: text("stem").notNull(),
  options: text("options").notNull(), // JSON: ["A. …", "B. …"]
  answer: text("answer").notNull(), // "A" | "B" | …
  explanation: text("explanation"),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;
export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;