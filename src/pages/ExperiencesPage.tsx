import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api, type Post } from "@/api/client";
import { Button } from "@/components/ui/button";

export default function ExperiencesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.experiences.list().then((r) => setPosts(r.posts)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">经验广场</h1>
          <p className="mt-1 text-sm text-muted-foreground">分享你的学习经验，看看大家怎么说。</p>
        </div>
        <Link to="/experiences/new"><Button>写经验帖</Button></Link>
      </div>

      {loading ? (
        <div className="center muted">加载中…</div>
      ) : posts.length === 0 ? (
        <div className="ak-card p-8 text-center text-muted-foreground">还没有经验帖，来写第一篇吧。</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} to={`/experiences/${p.id}`} className="ak-card block p-5">
              <h2 className="font-display text-lg font-bold leading-snug">{p.title}</h2>
              {p.tags ? <p className="mt-2 text-xs text-primary">{p.tags}</p> : null}
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.content}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.author ?? "匿名"}</span>
                <span>{new Date(p.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}