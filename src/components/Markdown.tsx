import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Link2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * 笔记渲染器：支持 Markdown 标题/表格/列表/引用，
 * 并将 ==文本== 渲染为重点高亮。
 * h2/h3 自动生成锚点 id，供右侧「本页内容」导航跳转。
 */

// 从标题文本生成稳定锚点 id
export function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 提取正文里的 h2 小节（供右侧目录）
export function extractToc(content: string): { id: string; text: string; level: 2 | 3 }[] {
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];
  const seen = new Map<string, number>();
  for (const line of content.split("\n")) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!m) continue;
    const text = m[2].replace(/==/g, "").replace(/[*`]/g, "").trim();
    let id = slugify(text);
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n}`;
    toc.push({ id, text, level: m[1].length as 2 | 3 });
  }
  return toc;
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

// 标题组件：带 id + 悬停显示的锚点链接
function makeHeading(Tag: "h2" | "h3") {
  return function Heading({ children }: { children?: ReactNode }) {
    const id = slugify(textOf(children));
    return (
      <Tag id={id} className="group/head relative scroll-mt-24">
        <a
          href={`#${id}`}
          className="anchor-link"
          aria-label="锚点链接"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            history.replaceState(null, "", `#${id}`);
          }}
        >
          <Link2 className="h-4 w-4" />
        </a>
        {children}
      </Tag>
    );
  };
}

export function Markdown({ content }: { content: string }) {
  const processed = content.replace(/==(.+?)==/gs, "<mark>$1</mark>");
  return (
    <div className="md-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{ h2: makeHeading("h2"), h3: makeHeading("h3") }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
