import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

type TransitionCtx = {
  /** 带横向翻页动画地跳转；reverse=true 为反向（返回）翻页 */
  transitionTo: (to: string, opts?: { reverse?: boolean }) => void;
};

const Ctx = createContext<TransitionCtx>({ transitionTo: () => {} });

export const usePageTransition = () => useContext(Ctx);

const DURATION = 1000; // 与 CSS 动画时长一致

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [reverse, setReverse] = useState(false);
  const busy = useRef(false);

  const transitionTo = useCallback(
    (to: string, opts?: { reverse?: boolean }) => {
      if (busy.current) return;
      busy.current = true;
      setReverse(!!opts?.reverse);
      setActive(true);
      // 动画进行到一半、旧页已基本滑出时再切换路由，新页随覆盖层一起进入
      window.setTimeout(() => navigate(to), DURATION * 0.45);
      window.setTimeout(() => {
        setActive(false);
        busy.current = false;
      }, DURATION);
    },
    [navigate],
  );

  return (
    <Ctx.Provider value={{ transitionTo }}>
      {children}
      {/* 翻页覆盖层：深色扫条从右扫到左（正向）或反向，遮住切换瞬间 */}
      <div
        aria-hidden
        className={cn(
          "page-wipe pointer-events-none fixed inset-0 z-[90]",
          reverse && "page-wipe-reverse",
          active ? (reverse ? "page-wipe-run-reverse" : "page-wipe-run") : "page-wipe-idle",
        )}
      />
    </Ctx.Provider>
  );
}
