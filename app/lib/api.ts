import { router } from "expo-router";
import { BASE_URL } from "../config";
import { clearAuthToken, getAuthToken, setStoredUserRole } from "./storage";

type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function handleUnauthorized() {
  await clearAuthToken();
  await setStoredUserRole("customer");

  if (onUnauthorized) {
    onUnauthorized();
    return;
  }

  router.replace("/login");
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  if (response.status === 401 && path === "/auth/login") {
    throw new Error("Invalid email or password");
  }

  if (response.status === 401) {
    await handleUnauthorized();
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      typeof errorBody?.message === "string"
        ? errorBody.message
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
};
