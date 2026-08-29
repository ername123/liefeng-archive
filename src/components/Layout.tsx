import { useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DoodleStar } from "@/components/Doodles";

const NAV = [
  { to: "/home", label: "首页", en: "INDEX" },
  { to: "/resources", label: "资源导航", en: "LINKS" },
  { to: "/quiz", label: "自测题库", en: "QUIZ" },
];

export function SearchBox({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const [kw, setKw] = useState("");
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = kw.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };
  return (
    <form onSubmit={submit} className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="搜索知识点，如：钠钾泵 / 化生 / 稽留热"
          className="rounded-full border-2 border-foreground/70 bg-white pl-10 font-tech text-sm shadow-[3px_3px_0_hsl(203_33%_16%/0.1)] placeholder:text-muted-foreground/70 focus-visible:border-[hsl(199_89%_46%)] focus-visible:ring-0"
          autoFocus={autoFocus}
        />
      </div>
    </form>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b-2 border-foreground/10 bg-background/90 backdrop-blur">
        {/* 顶部嘉年华彩带 */}
        <div className="stripe-bar h-[5px] w-full" />
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-4">
          <Link to="/home" className="group flex shrink-0 items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(190_84%_50%)] to-[hsl(217_66%_52%)] font-display text-xl text-white shadow-[3px_3px_0_hsl(203_33%_16%/0.15)] transition-transform group-hover:-rotate-6">
              烈
              <DoodleStar className="absolute -right-2 -top-2 h-4 w-4 transition-transform group-hover:scale-125" color="#f5b800" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] tracking-wide">烈风资源站</span>
              <span className="hud-tag mt-1">LIEFENG ARCHIVE</span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/home"}
                className={({ isActive }) =>
                  `group flex flex-col items-start rounded-xl px-3 py-1.5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:bg-white hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="hud-tag !text-[0.58rem] opacity-70 group-hover:opacity-100">{n.en}</span>
                    <span className={`text-sm ${isActive ? "font-bold" : ""}`}>
                      {n.label}
                      {isActive && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <SearchBox className="ml-auto hidden w-72 md:block lg:w-96" />

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="菜单"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="border-t px-4 py-3 md:hidden">
            <nav className="mb-3 flex gap-2">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/home"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-sm ${
                      isActive ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <SearchBox />
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t-2 border-foreground/10 py-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-xs text-muted-foreground md:flex-row md:justify-between">
          <span className="hud-tag">LIEFENG · RESOURCE STATION // SUMMER 2026</span>
          <p>个人学习整理，仅供学习参考，不构成诊疗依据</p>
        </div>
      </footer>
    </div>
  );
}
