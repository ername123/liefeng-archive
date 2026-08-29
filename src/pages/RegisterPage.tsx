import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || password.length < 6) {
      toast.error("请填写用户名、邮箱和至少 6 位密码");
      return;
    }
    setPending(true);
    try {
      await register(username.trim(), email.trim(), password);
      toast.success("注册成功");
      navigate("/home");
    } catch (err: any) {
      toast.error(err.message || "注册失败");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="ak-card p-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold">注册</h1>
          <p className="mt-1 text-sm text-muted-foreground">创建你的烈风资源站账号</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="密码（至少 6 位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-[hsl(22_100%_57%)] to-[hsl(42_100%_57%)] text-white shadow-sm" disabled={pending}>
            {pending ? "注册中…" : "注册"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          已有账号？{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}