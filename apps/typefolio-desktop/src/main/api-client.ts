import { API_URL } from "./config";
import { store } from "./store";

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = store.get("token");
  const base = store.get("apiBaseUrl") || API_URL;
  const url = path.startsWith("http") ? path : new URL(path, base).toString();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; data?: T }> {
  const res = await apiFetch(path, init);
  if (res.status === 204) {
    return { status: res.status };
  }
  const text = await res.text();
  if (!text) {
    return { status: res.status };
  }
  try {
    return { status: res.status, data: JSON.parse(text) as T };
  } catch {
    return { status: res.status };
  }
}
