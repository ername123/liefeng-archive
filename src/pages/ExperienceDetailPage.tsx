import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { api, type Post, type Comment } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ExperienceDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.experiences.detail(id).then((r) => setPost(r.post)).finally(() => setLoading(false));
    api.comments.list(id).then((r) => setComments(r.comments)).catch(() => null);
  }, [id]);

  const submitComment = async () => {
    if (!content.trim()) return;
    try {
      const { comment } = await api.comments.create(id, content.trim());
      setComments((list) => [...list, comment]);
      setContent("");
      toast.success("评论成功");
    } catch (err: any) {
      toast.error(err.message || "评论失败");
    }
  };

  const removePost = async () => {
    if (!confirm("确定删除这篇经验帖吗？")) return;
    try {
      await api.experiences.remove(id);
      toast.success("已删除");
      navigate("/experiences");
    } catch (err: any) {
      toast.error(err.message || "删除失败");
    }
  };

  const removeComment = async (cid: string) => {
    try {
      await api.comments.remove(cid);
      setComments((list) => list.filter((c) => c.id !== cid));
      toast.success("评论已删除");
    } catch (err: any) {
      toast.error(err.message || "删除失败");
    }
  };

  if (loading) return <div className="page-wrap center muted">加载中…</div>;
  if (!post) return <div className="page-wrap center muted">帖子不存在</div>;

  return (
    <div className="page-wrap max-w-3xl">
      <Link to="/experiences" className="text-sm text-muted-foreground hover:text-primary">← 返回经验广场</Link>

      <div className="ak-card mt-4 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-dashed border-foreground/10 pb-4">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">{post.title}</h1>
            <p className="mt-2 text-xs text-muted-foreground">
              {post.author ?? "匿名"} · {new Date(post.createdAt).toLocaleDateString("zh-CN")}
            </p>
            {post.tags ? <p className="mt-1 text-xs text-primary">{post.tags}</p> : null}
          </div>
          {user && (user.id === post.userId || user.role === "ADMIN") ? (
            <Button variant="ghost" size="sm" onClick={removePost}>删除</Button>
          ) : null}
        </div>
        <div className="mt-5 whitespace-pre-wrap leading-relaxed">{post.content}</div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold">评论（{comments.length}）</h2>

        {user ? (
          <div className="ak-card mb-5 p-4">
            <Textarea
              placeholder="写下你的评论…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={submitComment} disabled={!content.trim()}>发表评论</Button>
            </div>
          </div>
        ) : (
          <div className="ak-card mb-5 p-4 text-sm text-muted-foreground">
            <Link to="/login" className="text-primary">登录</Link> 后即可评论。
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无评论。</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="ak-card p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{c.author ?? "匿名"}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString("zh-CN")}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{c.content}</p>
                {user && (user.id === c.userId || user.role === "ADMIN") ? (
                  <button className="mt-2 text-xs text-muted-foreground hover:text-primary" onClick={() => removeComment(c.id)}>删除</button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}