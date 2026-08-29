import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api/client";
import { Markdown, extractToc } from "@/components/Markdown";
import { BackButton } from "@/components/BackButton";
import { ChapterEditor } from "@/components/ChapterEditor";
import { subjectIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, ChevronLeft, ChevronRight, ListChecks, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubjectPage() {
  const { slug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading } = trpc.medical.subjectDetail.useQuery({ slug });

  const chapterFromUrl = Number(searchParams.get("chapter")) || null;
  const [selectedId, setSelectedId] = useState<number | null>(chapterFromUrl);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<{ id?: number; title: string; summary: string; content: string } | null>(null);
  const { user } = useAuth();
  const [exampleOpen, setExampleOpen] = useState(false);
  const [exampleContent, setExampleContent] = useState("");
  const [myNote, setMyNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);

  const chapters = data?.chapters ?? [];
  const activeId = useMemo(() => {
    if (selectedId && chapters.some((c) => c.id === selectedId)) return selectedId;
    return chapters[0]?.id ?? null;
  }, [selectedId, chapters]);

  const { data: chapter, isLoading: loadingChapter } = trpc.medical.chapterById.useQuery(
    { id: activeId! },
    { enabled: activeId != null },
  );

  // 从搜索跳转进来时，同步 URL 中的章节
  useEffect(() => {
    if (chapterFromUrl) setSelectedId(chapterFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterFromUrl]);

  // 切换章节时加载示例笔记和当前用户的个人笔记
  useEffect(() => {
    if (!activeId) return;
    setExampleContent("");
    setExampleOpen(false);
    api.examples.get(activeId).then((r) => setExampleContent(r.content)).catch(() => null);
    if (user) {
      api.notes.get(activeId).then((r) => setMyNote(r.content)).catch(() => null);
    } else {
      setMyNote("");
    }
  }, [activeId, user]);

  const select = (id: number) => {
    setSelectedId(id);
    setSearchParams({ chapter: String(id) }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── 右侧「本页内容」目录 ──
  const toc = useMemo(() => (chapter ? extractToc(chapter.content) : []), [chapter]);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveHeading(toc[0]?.id ?? "");
    if (!toc.length) return;
    const onScroll = () => {
      let current = toc[0].id;
      for (const h of toc) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 110) current = h.id;
      }
      setActiveHeading(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
    setActiveHeading(id);
  };

  // 保存当前用户的个人笔记
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
        <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)_210px]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="hidden h-64 rounded-2xl lg:block" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">
        学科不存在。<Link to="/" className="text-primary underline">返回首页</Link>
      </div>
    );
  }

  const Icon = subjectIcon(data.icon);
  const activeIndex = chapters.findIndex((c) => c.id === activeId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 学科标题区 */}
      <div className="mb-7 border-b-2 border-foreground/10 pb-6">
        <BackButton to="/home" label="学科首页" className="mb-4" />
        <div className="mb-3 flex items-center gap-3">
          <span className="h-1.5 w-8 rounded-full bg-primary" />
          <span className="hud-tag">SUBJECT FILE // {slug.toUpperCase()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="ak-btn-cut flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[hsl(190_84%_50%)] to-[hsl(217_66%_52%)] text-white shadow-[3px_3px_0_hsl(203_33%_16%/0.15)]">
            <Icon className="h-6 w-6" />
          </span>
          <div className="relative mr-auto">
            <h1 className="font-display text-3xl font-bold tracking-wide">{data.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{data.description}</p>
            <img
              src="/stickers/amiya-notes.png"
              alt="阿米娅"
              className="doodle-float pointer-events-none absolute -top-10 right-[-5.5rem] hidden w-24 select-none lg:block"
            />
          </div>
          <Link to={`/quiz?subject=${slug}`}>
            <Button variant="outline" size="sm" className="ak-btn-cut gap-1.5">
              <ListChecks className="h-4 w-4" /> 去自测
            </Button>
          </Link>
          <Button
            size="sm"
            className="ak-btn-cut gap-1.5"
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> 添加章节
          </Button>
        </div>
      </div>

      {/* 三栏：章节目录 / 正文 / 本页内容 */}
      <button className="mb-4 md:hidden" onClick={() => setChaptersOpen((v) => !v)}>
        {chaptersOpen ? "收起章节列表" : "打开章节列表"}
      </button>
      <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)_210px]">
        {/* 左：章节目录 */}
        <aside className={`${chaptersOpen ? "block" : "hidden"} md:block lg:sticky lg:top-24 lg:self-start`}>
          <p className="hud-tag mb-3 flex items-center gap-2 px-1">
            <ListTree className="h-3.5 w-3.5" /> // CHAPTER INDEX
          </p>
          {chapters.length === 0 ? (
            <p className="px-1 text-sm text-muted-foreground">暂无笔记，点击右上角「添加章节」开始记录。</p>
          ) : (
            <ol className="space-y-1 border-l-2 border-dashed border-foreground/15">
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
                    {c.id === activeId && (
                      <span className="absolute left-[-2px] top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[hsl(199_89%_46%)]" />
                    )}
                    <span className="font-tech shrink-0 text-xs text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-snug">{c.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>

        {/* 中：笔记正文 */}
        <article className="min-w-0" ref={articleRef}>
          {loadingChapter ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-2/3 rounded-xl" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : chapter ? (
            <div className="ak-frame ak-card px-5 py-6 hover:transform-none md:px-8 md:py-8">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b-2 border-dashed border-foreground/10 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-wide">{chapter.title}</h2>
                  {chapter.summary && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{chapter.summary}</p>
                  )}
                  <p className="hud-tag mt-2">
                    UPDATED {new Date(chapter.updatedAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setEditing({
                      id: chapter.id,
                      title: chapter.title,
                      summary: chapter.summary ?? "",
                      content: chapter.content,
                    });
                    setEditorOpen(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" /> 编辑
                </Button>
              </div>

              <Markdown content={chapter.content} />

              {/* 上一章 / 下一章 */}
              <div className="mt-12 flex items-center justify-between border-t-2 border-dashed border-foreground/10 pt-5">
                {activeIndex > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ak-btn-cut max-w-[45%]"
                    onClick={() => select(chapters[activeIndex - 1].id)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4 shrink-0" />
                    <span className="truncate">{chapters[activeIndex - 1].title}</span>
                  </Button>
                ) : (
                  <span />
                )}
                {activeIndex < chapters.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ak-btn-cut max-w-[45%]"
                    onClick={() => select(chapters[activeIndex + 1].id)}
                  >
                    <span className="truncate">{chapters[activeIndex + 1].title}</span>
                    <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="py-16 text-center text-muted-foreground">选择左侧章节开始阅读。</p>
          )}
        {activeId && (
          <div className="mt-6 space-y-6">
            {/* 示例笔记卡片：浅黄背景，可折叠 */}
            <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-4">
              <button className="flex w-full items-center justify-between text-left" onClick={() => setExampleOpen((v) => !v)}>
                <span className="font-bold text-foreground">示例笔记</span>
                <span className="text-sm text-muted-foreground">{exampleOpen ? "收起" : "展开"}</span>
              </button>
              {exampleOpen && (
                <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {exampleContent || "暂无示例笔记"}
                </div>
              )}
            </div>

            {/* 我的笔记编辑区：白底 + 蓝色左边框 */}
            <div className="rounded-2xl border-2 border-foreground/10 border-l-4 border-l-[hsl(199_89%_46%)] bg-white p-4">
              <p className="mb-2 font-bold">我的笔记</p>
              {user ? (
                <>
                  <Textarea
                    value={myNote}
                    onChange={(e) => setMyNote(e.target.value)}
                    className="min-h-[120px]"
                    placeholder="写下你自己的笔记…"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button onClick={saveNote} disabled={savingNote}>{savingNote ? "保存中…" : "保存笔记"}</Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary">登录</Link> 后即可保存个人笔记。
                </p>
              )}
            </div>
          </div>
        )}
        </article>

        {/* 右：本页内容（滚动高亮当前小节） */}
        <aside className="hidden lg:block">
          {chapter && toc.length > 0 && (
            <div className="sticky top-24">
              <p className="mb-3 px-1 text-sm font-bold">本页内容</p>
              <nav className="max-h-[70vh] overflow-y-auto">
                {toc.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => jumpTo(h.id)}
                    className={cn(
                      "toc-link w-full text-left",
                      h.level === 3 && "lv3",
                      activeHeading === h.id && "active",
                    )}
                  >
                    {h.text}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </aside>
      </div>

      <ChapterEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        subjectId={data.id}
        chapter={editing}
        onSaved={(id) => {
          if (id) select(id);
        }}
      />
    </div>
  );
}
