import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Panel, Group, Separator } from "react-resizable-panels";
import { trpc } from "@/providers/trpc";
import { Markdown } from "@/components/Markdown";
import { BackButton } from "@/components/BackButton";
import { subjectIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

/** 章节页：左侧章节导航 + 分屏实时编辑预览，自动保存 */
export default function SubjectPage() {
  const { slug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { data, isLoading } = trpc.medical.subjectDetail.useQuery({ slug });
  const chapters = data?.chapters ?? [];

  const chapterFromUrl = Number(searchParams.get("chapter")) || null;
  const [selectedId, setSelectedId] = useState<number | null>(chapterFromUrl);
  const activeId = useMemo(() => {
    if (selectedId && chapters.some((c) => c.id === selectedId)) return selectedId;
    return chapters[0]?.id ?? null;
  }, [selectedId, chapters]);

  const activeChapter = chapters.find((c) => c.id === activeId) ?? null;
  const activeIndex = chapters.findIndex((c) => c.id === activeId);

  // 单文档内容：个人笔记（不为空）> 示例笔记 > 空字符串
  const [draft, setDraft] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [chaptersOpen, setChaptersOpen] = useState(false);

  // 首次加载后先跳过自动保存，避免把示例笔记立刻写进个人笔记
  const skipSave = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 章节或登录状态变化时加载内容
  useEffect(() => {
    if (!activeId) return;
    skipSave.current = true;
    setDraft("");
    setSaveStatus("idle");

    api.examples.get(activeId).then((r) => {
      if (!user) setDraft(r.content ?? "");
    }).catch(() => null);

    if (user) {
      api.notes.get(activeId).then((r) => {
        // 个人笔记为空时回退到示例笔记
        if (r.content && r.content.trim()) {
          setDraft(r.content);
        } else {
          api.examples.get(activeId).then((ex) => setDraft(ex.content ?? "")).catch(() => setDraft(""));
        }
      }).catch(() => {
        api.examples.get(activeId).then((ex) => setDraft(ex.content ?? "")).catch(() => setDraft(""));
      });
    }
  }, [activeId, user]);

  // 自动保存：停止输入 800ms 后触发
  useEffect(() => {
    if (!user || skipSave.current) return;
    setSaveStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await api.notes.save(activeId, draft);
        setSaveStatus("saved");
      } catch (err: any) {
        setSaveStatus("error");
        toast.error(err.message || "保存失败");
      }
    }, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft, user, activeId]);

  const select = (id: number) => {
    setSelectedId(id);
    setSearchParams({ chapter: String(id) }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onChangeDraft = (value: string) => {
    skipSave.current = false;
    setDraft(value);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-64 rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-[700px] rounded-2xl" />
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
      <button className="mb-4 lg:hidden" onClick={() => setChaptersOpen((v) => !v)}>
        {chaptersOpen ? "收起章节列表" : "打开章节列表"}
      </button>

      <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        {/* 左侧章节导航：180px */}
        <aside className={`${chaptersOpen ? "block" : "hidden"} lg:block lg:sticky lg:top-24 lg:self-start`}>
          <div className="ui-card p-2">
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
                          : "text-muted-foreground hover:bg-gray-50 hover:text-foreground",
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

        {/* 主体：分屏编辑 + 实时预览 */}
        <article className="min-w-0">
          {activeChapter ? (
            <div className="mx-auto max-w-5xl">
              <div className="ui-card p-5 md:p-6">
                <h2 className="mb-2 font-display text-3xl font-bold tracking-wide md:text-4xl">{activeChapter.title}</h2>
                {activeChapter.summary ? (
                  <p className="mb-4 text-sm text-muted-foreground">{activeChapter.summary}</p>
                ) : null}

                {user ? (
                  <div className="mx-auto max-w-4xl">
                    <Group orientation={isMobile ? "vertical" : "horizontal"} className="gap-0">
                      <Panel defaultSize="50" minSize="20">
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between px-6 pt-3">
                            <span className="text-xs font-medium text-muted-foreground">编辑</span>
                            <span className="text-xs text-muted-foreground">
                              {saveStatus === "saving" && "保存中…"}
                              {saveStatus === "saved" && "已保存 ✓"}
                              {saveStatus === "error" && "保存失败 ✗"}
                            </span>
                          </div>
                          <Textarea
                            value={draft}
                            onChange={(e) => onChangeDraft(e.target.value)}
                            placeholder="开始写笔记，支持 Markdown：## 标题、- 列表、| 表格 |、&gt; 引用、==高亮=="
                            className="min-h-[700px] w-full border-0 bg-transparent p-6 font-mono text-sm leading-relaxed focus-visible:ring-0"
                          />
                        </div>
                      </Panel>

                      <Separator className="w-1 bg-gray-200 transition-colors hover:bg-gray-400" />

                      <Panel defaultSize="50" minSize="20">
                        <div className="h-full overflow-y-auto bg-gray-50 p-6">
                          {draft.trim() ? (
                            <Markdown content={draft} />
                          ) : (
                            <p className="text-sm text-muted-foreground">暂无内容，左侧开始写笔记吧。</p>
                          )}
                        </div>
                      </Panel>
                    </Group>
                  </div>
                ) : (
                  <div>
                    <div className="min-h-[700px] rounded-2xl bg-gray-50 p-6">
                      {draft.trim() ? <Markdown content={draft} /> : <p className="text-sm text-muted-foreground">暂无示例笔记。</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* 上一章 / 下一章 */}
              <div className="mt-6 flex items-center justify-between">
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

      {/* 角色插图：固定在右下角，120px */}
      <img
        src="/stickers/amiya-notes.png"
        alt="阿米娅"
        className="pointer-events-none fixed bottom-4 right-4 z-20 hidden w-[120px] select-none md:block"
      />

      {/* 未登录时的底部提示条 */}
      {!user && activeChapter && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-center gap-3 border-t-2 border-foreground/10 bg-white/95 px-4 py-3 backdrop-blur">
          <span className="text-sm text-muted-foreground">登录后可编辑此章节</span>
          <Link to="/login">
            <Button className="rounded-full bg-gradient-to-r from-[hsl(22_100%_57%)] to-[hsl(42_100%_57%)] px-4 py-1.5 text-white shadow-sm">
              立即登录
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}