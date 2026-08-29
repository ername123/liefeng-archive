import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!account.trim() || !password) {
      toast.error("请输入账号和密码");
      return;
    }
    setPending(true);
    try {
      await login(account.trim(), password);
      toast.success("登录成功");
      navigate("/home");
    } catch (err: any) {
      toast.error(err.message || "登录失败");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="ak-card p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(190_84%_50%)] to-[hsl(217_66%_52%)] font-display text-2xl font-bold text-white shadow-[3px_3px_0_hsl(203_33%_16%/0.15)]">
            烈
          </span>
          <h1 className="font-display text-2xl font-bold">登录</h1>
          <p className="mt-1 text-sm text-muted-foreground">欢迎回来，烈风资源站</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            placeholder="用户名或邮箱"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-[hsl(22_100%_57%)] to-[hsl(42_100%_57%)] text-white shadow-sm" disabled={pending}>
            {pending ? "登录中…" : "登录"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          还没有账号？{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            去注册
          </Link>
        </p>
      </div>
    </div>
  );
}