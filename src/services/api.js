const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const TOKEN_KEY = 'flappy_token';
const USER_KEY = 'flappy_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveSession(token, user) {
  if (typeof token !== 'string' || !token || !user?.id || !user?.username) {
    throw new Error('Phản hồi đăng nhập từ máy chủ không hợp lệ.');
  }
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function normalizeUser(user) {
  if (!user || user.id === undefined || typeof user.username !== 'string') {
    throw new Error('Máy chủ trả về thông tin người dùng không hợp lệ.');
  }

  const activeSkin = user.currentSkinId || user.activeSkin || 'default';
  return {
    ...user,
    id: String(user.id),
    currentSkinId: activeSkin,
    activeSkin,
    bestScore: Number(user.bestScore) || 0,
  };
}

export async function apiRequest(endpoint, options = {}) {
  const { authenticated = true, ...requestOptions } = options;
  const token = authenticated ? getToken() : null;
  const headers = {
    ...(requestOptions.body !== undefined && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...requestOptions.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers,
    });
  } catch (cause) {
    const error = new Error('Không thể kết nối tới máy chủ.');
    error.cause = cause;
    throw error;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || `Yêu cầu API thất bại (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function authenticate(endpoint, username, password) {
  const data = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    authenticated: false,
  });
  const user = normalizeUser(data?.user);
  saveSession(data?.token, user);
  return { ...data, token: data.token, user };
}

export const authApi = {
  register: (username, password) => authenticate('/auth/register', username, password),
  login: (username, password) => authenticate('/auth/login', username, password),
  getCurrentUser: async () => {
    if (!getToken()) return null;
    const data = await apiRequest('/auth/me');
    const user = normalizeUser(data?.user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ...data, user };
  },
  logout: async () => {
    clearSession();
  },
};

export const gameApi = {
  submitScore: (score) => apiRequest('/scores', {
    method: 'POST',
    body: JSON.stringify({ score }),
  }),
  getLeaderboard: (limit = 10) => apiRequest(`/leaderboard?limit=${limit}`, {
    authenticated: false,
  }),
  getSkins: () => apiRequest('/skins'),
  equipSkin: (skinId) => apiRequest('/skins/equip', {
    method: 'POST',
    body: JSON.stringify({ skinId }),
  }),
};
