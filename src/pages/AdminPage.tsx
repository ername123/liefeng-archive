import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api/client";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ChapterRow = Record<string, any>;
type ResourceRow = Record<string, any>;

/** 管理后台：章节管理 + 资源管理（仅 ADMIN 可访问） */
export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"chapters" | "resources">("chapters");

  const { data: subjectsData } = trpc.medical.subjectList.useQuery();
  const subjects = subjectsData ?? [];

  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);

  // 章节表单
  const [cForm, setCForm] = useState({ id: null as number | null, subjectId: "", title: "", summary: "", content: "", sortOrder: 0 });
  // 资源表单
  const [rForm, setRForm] = useState({ id: null as number | null, category: "", grp: "", title: "", url: "", description: "", sortOrder: 0 });

  const load = () => {
    api.admin.chapters().then((r) => setChapters(r.chapters as ChapterRow[])).catch(() => null);
    api.resources.list().then((r) => setResources(r.resources as ResourceRow[])).catch(() => null);
  };

  useEffect(() => { load(); }, []);

  if (user?.role !== "ADMIN") {
    return <div className="page-wrap center muted">需要管理员权限。</div>;
  }

  const submitChapter = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (cForm.id) await api.admin.updateChapter(cForm.id, cForm);
      else await api.admin.createChapter(cForm);
      toast.success("章节已保存");
      setCForm({ id: null, subjectId: "", title: "", summary: "", content: "", sortOrder: 0 });
      load();
    } catch (err: any) { toast.error(err.message || "保存失败"); }
  };

  const deleteChapter = async (id: number) => {
    if (!confirm("确定删除这个章节吗？")) return;
    try { await api.admin.deleteChapter(id); toast.success("已删除"); load(); } catch (err: any) { toast.error(err.message || "删除失败"); }
  };

  const submitResource = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (rForm.id) await api.resources.update(rForm.id, rForm);
      else await api.resources.create(rForm);
      toast.success("资源已保存");
      setRForm({ id: null, category: "", grp: "", title: "", url: "", description: "", sortOrder: 0 });
      load();
    } catch (err: any) { toast.error(err.message || "保存失败"); }
  };

  const deleteResource = async (id: number) => {
    if (!confirm("确定删除这个资源吗？")) return;
    try { await api.resources.remove(id); toast.success("已删除"); load(); } catch (err: any) { toast.error(err.message || "删除失败"); }
  };

  return (
    <div className="page-wrap">
      <h1 className="font-display text-3xl font-bold">管理后台</h1>

      <div className="mt-5 flex gap-2">
        <button className={tab === "chapters" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setTab("chapters")}>章节管理</button>
        <button className={tab === "resources" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setTab("resources")}>资源管理</button>
      </div>

      {tab === "chapters" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <form onSubmit={submitChapter} className="ak-card space-y-3 p-5">
            <h2 className="font-bold">{cForm.id ? "编辑章节" : "新增章节"}</h2>
            <select className="w-full rounded-xl border-2 border-foreground/20 bg-white px-3 py-2" value={cForm.subjectId} onChange={(e) => setCForm({ ...cForm, subjectId: e.target.value })}>
              <option value="">选择学科</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Input placeholder="章节标题" value={cForm.title} onChange={(e) => setCForm({ ...cForm, title: e.target.value })} />
            <Input placeholder="摘要（可选）" value={cForm.summary} onChange={(e) => setCForm({ ...cForm, summary: e.target.value })} />
            <Input type="number" placeholder="排序" value={cForm.sortOrder} onChange={(e) => setCForm({ ...cForm, sortOrder: Number(e.target.value) })} />
            <Textarea placeholder="正文（Markdown）" className="min-h-[160px]" value={cForm.content} onChange={(e) => setCForm({ ...cForm, content: e.target.value })} />
            <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-[hsl(22_100%_57%)] to-[hsl(42_100%_57%)] text-white shadow-sm">保存章节</Button>
          </form>

          <div className="space-y-2">
            {chapters.map((ch) => (
              <div key={ch.id} className="ak-card flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-medium">{ch.title}</p>
                  <p className="text-xs text-muted-foreground">{ch.subjectName} · 排序 {ch.sortOrder}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setCForm({ id: ch.id, subjectId: String(ch.subjectId), title: ch.title, summary: ch.summary ?? "", content: ch.content ?? "", sortOrder: ch.sortOrder ?? 0 })}>编辑</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteChapter(ch.id)}>删除</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <form onSubmit={submitResource} className="ak-card space-y-3 p-5">
            <h2 className="font-bold">{rForm.id ? "编辑资源" : "新增资源"}</h2>
            <Input placeholder="分类" value={rForm.category} onChange={(e) => setRForm({ ...rForm, category: e.target.value })} />
            <Input placeholder="小分类" value={rForm.grp} onChange={(e) => setRForm({ ...rForm, grp: e.target.value })} />
            <Input placeholder="标题" value={rForm.title} onChange={(e) => setRForm({ ...rForm, title: e.target.value })} />
            <Input placeholder="网址" value={rForm.url} onChange={(e) => setRForm({ ...rForm, url: e.target.value })} />
            <Input placeholder="描述" value={rForm.description} onChange={(e) => setRForm({ ...rForm, description: e.target.value })} />
            <Input type="number" placeholder="排序" value={rForm.sortOrder} onChange={(e) => setRForm({ ...rForm, sortOrder: Number(e.target.value) })} />
            <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-[hsl(22_100%_57%)] to-[hsl(42_100%_57%)] text-white shadow-sm">保存资源</Button>
          </form>

          <div className="space-y-2">
            {resources.map((r) => (
              <div key={r.id} className="ak-card flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.category} / {r.grp}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setRForm({ id: r.id, category: r.category, grp: r.grp, title: r.title, url: r.url, description: r.description ?? "", sortOrder: r.sortOrder ?? 0 })}>编辑</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteResource(r.id)}>删除</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}