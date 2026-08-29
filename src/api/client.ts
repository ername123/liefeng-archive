// 前端访问后端 REST API 的统一封装（fetch + credentials: include 自动带 Cookie）
type User = { id: string; username: string; email: string; role: "USER" | "ADMIN" };
type Post = {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  author?: string | null;
};
type Comment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  author?: string | null;
};
type Note = { id?: string; chapterId: number; content: string; updatedAt?: string; chapterTitle?: string | null; subjectSlug?: string | null };

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "请求失败");
  }
  return data as T;
}

export const api = {
  auth: {
    me: () => request<{ user: User }>("/api/auth/me"),
    login: (account: string, password: string) =>
      request<{ user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify({ account, password }) }),
    register: (username: string, email: string, password: string) =>
      request<{ user: User }>("/api/auth/register", { method: "POST", body: JSON.stringify({ username, email, password }) }),
    logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  },
  examples: {
    get: (chapterId: number) => request<{ content: string }>(`/api/examples/${chapterId}`),
  },
  notes: {
    list: () => request<{ notes: Note[] }>("/api/notes"),
    get: (chapterId: number) => request<{ content: string }>(`/api/notes/${chapterId}`),
    save: (chapterId: number, content: string) =>
      request<{ ok: true }>(`/api/notes/${chapterId}`, { method: "POST", body: JSON.stringify({ content }) }),
  },
  experiences: {
    list: (mine = false) => request<{ posts: Post[] }>(`/api/experiences${mine ? "?mine=1" : ""}`),
    detail: (id: string) => request<{ post: Post }>(`/api/experiences/${id}`),
    create: (title: string, content: string, tags: string, isPublic: boolean) =>
      request<{ post: Post }>("/api/experiences", { method: "POST", body: JSON.stringify({ title, content, tags, isPublic }) }),
    remove: (id: string) => request<{ ok: true }>(`/api/experiences/${id}`, { method: "DELETE" }),
  },
  comments: {
    list: (postId: string) => request<{ comments: Comment[] }>(`/api/comments?postId=${encodeURIComponent(postId)}`),
    create: (postId: string, content: string) =>
      request<{ comment: Comment }>("/api/comments", { method: "POST", body: JSON.stringify({ postId, content }) }),
    remove: (id: string) => request<{ ok: true }>(`/api/comments/${id}`, { method: "DELETE" }),
  },
  resources: {
    list: () => request<{ resources: Array<Record<string, unknown>> }>("/api/resources"),
    create: (r: Record<string, unknown>) => request("/api/resources", { method: "POST", body: JSON.stringify(r) }),
    update: (id: number, r: Record<string, unknown>) => request(`/api/resources/${id}`, { method: "PUT", body: JSON.stringify(r) }),
    remove: (id: number) => request(`/api/resources/${id}`, { method: "DELETE" }),
  },
};

export type { User, Post, Comment, Note };