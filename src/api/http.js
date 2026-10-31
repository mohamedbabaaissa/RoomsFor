import { USE_MOCK, API_URL, MOCK_LATENCY } from './config';
import { handleMock } from './mock/server';

const TOKEN_KEY = 'rfr_token';
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} };

export class ApiError extends Error {
  constructor(status, message, data) { super(message); this.status = status; this.data = data; }
}

const qs = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.append(k, v); });
  const s = p.toString();
  return s ? `?${s}` : '';
};

/**
 * Single entry point for every API call.
 *   request('GET', '/listings', { params: { city: 'Dubai' } })
 *   request('POST', '/auth/login', { body: { email, password } })
 * Mock mode -> src/api/mock/server.js. Real mode -> fetch(API_URL + path).
 */
export async function request(method, path, { body, params } = {}) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, MOCK_LATENCY));
    const res = handleMock({ method, path, body, params: params || {}, token: getToken() });
    if (res.status >= 400) throw new ApiError(res.status, res.data?.message || 'Request failed', res.data);
    return res.data;
  }
  const res = await fetch(`${API_URL}${path}${qs(params)}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.message || res.statusText, data);
  return data;
}
