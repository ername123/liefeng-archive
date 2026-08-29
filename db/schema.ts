import { pgTable, serial, text, integer, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";

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

/* ============================================================
   用户系统 + 双轨笔记 + 经验帖 + 评论（新增五张表）
   ============================================================ */

/** 用户：USER / ADMIN 两种角色 */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // 用随机 UUID 代替 cuid，简单且无需额外依赖
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(), // bcryptjs 哈希结果
  role: text("role", { enum: ["USER", "ADMIN"] }).notNull().default("USER"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/** 示例笔记：每个章节一份，公开可见 */
export const exampleNotes = pgTable("example_notes", {
  id: text("id").primaryKey(),
  chapterId: integer("chapterId").notNull().unique(), // 对应 chapters.id
  content: text("content").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/** 个人笔记：每个用户对每个章节一份 */
export const userNotes = pgTable(
  "user_notes",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(), // 对应 users.id
    chapterId: integer("chapterId").notNull(), // 对应 chapters.id
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("user_notes_user_chapter_idx").on(t.userId, t.chapterId)],
);

/** 经验帖 */
export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(), // 对应 users.id
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags"), // 逗号分隔的标签，可选
  isPublic: boolean("isPublic").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/** 评论：单层评论，不嵌套 */
export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  postId: text("postId").notNull(), // 对应 posts.id
  userId: text("userId").notNull(), // 对应 users.id
  content: text("content").notNull(),
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
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ExampleNote = typeof exampleNotes.$inferSelect;
export type InsertExampleNote = typeof exampleNotes.$inferInsert;
export type UserNote = typeof userNotes.$inferSelect;
export type InsertUserNote = typeof userNotes.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;