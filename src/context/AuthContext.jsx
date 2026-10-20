/* eslint-disable react-refresh/only-export-components */
// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\context\AuthContext.jsx
// Quản lý trạng thái xác thực: Người dùng đăng nhập vs Khách (Guest) và Skin chim

import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, gameApi } from '../services/api.js';
import {
  AVAILABLE_SKINS,
  mockBuySkin,
  mockClearActiveUser,
  mockEquipSkin,
  mockSaveScore,
  mockSyncAuthenticatedUser,
} from '../services/mockApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục phiên đăng nhập khi mở lại web từ Backend thật qua JWT
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('flappy_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.getCurrentUser();
        if (res?.user) {
          const shopUser = mockSyncAuthenticatedUser(res.user);
          setUser({ ...res.user, ...shopUser });
        }
      } catch (err) {
        if (err.status === 401) {
          await authApi.logout();
          setUser(null);
        } else {
          console.error('Lỗi tải phiên đăng nhập:', err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Đăng nhập qua Backend thật
  const login = async (username, password) => {
    const res = await authApi.login(username, password);
    const loggedInUser = { ...res.user, ...mockSyncAuthenticatedUser(res.user) };
    setUser(loggedInUser);
    return loggedInUser;
  };

  // Đăng ký qua Backend thật
  const register = async (username, password) => {
    const res = await authApi.register(username, password);
    const newUser = { ...res.user, ...mockSyncAuthenticatedUser(res.user) };
    setUser(newUser);
    return newUser;
  };

  // Đăng xuất
  const logout = async () => {
    await authApi.logout();
    mockClearActiveUser();
    setUser(null);
  };

  // Gửi điểm sau ván chơi
  const submitScore = async (score) => {
    if (!user) {
      // Chế độ Guest: chỉ trả về kết quả local
      return { isGuest: true, score };
    }
    try {
      const res = await gameApi.submitScore(score);
      const shopResult = await mockSaveScore(score);
      setUser((prev) => ({
        ...prev,
        bestScore: res.bestScore,
        coins: shopResult.totalCoins ?? prev.coins,
      }));
      return res;
    } catch (err) {
      if (err.status === 401) {
        await authApi.logout();
        mockClearActiveUser();
        setUser(null);
      }
      throw err;
    }
  };

  // Mua skin mới
  const buySkin = async (skinId) => {
    const res = await mockBuySkin(skinId);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  // Trang bị skin đã sở hữu
  const equipSkin = async (skinId) => {
    const res = await mockEquipSkin(skinId);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  // Lấy dữ liệu màu vẽ Canvas của Skin đang mặc
  const currentSkinId = user?.activeSkin || 'default';
  const activeSkinObj =
    AVAILABLE_SKINS.find((s) => s.id === currentSkinId) || AVAILABLE_SKINS[0];

  const value = {
    user,
    isGuest: !user,
    loading,
    login,
    register,
    logout,
    submitScore,
    buySkin,
    equipSkin,
    activeSkin: activeSkinObj,
    activeSkinColors: activeSkinObj.colors,
    availableSkins: AVAILABLE_SKINS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook để các component con dễ dàng sử dụng
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
