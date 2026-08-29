import { createRouter, publicQuery } from "./middleware";
import { medicalRouter } from "./medicalRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  medical: medicalRouter,
});

export type AppRouter = typeof appRouter;
