/**
 * Single entry point for every backend call the dashboard makes.
 *
 * Everything goes through `apiFetch`, which attaches the bearer token and treats
 * a 401 from any endpoint as "this session is over" — the token is cleared and
 * listeners are told to send the user back to the login screen.
 */

export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://zenora-backend-black.vercel.app';

const TOKEN_KEY = 'zenoraAuthToken';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
}

/** Read the token from whichever store the user's "remember me" choice put it in. */
export const getToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

export const setToken = (token: string, persist: boolean) => {
  clearToken();
  (persist ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  // Legacy client-side "logged in" flags. These granted access on their own in an
  // earlier version, so remove them wherever they are still lying around.
  localStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminUser');
  sessionStorage.removeItem('adminUser');
};

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

/** Register a handler for "the server rejected our token". Returns an unsubscribe fn. */
export const onUnauthorized = (listener: UnauthorizedListener): (() => void) => {
  unauthorizedListeners.add(listener);
  return () => { unauthorizedListeners.delete(listener); };
};

export class UnauthorizedError extends Error {
  constructor() {
    super('Session expired');
    this.name = 'UnauthorizedError';
  }
}

/**
 * `fetch` against the API with the bearer token attached.
 *
 * On 401 the token is dropped and every listener is notified before the promise
 * rejects, so a stale session can never leave the dashboard rendered.
 */
export const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    unauthorizedListeners.forEach(l => l());
    throw new UnauthorizedError();
  }

  return res;
};

/** POST /api/auth/login. Does not go through apiFetch — there is no token yet. */
export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || (res.status === 429
      ? 'Too many login attempts. Please try again later.'
      : 'Invalid credentials'));
  }
  return data as { success: true; token: string; user: AuthUser };
};

/**
 * Validate the stored token against live server state.
 *
 * This is the authority on whether the user is signed in — the presence of a
 * token in storage is not, because anyone can write one there.
 */
export const fetchMe = async (): Promise<AuthUser | null> => {
  if (!getToken()) return null;
  try {
    const res = await apiFetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  } catch (err) {
    return null;
  }
};

export const changeOwnPassword = async (currentPassword: string, newPassword: string) => {
  const res = await apiFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
  return data as { success: true; token: string };
};
