// This is the API origin. Callers provide the `/api/...` route.
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } catch {
    throw new Error(`Cannot reach the API at ${API_URL}. Start Backend_API (npm run dev) and confirm VITE_API_URL is correct.`);
  }

  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.message || "Request failed");
  return payload;
}
