import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ExperienceNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [pending, setPending] = useState(false);

  if (!user) {
    return (
      <div className="page-wrap center">
        <p className="muted">请先登录后再写经验帖。</p>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("标题和内容不能为空");
      return;
    }
    setPending(true);
    try {
      const { post } = await api.experiences.create(title.trim(), content.trim(), tags.trim(), true);
      toast.success("发布成功");
      navigate(`/experiences/${post.id}`);
    } catch (err: any) {
      toast.error(err.message || "发布失败");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="page-wrap">
      <h1 className="font-display text-3xl font-bold">写经验帖</h1>
      <p className="mt-1 text-sm text-muted-foreground">支持 Markdown：## 标题、- 列表、| 表格 |、&gt; 引用、==高亮==</p>

      <form onSubmit={submit} className="ak-card mt-6 space-y-4 p-6">
        <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="标签（可选，用逗号分隔）" value={tags} onChange={(e) => setTags(e.target.value)} />
        <Textarea
          placeholder="正文内容（Markdown）…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>取消</Button>
          <Button type="submit" disabled={pending}>{pending ? "发布中…" : "发布"}</Button>
        </div>
      </form>
    </div>
  );
}