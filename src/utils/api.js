const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8001/api/v1").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function buildApiUrl(path) {
  const normalizedPath = String(path ?? "").startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", token, body, headers = {} } = options;
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" && payload?.detail) ||
      (typeof payload === "string" && payload) ||
      "Server bilan ishlashda xatolik yuz berdi.";

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
