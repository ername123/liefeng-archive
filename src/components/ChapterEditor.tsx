import { useEffect, useRef, useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type ChapterDraft = {
  id?: number;
  title: string;
  summary: string;
  content: string;
};

export function ChapterEditor({
  open,
  onOpenChange,
  subjectId,
  chapter,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subjectId: number;
  chapter?: ChapterDraft | null;
  onSaved: (newId?: number) => void;
}) {
  const utils = trpc.useUtils();
  const [draft, setDraft] = useState<ChapterDraft>({ title: "", summary: "", content: "" });

  useEffect(() => {
    if (open) {
      setDraft(
        chapter
          ? { id: chapter.id, title: chapter.title, summary: chapter.summary, content: chapter.content }
          : { title: "", summary: "", content: "" },
      );
    }
  }, [open, chapter]);

  const create = trpc.medical.chapterCreate.useMutation({
    onSuccess: async ({ id }) => {
      toast.success("笔记已保存");
      await utils.medical.subjectList.invalidate();
      await utils.medical.subjectDetail.invalidate();
      onOpenChange(false);
      onSaved(id);
    },
    onError: (e) => toast.error("保存失败：" + e.message),
  });

  const update = trpc.medical.chapterUpdate.useMutation({
    onSuccess: async () => {
      toast.success("笔记已更新");
      await utils.medical.subjectDetail.invalidate();
      await utils.medical.chapterById.invalidate();
      onOpenChange(false);
      onSaved(draft.id);
    },
    onError: (e) => toast.error("保存失败：" + e.message),
  });

  const pending = create.isPending || update.isPending;

  // ---- 图片上传 ----
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertAtCursor = (snippet: string) => {
    const ta = textareaRef.current;
    setDraft((d) => {
      if (!ta) return { ...d, content: d.content + snippet };
      const start = ta.selectionStart ?? d.content.length;
      const end = ta.selectionEnd ?? d.content.length;
      const next = d.content.slice(0, start) + snippet + d.content.slice(end);
      return { ...d, content: next };
    });
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "上传失败");
      insertAtCursor(`\n![${file.name.replace(/\.[^.]+$/, "")}](${data.url})\n`);
      toast.success("图片已插入");
    } catch (err: any) {
      toast.error(err.message || "上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast.error("标题和正文不能为空");
      return;
    }
    const payload = { title: draft.title.trim(), summary: draft.summary.trim(), content: draft.content };
    if (draft.id) update.mutate({ id: draft.id, ...payload });
    else create.mutate({ subjectId, ...payload });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>{draft.id ? "编辑笔记" : "新增章节笔记"}</DialogTitle>
          <DialogDescription>
            支持 Markdown：## 标题、- 列表、| 表格 |、&gt; 引用，用 ==文本== 做重点高亮。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="章节标题，如：炎症"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <Input
            placeholder="一句话摘要（可选），会显示在章节目录中"
            value={draft.summary}
            onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
          />
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">正文（Markdown）</span>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickImage}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 "
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                  {uploading ? "上传中…" : "上传图片"}
                </Button>
              </div>
            </div>
            <Textarea
              ref={textareaRef}
              placeholder="正文内容（Markdown 格式）…"
              value={draft.content}
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
              className="min-h-[320px]  font-mono text-sm leading-relaxed"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? "保存中…" : "保存"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
