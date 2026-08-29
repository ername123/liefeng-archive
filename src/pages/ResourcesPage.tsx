import { trpc } from "@/providers/trpc";
import { BackButton } from "@/components/BackButton";
import { Skeleton } from "@/components/ui/skeleton";
import { DoodleStar, SquiggleUnderline, CARNIVAL_COLORS } from "@/components/Doodles";
import {
  Gamepad2, Palette, Wrench, Clapperboard, PenTool, Code2, MessagesSquare,
  ExternalLink, type LucideIcon,
} from "lucide-react";

// 大类 -> 图标 + 英文小标
const CAT_META: Record<string, { icon: LucideIcon; en: string }> = {
  ACG综合资源: { icon: Gamepad2, en: "ACG" },
  "MAD/MMD/创作": { icon: Palette, en: "CREATION" },
  动画影视资源: { icon: Clapperboard, en: "ANIME & VIDEO" },
  "动画/影视资源": { icon: Clapperboard, en: "ANIME & VIDEO" },
  绘画设计: { icon: PenTool, en: "ART & DESIGN" },
  编程开发: { icon: Code2, en: "DEV" },
  "编程/开发": { icon: Code2, en: "DEV" },
  工具软件: { icon: Wrench, en: "TOOLS" },
  "工具/软件": { icon: Wrench, en: "TOOLS" },
  论坛社区: { icon: MessagesSquare, en: "COMMUNITY" },
  "论坛/社区": { icon: MessagesSquare, en: "COMMUNITY" },
};
// 大类展示顺序
const CAT_ORDER = ["ACG综合资源", "动画/影视资源", "MAD/MMD/创作", "绘画设计", "编程/开发", "工具/软件", "论坛/社区"];

export default function ResourcesPage() {
  const { data, isLoading } = trpc.medical.resourceList.useQuery();

  // 按大类分组，组内再按小分类分组
  const byCat = CAT_ORDER.map((cat) => {
    const items = (data ?? []).filter((r) => r.category === cat);
    const groups: Record<string, typeof items> = {};
    for (const r of items) {
      const g = r.grp || "综合";
      (groups[g] ||= []).push(r);
    }
    return { cat, groups };
  }).filter((c) => Object.keys(c.groups).length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <BackButton to="/home" label="首页" className="mb-5" />
      <div className="mb-2 flex items-center gap-3">
        <span className="h-1.5 w-8 rounded-full bg-primary" />
        <span className="hud-tag">// EXTERNAL LINKS</span>
      </div>
      <div className="relative">
        <h1 className="font-display text-4xl tracking-wide">资源导航</h1>
        <SquiggleUnderline className="mt-2" />
        <img
          src="/stickers/amiya-wave.png"
          alt="阿米娅"
          className="doodle-float absolute -top-8 right-0 hidden w-28 select-none md:block"
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        按大类分组的常用网站收藏，已剔除失效链接，点击卡片在新窗口打开。
      </p>

      {isLoading ? (
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        byCat.map(({ cat, groups }, ci) => {
          const meta = CAT_META[cat] ?? { icon: Wrench, en: "" };
          const Icon = meta.icon;
          const color = CARNIVAL_COLORS[ci % CARNIVAL_COLORS.length];
          return (
            <section key={cat} className="mt-14">
              {/* 大类标题 */}
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="ak-btn-cut flex h-11 w-11 items-center justify-center text-white shadow-[3px_3px_0_hsl(203_33%_16%/0.15)]"
                  style={{ background: color }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-2xl tracking-wide">
                  <span className="mr-2 text-lg" style={{ color }}>{String(ci + 1).padStart(2, "0")}</span>
                  {cat}
                </h2>
                <span className="hud-tag">{meta.en}</span>
                <span className="hidden h-0.5 flex-1 rounded-full bg-foreground/10 md:block" />
                <DoodleStar className="hidden h-5 w-5 md:block" color={color} />
              </div>

              {/* 小分类 */}
              {Object.entries(groups).map(([g, items]) => (
                <div key={g} className="mb-7">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                    <span className="font-tech text-xs uppercase tracking-widest text-muted-foreground">{g}</span>
                    <span className="h-px flex-1 bg-foreground/10" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((r) => (
                      <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="ak-card h-full p-4">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold leading-snug">{r.title}</span>
                            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                          </div>
                          {r.description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                          )}
                          <p className="mt-2 truncate font-tech text-[11px] text-muted-foreground/50">
                            {r.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}
