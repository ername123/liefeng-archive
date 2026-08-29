import { ArrowLeft } from "lucide-react";
import { usePageTransition } from "@/providers/page-transition";
import { cn } from "@/lib/utils";

/**
 * 统一返回键：点击后带反向翻页动画回到目标页。
 */
export function BackButton({ to, label = "返回", className }: { to: string; label?: string; className?: string }) {
  const { transitionTo } = usePageTransition();
  return (
    <button
      onClick={() => transitionTo(to, { reverse: true })}
      className={cn(
        "group inline-flex items-center gap-2 font-tech text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary",
        className,
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-foreground/50 bg-white shadow-[2px_2px_0_hsl(203_33%_16%/0.12)] transition-all group-hover:-translate-x-0.5 group-hover:border-primary group-hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
      </span>
      {label}
    </button>
  );
}
