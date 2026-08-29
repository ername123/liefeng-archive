import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { SearchBox } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const { data, isLoading } = trpc.medical.search.useQuery(
    { keyword: q },
    { enabled: q.length > 0 },
  );

  const total = (data?.subjects.length ?? 0) + (data?.chapters.length ?? 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackButton to="/home" label="首页" className="mb-5" />
      <div className="mb-2 flex items-center gap-3">
        <span className="h-1.5 w-8 rounded-full bg-primary" />
        <span className="hud-tag">// FULL-TEXT SEARCH</span>
      </div>
      <h1 className="font-display text-4xl tracking-wide">全站搜索</h1>
      <SearchBox className="mt-5" autoFocus />

      {q && (
        <p className="mt-7 font-tech text-xs text-muted-foreground">
          QUERY: <span className="text-primary">「{q}」</span>
          {isLoading ? " — SEARCHING..." : ` — ${total} RESULT(S)`}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 " />)}

        {!isLoading && q && total === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <img src="/stickers/amiya-read.png" alt="阿米娅" className="w-36 select-none opacity-95" />
            <p>没有找到相关内容，换个关键词试试？</p>
          </div>
        )}

        {data?.subjects.map((s) => (
          <Link key={`s-${s.id}`} to={`/subject/${s.slug}`}>
            <div className="ak-card p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full font-tech text-xs">学科</Badge>
                <span className="font-bold">{s.name}</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.description}</p>
            </div>
          </Link>
        ))}

        {data?.chapters.map((c) => (
          <Link key={`c-${c.id}`} to={`/subject/${c.subjectSlug}?chapter=${c.id}`}>
            <div className="ak-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-accent font-tech text-xs text-accent-foreground hover:bg-accent">
                  {c.subjectName}
                </Badge>
                <span className="font-bold">{c.title}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {c.snippet}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
