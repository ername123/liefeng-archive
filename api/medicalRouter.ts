import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subjects, chapters, resources, questions } from "@db/schema";
import { eq, like, or, asc } from "drizzle-orm";

function makeSnippet(content: string, keyword: string, radius = 60) {
  const idx = content.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return content.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + keyword.length + radius);
  return (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "");
}

export const medicalRouter = createRouter({
  /** 学科列表（含章节数、题目数） */
  subjectList: publicQuery.query(async () => {
    const rows = await getDb().query.subjects.findMany({
      orderBy: [asc(subjects.sortOrder)],
      with: {
        chapters: { columns: { id: true } },
        questions: { columns: { id: true } },
      },
    });
    return rows.map(({ chapters: chs, questions: qs, ...s }) => ({
      ...s,
      chapterCount: chs.length,
      questionCount: qs.length,
    }));
  }),

  /** 按 slug 取学科 + 章节目录 */
  subjectDetail: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const subject = await getDb().query.subjects.findFirst({
        where: eq(subjects.slug, input.slug),
        with: {
          chapters: {
            orderBy: [asc(chapters.sortOrder), asc(chapters.id)],
            columns: { id: true, title: true, summary: true, sortOrder: true, updatedAt: true },
          },
        },
      });
      return subject ?? null;
    }),

  /** 章节全文 */
  chapterById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const chapter = await getDb().query.chapters.findFirst({
        where: eq(chapters.id, input.id),
        with: { subject: { columns: { id: true, slug: true, name: true } } },
      });
      return chapter ?? null;
    }),

  /** 新增章节笔记 */
  chapterCreate: publicQuery
    .input(
      z.object({
        subjectId: z.number(),
        title: z.string().min(1),
        summary: z.string().optional(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const maxOrder = await db.query.chapters.findMany({
        where: eq(chapters.subjectId, input.subjectId),
        columns: { sortOrder: true },
        orderBy: [asc(chapters.sortOrder)],
      });
      const sortOrder = (maxOrder.at(-1)?.sortOrder ?? 0) + 1;
      const [{ id }] = await db
        .insert(chapters)
        .values({ ...input, sortOrder })
        .$returningId();
      return { id };
    }),

  /** 更新章节笔记 */
  chapterUpdate: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1),
        summary: z.string().optional(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb()
        .update(chapters)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(chapters.id, id));
      return { ok: true };
    }),

  /** 删除章节 */
  chapterDelete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(chapters).where(eq(chapters.id, input.id));
      return { ok: true };
    }),

  /** 全站搜索：学科名 / 章节标题 / 正文 */
  search: publicQuery
    .input(z.object({ keyword: z.string().min(1) }))
    .query(async ({ input }) => {
      const kw = `%${input.keyword}%`;
      const db = getDb();
      const matchedSubjects = await db
        .select()
        .from(subjects)
        .where(or(like(subjects.name, kw), like(subjects.description, kw)));
      const matchedChapters = await db.query.chapters.findMany({
        where: or(like(chapters.title, kw), like(chapters.summary, kw), like(chapters.content, kw)),
        with: { subject: { columns: { slug: true, name: true } } },
        orderBy: [asc(chapters.subjectId), asc(chapters.sortOrder)],
      });
      return {
        subjects: matchedSubjects,
        chapters: matchedChapters.map((c) => ({
          id: c.id,
          title: c.title,
          summary: c.summary,
          subjectSlug: c.subject.slug,
          subjectName: c.subject.name,
          snippet: makeSnippet(c.content.replace(/[#*|=`>\-\[\]]/g, ""), input.keyword),
        })),
      };
    }),

  /** 资源导航 */
  resourceList: publicQuery.query(async () => {
    return getDb()
      .select()
      .from(resources)
      .orderBy(asc(resources.category), asc(resources.grp), asc(resources.sortOrder));
  }),

  /** 某学科的题目 */
  questionList: publicQuery
    .input(z.object({ subjectSlug: z.string() }))
    .query(async ({ input }) => {
      const subject = await getDb().query.subjects.findFirst({
        where: eq(subjects.slug, input.subjectSlug),
        columns: { id: true, name: true, slug: true },
      });
      if (!subject) return { subject: null, questions: [] };
      const qs = await getDb()
        .select()
        .from(questions)
        .where(eq(questions.subjectId, subject.id))
        .orderBy(asc(questions.sortOrder), asc(questions.id));
      return {
        subject,
        questions: qs.map((q) => ({
          ...q,
          options: JSON.parse(q.options) as string[],
        })),
      };
    }),
});
