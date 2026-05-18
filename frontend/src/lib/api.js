const BASE = import.meta.env.VITE_API_BASE ?? '';

function getCsrf() {
  return (
    document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('csrftoken='))
      ?.split('=')[1] ?? ''
  );
}

export async function apiFetch(path, opts = {}) {
  const unsafe = opts.method && opts.method !== 'GET';
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(unsafe ? { 'X-CSRFToken': getCsrf() } : {}),
      ...opts.headers,
    },
    ...opts,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw Object.assign(new Error(res.statusText), { status: res.status });
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Auth
export const getAuthStatus = () => apiFetch('/api/auth/');
export const logout = () => apiFetch('/api/auth/logout/', { method: 'POST' });

// Me
export const getMe = () => apiFetch('/api/members/me/');
export const patchMe = (body) => apiFetch('/api/members/me/', { method: 'PATCH', body });

// Public (unauthenticated)
export const getPublicStats = () => apiFetch('/api/metrics/public/');

// Periods
export const getPeriods = () => apiFetch('/api/metrics/periods/');

// Scoreboard
export const getScoreboard = () => apiFetch('/api/metrics/scoreboard/');

// Activities
export const getActivities = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  );
  const q = qs.toString();
  return apiFetch(`/api/activities/${q ? `?${q}` : ''}`);
};
export const getSportTypes = () => apiFetch('/api/activities/sports/');

// Roster
export const getRoster = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  );
  const q = qs.toString();
  return apiFetch(`/api/members/roster/${q ? `?${q}` : ''}`);
};

// Sections (public)
export const getSections = () => apiFetch('/api/members/sections/');

// Roster requests (public)
export const submitRosterRequest = (body) =>
  apiFetch('/api/members/roster-requests/', { method: 'POST', body });

// Art
export const getArtWall = (periodId) => apiFetch(`/api/art/wall/?period=${periodId}`);
export const getMyArtSub = (periodId) =>
  apiFetch(`/api/art/submissions/me/?period=${periodId}`);
export const createArtSub = (body) =>
  apiFetch('/api/art/submissions/', { method: 'POST', body });
export const patchArtSub = (id, body) =>
  apiFetch(`/api/art/submissions/${id}/`, { method: 'PATCH', body });
export const deleteArtSub = (id) =>
  apiFetch(`/api/art/submissions/${id}/`, { method: 'DELETE' });
export const toggleArtLike = (id) =>
  apiFetch(`/api/art/submissions/${id}/like/`, { method: 'POST' });

export { BASE };
