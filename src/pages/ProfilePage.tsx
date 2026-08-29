import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { api, type Note, type Post } from "@/api/client";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!user) return;
    api.notes.list().then((r) => setNotes(r.notes)).catch(() => null);
    api.experiences.list(true).then((r) => setPosts(r.posts)).catch(() => null);
  }, [user]);

  if (loading) return <div className="page-wrap center muted">加载中…</div>;
  if (!user) {
    return (
      <div className="page-wrap center">
        <p className="muted">请先登录</p>
        <Link to="/login"><Button className="mt-3">去登录</Button></Link>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <h1 className="font-display text-3xl font-bold">个人中心</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        欢迎，{user.username}（{user.role === "ADMIN" ? "管理员" : "普通用户"}）
      </p>

      {/* 统计卡片 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="ak-card p-5 text-center">
          <p className="font-display text-3xl font-bold">{notes.length}</p>
          <p className="text-xs text-muted-foreground">我的笔记</p>
        </div>
        <div className="ak-card p-5 text-center">
          <p className="font-display text-3xl font-bold">{posts.length}</p>
          <p className="text-xs text-muted-foreground">我的经验帖</p>
        </div>
        <div className="ak-card p-5 text-center">
          <p className="font-display text-3xl font-bold">{user.role === "ADMIN" ? "管理员" : "用户"}</p>
          <p className="text-xs text-muted-foreground">账号角色</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-xl font-bold">最近编辑</h2>
          {notes.length === 0 ? (
            <div className="ak-card p-5 text-sm text-muted-foreground">还没有个人笔记，去章节页记一条吧。</div>
          ) : (
            <div className="space-y-3">
              {notes.slice(0, 6).map((n) => (
                <Link key={n.id ?? n.chapterId} to={n.subjectSlug ? `/subject/${n.subjectSlug}?chapter=${n.chapterId}` : "/home"} className="ak-card block p-4">
                  <span className="font-medium">{n.chapterTitle ?? `章节 ${n.chapterId}`}</span>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.content}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-bold">我的经验帖</h2>
          {posts.length === 0 ? (
            <div className="ak-card p-5 text-sm text-muted-foreground">还没有发过经验帖。</div>
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <Link key={p.id} to={`/experiences/${p.id}`} className="ak-card block p-4">
                  <span className="font-medium">{p.title}</span>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}