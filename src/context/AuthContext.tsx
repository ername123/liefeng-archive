import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type User } from "@/api/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (account: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** 登录状态管理：使用 React Context，不用额外状态库 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const { user } = await api.auth.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (account: string, password: string) => {
    const { user } = await api.auth.login(account, password);
    setUser(user);
  };

  const register = async (username: string, email: string, password: string) => {
    const { user } = await api.auth.register(username, email, password);
    setUser(user);
  };

  const logout = async () => {
    await api.auth.logout().catch(() => null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}