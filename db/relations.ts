import { relations } from "drizzle-orm";
import { subjects, chapters, questions } from "./schema";

export const subjectsRelations = relations(subjects, ({ many }) => ({
  chapters: many(chapters),
  questions: many(questions),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  subject: one(subjects, {
    fields: [chapters.subjectId],
    references: [subjects.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  subject: one(subjects, {
    fields: [questions.subjectId],
    references: [subjects.id],
  }),
}));
