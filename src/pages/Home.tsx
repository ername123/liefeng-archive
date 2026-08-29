import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { subjectIcon } from "@/lib/icons";
import { SearchBox } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, FileText, ListChecks } from "lucide-react";
import {
  DoodleStar,
  DoodleSparkle,
  DoodleSquiggle,
  DoodleCitrus,
  DoodlePlus,
  DoodleDrop,
  CARNIVAL_COLORS,
} from "@/components/Doodles";

export default function Home() {
  const { data: subjects, isLoading } = trpc.medical.subjectList.useQuery();
  const totalChapters = subjects?.reduce((n, s) => n + s.chapterCount, 0) ?? 0;
  const totalQuestions = subjects?.reduce((n, s) => n + s.questionCount, 0) ?? 0;

  return (
    <div>
      {/* Hero：嘉年华蓝色大旗 */}
      <section className="relative overflow-hidden">
        {/* 散落在浅底上的彩色涂鸦 */}
        <DoodleStar className="doodle-float absolute left-[6%] top-10 h-10 w-10 opacity-80" color="#f5b800" />
        <DoodleStar className="doodle-float absolute right-[8%] top-24 h-7 w-7 opacity-70" color="#ff6f9c" />
        <DoodleSparkle className="doodle-spin absolute left-[12%] bottom-16 h-6 w-6 opacity-70" />
        <DoodlePlus className="absolute right-[16%] bottom-24 h-5 w-5 opacity-60" />
        <DoodleDrop className="doodle-float absolute left-[26%] top-8 h-5 w-5 opacity-70" />
        <DoodleCitrus className="doodle-spin absolute right-[26%] top-6 h-9 w-9 opacity-60" />
        <DoodleSquiggle className="absolute -left-6 bottom-6 h-6 w-40 opacity-50" />

        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20">
          {/* 大旗本体 */}
          <div className="carnival-flag relative -rotate-1 px-6 py-10 text-white md:px-12 md:py-14">
            {/* 旗上的白色涂鸦 */}
            <DoodleStar className="doodle-float absolute right-[7%] top-6 h-8 w-8" color="#ffffff" />
            <DoodleSparkle className="doodle-spin absolute right-[16%] bottom-8 h-5 w-5" color="rgba(255,255,255,0.8)" />
            <DoodleStar className="absolute left-[4%] bottom-6 h-5 w-5 opacity-80" color="#ffd84d" />
            <DoodleSquiggle className="absolute right-[28%] top-5 h-5 w-28 opacity-70" color="rgba(255,255,255,0.75)" />

            {/* 阿米娅贴纸：从旗子右下角探出来 */}
            <img
              src="/stickers/amiya-peace.png"
              alt="阿米娅"
              className="doodle-float pointer-events-none absolute bottom-0 right-4 w-28 select-none drop-shadow-[4px_6px_0_rgba(20,40,60,0.18)] md:right-10 md:w-44"
            />

            <p className="font-tech text-[0.66rem] uppercase tracking-[0.25em] text-white/85">
              :&gt; LIEFENG ARCHIVE · SUMMER 2026
            </p>
            <h1 className="font-display mt-4 text-5xl leading-[1.1] tracking-wide drop-shadow-[3px_4px_0_hsl(217_66%_40%/0.6)] md:text-7xl">
              烈风资源站
            </h1>
            <p className="font-display mt-2 text-lg tracking-[0.3em] text-white/80">
              LIEFENG ARCHIVE
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-white/90">
              把厚厚的教材，整理成自己的笔记。按学科归档的基础医学与桥梁课程知识库，
              支持全站搜索、重点高亮与章节表格，配自测题库随时巩固。
            </p>

            <div className="mt-8 max-w-xl">
              <SearchBox />
            </div>

            {/* 统计徽章 */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {[
                { num: String(subjects?.length ?? 10).padStart(2, "0"), label: "学科 SUBJECTS" },
                { num: String(totalChapters).padStart(2, "0"), label: "笔记 CHAPTERS" },
                { num: String(totalQuestions).padStart(2, "0"), label: "题目 QUESTIONS" },
              ].map((s) => (
                <span
                  key={s.label}
                  className="ak-btn-cut inline-flex items-baseline gap-2 border-2 border-white/70 bg-white/15 px-4 py-1.5 backdrop-blur-sm"
                >
                  <span className="font-display text-2xl font-bold">{s.num}</span>
                  <span className="font-tech text-[0.62rem] uppercase tracking-[0.2em] text-white/85">{s.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 学科卡片 */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8 flex items-center gap-3">
          <DoodleStar className="h-6 w-6" color="#ff7a30" />
          <h2 className="font-display text-3xl tracking-wide">学科分类</h2>
          <span className="hud-tag ml-1">// SUBJECT INDEX</span>
          <span className="hidden h-0.5 flex-1 rounded-full bg-foreground/10 md:block" />
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects?.map((s, i) => {
              const Icon = subjectIcon(s.icon);
              const color = CARNIVAL_COLORS[i % CARNIVAL_COLORS.length];
              return (
                <Link key={s.id} to={`/subject/${s.slug}`} className="group">
                  <div className="ak-card h-full p-5">
                    <div className="flex items-start justify-between">
                      <span
                        className="ak-btn-cut flex h-11 w-11 items-center justify-center text-white transition-transform group-hover:-rotate-6 group-hover:scale-110"
                        style={{ background: color }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-display text-2xl font-bold text-foreground/20 transition-colors group-hover:text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-display mt-4 text-xl tracking-wide">{s.name}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {s.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-foreground/10 pt-3">
                      <div className="flex items-center gap-4 font-tech text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          {s.chapterCount} 篇
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ListChecks className="h-3.5 w-3.5" />
                          {s.questionCount} 题
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
