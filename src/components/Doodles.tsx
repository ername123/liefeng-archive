import { cn } from "@/lib/utils";

/**
 * 夏日嘉年华手绘涂鸦装饰组：
 * 描边星星 / 四角闪光 / 波浪线 / 柠檬切片 / 加号
 * 仅描边、无填充，像用彩笔随手画在页面上。
 */

export function DoodleStar({ className, color = "#f5b800" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <path
        d="M20 3.5c1.6 5.8 3.2 8.9 5.2 11.2 2 2.4 5 4 11.3 5.3-6.2 1.4-9.2 3-11.3 5.4-2 2.3-3.6 5.4-5.2 11.1-1.6-5.7-3.2-8.8-5.2-11.1-2-2.4-5.1-4-11.3-5.4C9.7 18.6 12.7 17 14.8 14.7 16.8 12.4 18.4 9.3 20 3.5Z"
        stroke={color}
        strokeWidth="2.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleSparkle({ className, color = "#22c3e6" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        d="M12 2v5M12 17v5M2 12h5M17 12h5"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.4" stroke={color} strokeWidth="2.2" />
    </svg>
  );
}

export function DoodleSquiggle({ className, color = "#ff6f9c" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden fill="none">
      <path
        d="M3 15c8-10 12-10 18 0s10 10 18 0 12-10 18 0 10 10 18 0 12-10 18 0 10 10 18 0"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleCitrus({ className, color = "#a4c639" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <circle cx="20" cy="20" r="15.5" stroke={color} strokeWidth="2.6" />
      <circle cx="20" cy="20" r="9" stroke={color} strokeWidth="2" />
      <path
        d="M20 5.5v6M20 28.5v6M5.5 20h6M28.5 20h6M10 10l4.2 4.2M25.8 25.8 30 30M30 10l-4.2 4.2M14.2 25.8 10 30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodlePlus({ className, color = "#ff7a30" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden fill="none">
      <path d="M10 3v14M3 10h14" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleDrop({ className, color = "#22c3e6" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        d="M12 3.5c2.5 4 5.5 7 5.5 10.5a5.5 5.5 0 1 1-11 0C6.5 10.5 9.5 7.5 12 3.5Z"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 页面标题旁的手绘波浪下划线 */
export function SquiggleUnderline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 14" className={cn("h-3 w-48", className)} aria-hidden fill="none" preserveAspectRatio="none">
      <path
        d="M3 9c10-7 16-7 26 0s16 7 26 0 16-7 26 0 16 7 26 0 16-7 26 0 16 7 26 0 16-7 26 0"
        stroke="hsl(22 100% 57%)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 嘉年华配色轮转：蓝/橙/粉/黄/青/绿 */
export const CARNIVAL_COLORS = [
  "hsl(199 89% 46%)",
  "hsl(22 100% 57%)",
  "hsl(342 100% 69%)",
  "hsl(42 100% 57%)",
  "hsl(190 84% 50%)",
  "hsl(82 62% 48%)",
];
