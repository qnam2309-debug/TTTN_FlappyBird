// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\services\api.js
// Tầng Service gọi API tập trung: Tự động đính kèm Token và xử lý lỗi

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Hàm gọi API tổng quát (dùng chung cho mọi API của nhóm)
 * @param {string} endpoint - Ví dụ: '/auth/login', '/scores', '/leaderboard'
 * @param {RequestInit} options - Phương thức GET, POST, body,...
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('flappy_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Lỗi máy chủ (${response.status})`);
  }

  return data;
}

// 1. Nhóm API Xác thực người dùng (Auth) - Backend của Vy
export const authApi = {
  // Đăng ký tài khoản mới (POST /api/auth/register)
  register: async (username, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Đăng nhập (POST /api/auth/login)
  login: async (username, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Lấy thông tin tài khoản hiện tại qua JWT (GET /api/auth/me)
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  // Đăng xuất (POST /api/auth/logout)
  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};

// 2. Nhóm API Gameplay (Lưu điểm, BXH, Skins) - Sẵn sàng nối khi Hưng hoàn thành
export const gameApi = {
  // Gửi điểm ván chơi (POST /api/scores)
  submitScore: async (score) => {
    return apiRequest('/scores', {
      method: 'POST',
      body: JSON.stringify({ score }),
    });
  },

  // Lấy bảng xếp hạng (GET /api/leaderboard?limit=10)
  getLeaderboard: async (limit = 10) => {
    return apiRequest(`/leaderboard?limit=${limit}`);
  },

  // Lấy danh sách skin và trạng thái sở hữu (GET /api/skins)
  getSkins: async () => {
    return apiRequest('/skins');
  },

  // Trang bị skin (POST /api/skins/equip)
  equipSkin: async (skinId) => {
    return apiRequest('/skins/equip', {
      method: 'POST',
      body: JSON.stringify({ skinId }),
    });
  },
};
