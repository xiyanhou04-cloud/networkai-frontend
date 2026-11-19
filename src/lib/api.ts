export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://networkai-513321.uw.r.appspot.com"
).replace(/\/+$/, "");
 
export class ApiError extends Error {
  constructor(public status: number) {
	super(status === 401 ? "Please check your sign-in." : `Request failed (${status}).`);
  }
}
 
async function request(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(API_BASE_URL + path, {
	...init, headers, cache: "no-store",
  });
  if (!response.ok) throw new ApiError(response.status);
  return response;
}
 
function credentials(username: string, password: string): RequestInit {
  return {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ username: username.trim(), password }),
  };
}
 
export async function registerAccount(username: string, password: string) {
  await request("/users", credentials(username, password));
}
 
export async function login(username: string, password: string) {
  const response = await request("/auth/login", credentials(username, password));
  return (await response.text()).trim();
}

export type Post = {
  id: string;
  user: string;
  message: string;
  url: string;
  type: "image" | "video" | "unknown";
};
 
export async function searchPosts(
  token: string,
  filters: { keywords?: string; user?: string } = {},
  signal?: AbortSignal,
): Promise<Post[]> {
  const query = new URLSearchParams();
  if (filters.user?.trim()) query.set("user", filters.user.trim());
  else if (filters.keywords?.trim()) query.set("keywords", filters.keywords.trim());
  const suffix = query.size ? `?${query}` : "";
  const response = await request(`/posts/search${suffix}`, { signal }, token);
  const result: Post[] | null = await response.json();
  return result ?? [];
}

export async function createPost(token: string, message: string, media: File) {
  const data = new FormData();
  data.set("message", message.trim());
  const filename = media.name.replace(/\.[^.]+$/, (ext) => ext.toLowerCase());
  data.set("media_file", media, filename);
  await request("/posts", { method: "POST", body: data }, token);
}

export async function deletePost(token: string, postId: string) {
  await request(`/posts/${encodeURIComponent(postId)}`, { method: "DELETE" }, token);
}
