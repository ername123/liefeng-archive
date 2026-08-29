import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Markdown } from "@/components/Markdown";
import { BackButton } from "@/components/BackButton";
import { subjectIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Pencil, Eye, ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

/** 章节页：Obsidian 式单文档编辑（一页到底） */
export default function SubjectPage() {
  const { slug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const { data, isLoading } = trpc.medical.subjectDetail.useQuery({ slug });
  const chapters = data?.chapters ?? [];

  const chapterFromUrl = Number(searchParams.get("chapter")) || null;
  const [selectedId, setSelectedId] = useState<number | null>(chapterFromUrl);
  const activeId = useMemo(() => {
    if (selectedId && chapters.some((c) => c.id === selectedId)) return selectedId;
    return chapters[0]?.id ?? null;
  }, [selectedId, chapters]);

  const { data: chapter, isLoading: loadingChapter } = trpc.medical.chapterById.useQuery(
    { id: activeId! },
    { enabled: activeId != null },
  );

  // 单文档编辑状态
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [myNote, setMyNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);

  // 切换章节或登录状态时，加载当前用户的个人笔记
  useEffect(() => {
    if (!activeId) return;
    if (user) {
      api.notes.get(activeId).then((r) => setMyNote(r.content)).catch(() => setMyNote(""));
    } else {
      setMyNote("");
    }
    setTab("edit");
  }, [activeId, user]);

  const select = (id: number) => {
    setSelectedId(id);
    setSearchParams({ chapter: String(id) }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveNote = async () => {
    if (!activeId) return;
    setSavingNote(true);
    try {
      await api.notes.save(activeId, myNote);
      toast.success("笔记已保存");
    } catch (err: any) {
      toast.error(err.message || "保存失败");
    } finally {
      setSavingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-64 rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-[600px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">
        学科不存在。<Link to="/" className="text-primary underline">返回首页</Link>
      </div>
    );
  }

  const Icon = subjectIcon(data.icon);
  const activeIndex = chapters.findIndex((c) => c.id === activeId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 学科标题区 */}
      <div className="mb-6 border-b-2 border-foreground/10 pb-5">
        <BackButton to="/home" label="学科首页" className="mb-3" />
        <div className="flex flex-wrap items-center gap-3">
          <span className="ak-btn-cut flex h-11 w-11 items-center justify-center bg-gradient-to-br from-[hsl(190_84%_50%)] to-[hsl(217_66%_52%)] text-white shadow-[3px_3px_0_hsl(203_33%_16%/0.15)]">
            <Icon className="h-5 w-5" />
          </span>
          <div className="mr-auto">
            <h1 className="font-display text-2xl font-bold tracking-wide md:text-3xl">{data.name}</h1>
            <p className="text-sm text-muted-foreground">{data.description}</p>
          </div>
          <Link to={`/quiz?subject=${slug}`}>
            <Button variant="outline" size="sm" className="ak-btn-cut gap-1.5">
              <ListChecks className="h-4 w-4" /> 自测题库
            </Button>
          </Link>
        </div>
      </div>

      {/* 移动端章节抽屉按钮 */}
      <button className="mb-4 md:hidden" onClick={() => setChaptersOpen((v) => !v)}>
        {chaptersOpen ? "收起章节列表" : "打开章节列表"}
      </button>

      <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        {/* 左侧章节导航：180px */}
        <aside className={`${chaptersOpen ? "block" : "hidden"} md:block lg:sticky lg:top-24 lg:self-start`}>
          <div className="ak-card p-2">
            {chapters.length ? (
              <ol className="space-y-1">
                {chapters.map((c, i) => (
                  <li key={c.id}>
                    <button
                      onClick={() => select(c.id)}
                      className={cn(
                        "relative flex w-full items-baseline gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        c.id === activeId
                          ? "bg-secondary font-bold text-secondary-foreground"
                          : "text-muted-foreground hover:bg-white hover:text-foreground",
                      )}
                    >
                      <span className="font-tech shrink-0 text-xs text-muted-foreground/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-snug">{c.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="px-2 py-4 text-sm text-muted-foreground">暂无章节。</p>
            )}
          </div>
        </aside>

        {/* 主体：单文档编辑 */}
        <article className="min-w-0">
          {loadingChapter ? (
            <div className="ak-card p-6">
              <Skeleton className="h-9 w-2/3 rounded-xl" />
              <Skeleton className="mt-4 h-[600px] w-full rounded-2xl" />
            </div>
          ) : chapter ? (
            <div className="ak-card mx-auto max-w-4xl p-5 md:p-7">
              {/* 章节标题 */}
              <div className="mb-5 border-b-2 border-dashed border-foreground/10 pb-4">
                <h2 className="font-display text-3xl font-bold tracking-wide md:text-4xl">{chapter.title}</h2>
                {chapter.summary ? (
                  <p className="mt-2 text-sm text-muted-foreground">{chapter.summary}</p>
                ) : null}
              </div>

              {user ? (
                <>
                  {/* 编辑 / 预览 标签 */}
                  <div className="mb-4 flex items-center gap-2">
                    <button
                      onClick={() => setTab("edit")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                        tab === "edit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white",
                      )}
                    >
                      <Pencil className="h-4 w-4" /> 编辑
                    </button>
                    <button
                      onClick={() => setTab("preview")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                        tab === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white",
                      )}
                    >
                      <Eye className="h-4 w-4" /> 预览
                    </button>
                  </div>

                  {tab === "edit" ? (
                    <Textarea
                      value={myNote}
                      onChange={(e) => setMyNote(e.target.value)}
                      placeholder="开始写笔记，支持 Markdown：## 标题、- 列表、| 表格 |、&gt; 引用、==高亮=="
                      className="min-h-[600px] w-full font-mono text-sm leading-relaxed"
                    />
                  ) : (
                    <div className="min-h-[600px] rounded-xl border-2 border-foreground/10 bg-background p-4">
                      {myNote.trim() ? (
                        <Markdown content={myNote} />
                      ) : (
                        <p className="text-sm text-muted-foreground">还没有笔记，切换到「编辑」开始写吧。</p>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <Button
                      onClick={saveNote}
                      disabled={savingNote}
                      className="rounded-xl bg-gradient-to-r from-[hsl(22_100%_57%)] to-[hsl(42_100%_57%)] text-white shadow-sm hover:opacity-90"
                    >
                      {savingNote ? "保存中…" : "保存笔记"}
                    </Button>
                  </div>
                </>
              ) : (
                <div>
                  <div className="min-h-[600px] rounded-xl border-2 border-foreground/10 bg-background p-4">
                    <Markdown content={chapter.content} />
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      <Link to="/login" className="text-primary font-medium">登录</Link> 后可编辑并保存自己的笔记。
                    </p>
                    <Link to="/login">
                      <Button className="rounded-xl bg-gradient-to-r from-[hsl(22_100%_57%)] to-[hsl(42_100%_57%)] text-white shadow-sm hover:opacity-90">
                        登录后可编辑
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* 上一章 / 下一章 */}
              <div className="mt-8 flex items-center justify-between border-t-2 border-dashed border-foreground/10 pt-5">
                {activeIndex > 0 ? (
                  <Button variant="outline" size="sm" className="ak-btn-cut max-w-[45%]" onClick={() => select(chapters[activeIndex - 1].id)}>
                    <ChevronLeft className="mr-1 h-4 w-4 shrink-0" />
                    <span className="truncate">{chapters[activeIndex - 1].title}</span>
                  </Button>
                ) : (
                  <span />
                )}
                {activeIndex < chapters.length - 1 ? (
                  <Button variant="outline" size="sm" className="ak-btn-cut max-w-[45%]" onClick={() => select(chapters[activeIndex + 1].id)}>
                    <span className="truncate">{chapters[activeIndex + 1].title}</span>
                    <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
                  </Button>
                ) : (
                  <span />
                )}
              </div>
            </div>
          ) : (
            <p className="py-16 text-center text-muted-foreground">选择左侧章节开始阅读。</p>
          )}
        </article>
      </div>
    </div>
  );
}