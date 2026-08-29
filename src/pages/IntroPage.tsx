import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageTransition } from "@/providers/page-transition";
import { DoodleStar, DoodleSparkle, DoodleSquiggle, DoodleCitrus, DoodlePlus } from "@/components/Doodles";

/**
 * 进站首页：ignoredone.space 式操作模式
 * - 进场时元素逐个弹跳入场（stagger）
 * - 屏与屏之间整页"翻页"过渡（当前屏滑出、下一屏滑入）
 * - 中央大圆点矩阵 + START 入口 + 角落编号标签
 * 配色：夏活嘉年华——暖白底 + 彩色涂鸦圆点
 */

const PANELS = [
  { empty: 2, corners: { tl: "#0", tr: "#1", bl: "LIEFENG", br: "RESOURCE" } },
  { empty: 3, corners: { tl: "STATION", tr: "#2", bl: "LIEFENG", br: "EVERYDAY" } },
  { empty: 1, corners: { tl: "MEDICAL", tr: "#3", bl: "LIEFENG", br: "NOTES" } },
];

// 圆点矩阵配色（跳过空位与 START 位，按索引取色）
const DOT_COLORS = [
  "hsl(199 89% 46%)", // 蓝
  "hsl(342 100% 69%)", // 粉
  "hsl(22 100% 57%)", // 橙
  "hsl(42 100% 57%)", // 黄
  "hsl(190 84% 50%)", // 青
];

const NAV = [
  { to: "/quiz", label: "自测题库" },
  { to: "/resources", label: "资源导航" },
  { to: "/subject/physiology", label: "生理学" },
  { to: "/subject/anatomy", label: "系统解剖学" },
];

// 逐字弹跳入场的文字
function Letters({ text, base = 0, className }: { text: string; base?: number; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="intro-letter"
          style={{ animationDelay: `${base + i * 85}ms` }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function IntroPage() {
  const navigate = useNavigate();
  const { transitionTo } = usePageTransition();
  const [panel, setPanel] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [entered, setEntered] = useState(false);
  const lock = useRef(false);
  const touchY = useRef(0);

  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 30);
    return () => window.clearTimeout(t);
  }, []);

  const go = (d: 1 | -1) => {
    if (lock.current) return;
    lock.current = true;
    setDir(d);
    setPanel((p) => (p + d + PANELS.length) % PANELS.length);
    window.setTimeout(() => (lock.current = false), 1250);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 12) return;
      go(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) go(1);
      if (["ArrowUp", "PageUp"].includes(e.key)) go(-1);
    };
    const onTouchStart = (e: TouchEvent) => (touchY.current = e.touches[0].clientY);
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) go(dy > 0 ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      {/* 散落的手绘涂鸦 */}
      <DoodleStar className="doodle-float absolute left-[10%] top-[18%] h-9 w-9 opacity-80" color="#f5b800" />
      <DoodleStar className="doodle-float absolute right-[12%] top-[24%] h-6 w-6 opacity-70" color="#ff6f9c" />
      <DoodleSparkle className="doodle-spin absolute left-[20%] bottom-[22%] h-6 w-6 opacity-70" />
      <DoodleCitrus className="doodle-spin absolute right-[18%] bottom-[30%] h-10 w-10 opacity-60" />
      <DoodlePlus className="absolute right-[30%] top-[14%] h-5 w-5 opacity-60" />
      <DoodleSquiggle className="absolute left-[8%] bottom-[12%] h-6 w-36 opacity-50" />
      {/* 顶部极简横向导航（逐个淡入下落） */}
      <nav className="absolute inset-x-0 top-0 z-20 flex items-center justify-center gap-6 py-6 md:gap-10">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(190_84%_50%)] to-[hsl(217_66%_52%)] font-display text-lg text-white shadow-[3px_3px_0_hsl(203_33%_16%/0.15)] transition-all duration-500",
            entered ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
          )}
          style={{ transitionDelay: "80ms" }}
        >
          烈
        </span>
        {NAV.map((n, i) => (
          <button
            key={n.to}
            onClick={() => navigate(n.to)}
            className={cn(
              "text-sm text-muted-foreground transition-all duration-500 hover:text-primary",
              entered ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
            )}
            style={{ transitionDelay: `${160 + i * 70}ms` }}
          >
            {n.label}
          </button>
        ))}
      </nav>

      {/* 左上角站名（逐字跳入） */}
      <div className="hud-tag absolute left-5 top-6 z-20 hidden md:block">
        <Letters text="LIEFENG" base={500} />
      </div>

      {/* 翻页容器：整屏沿滑入/滑出 */}
      <div
        key={panel}
        className={cn(
          "absolute inset-0 z-10",
          dir === 1 ? "flip-in-up" : "flip-in-down",
        )}
      >
        <Panel panel={panel} entered={entered} onStart={() => transitionTo("/home")} />
      </div>

      {/* 底部大号站名（逐字跳入） */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 select-none md:bottom-8 md:left-8">
        <div className="font-display text-[17vw] font-bold leading-none tracking-tight text-foreground md:text-[11rem]">
          <Letters text="LIEFENG" base={650} />
        </div>
      </div>

      {/* 屏幕切换指示点 */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
        {PANELS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i !== panel) {
                setDir(i > panel ? 1 : -1);
                setPanel(i);
              }
            }}
            aria-label={`第 ${i + 1} 屏`}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              i === panel ? "scale-125 bg-primary" : "bg-muted-foreground/40 hover:bg-muted-foreground",
            )}
          />
        ))}
      </div>

      {/* 滚动提示 */}
      <div className="hud-tag absolute bottom-6 left-1/2 z-20 -translate-x-1/2 animate-pulse">
        SCROLL ↓
      </div>
    </div>
  );
}

function Panel({
  panel,
  entered,
  onStart,
}: {
  panel: number;
  entered: boolean;
  onStart: () => void;
}) {
  const cur = PANELS[panel];
  return (
    <>
      {/* 中央圆点矩阵：进场逐个弹入 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => {
            const isEmpty = i === cur.empty;
            const isStart = i === 5;
            const delay = 350 + i * 140;
            const baseCls = cn(
              "h-24 w-24 md:h-36 md:w-36 rounded-full transition-all duration-700",
              entered ? "scale-100 opacity-100" : "scale-0 opacity-0",
              isEmpty && "border-2 border-dashed border-foreground/25 bg-transparent",
            );
            const dotColor = DOT_COLORS[i % DOT_COLORS.length];
            if (isStart) {
              return (
                <button
                  key={`${panel}-${i}`}
                  onClick={onStart}
                  aria-label="进入主页"
                  style={{ transitionDelay: `${delay}ms`, background: "hsl(22 100% 57%)" }}
                  className={cn(baseCls, "group flex items-center justify-center shadow-[6px_8px_0_hsl(22_100%_45%/0.3)] hover:!scale-105")}
                >
                  <span className="flex flex-col items-center gap-1 text-white">
                    <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 md:h-8 md:w-8" strokeWidth={2.5} />
                    <span className="font-tech text-[10px] font-semibold tracking-widest md:text-xs">START</span>
                  </span>
                </button>
              );
            }
            return (
              <div
                key={`${panel}-${i}`}
                style={{ transitionDelay: `${delay}ms`, background: isEmpty ? undefined : dotColor }}
                className={cn(baseCls, !isEmpty && "shadow-[5px_6px_0_hsl(203_33%_16%/0.12)]")}
              />
            );
          })}
        </div>
      </div>

      {/* 角落编号标签（随屏切换） */}
      <CornerTag pos="left-[4vw] top-[38vh] hidden md:block" text={cur.corners.tl} />
      <CornerTag pos="right-[4vw] top-[38vh] hidden md:block" text={cur.corners.tr} />
      <CornerTag pos="right-[4vw] top-[60vh] hidden md:block" text={cur.corners.br} />
    </>
  );
}

function CornerTag({ pos, text }: { pos: string; text: string }) {
  return (
    <div className={cn("hud-tag absolute z-20", pos)}>
      <Letters text={text} base={0} />
    </div>
  );
}
