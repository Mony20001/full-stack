const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } catch {
    throw new Error(`Cannot reach the API at ${API_URL}. Confirm Backend_API is running and that this browser origin is allowed.`);
  }
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.message || "Request failed");
  return payload;
}

export const apiList = async (path) => {
  const payload = await api(path);
  return payload.data || payload;
};
