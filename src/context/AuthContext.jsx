/* eslint-disable react-refresh/only-export-components */
// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\context\AuthContext.jsx
// Quản lý trạng thái xác thực: Người dùng đăng nhập vs Khách (Guest) và Skin chim

import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, gameApi } from '../services/api.js';
import {
  AVAILABLE_SKINS,
  mockClearActiveUser,
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
          setUser(res.user);
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
    setUser(res.user);
    return res.user;
  };

  // Đăng ký qua Backend thật
  const register = async (username, password) => {
    const res = await authApi.register(username, password);
    setUser(res.user);
    return res.user;
  };

  // Đăng xuất
  const logout = async () => {
    await authApi.logout();
    mockClearActiveUser();
    setUser(null);
  };

  // Gửi điểm sau ván chơi (thưởng coin tự động lưu vào MySQL)
  const submitScore = async (score) => {
    if (!user) {
      // Chế độ Guest: chỉ trả về kết quả local
      return { isGuest: true, score };
    }
    try {
      const res = await gameApi.submitScore(score);
      setUser((prev) => ({
        ...prev,
        bestScore: res.bestScore,
        coins: res.totalCoins ?? (prev.coins + score),
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

  // Mua skin mới (lưu vào MySQL)
  const buySkin = async (skinId) => {
    if (!user) throw new Error('Vui lòng đăng nhập!');
    const res = await gameApi.buySkin(skinId);
    if (res.success) {
      setUser((prev) => ({
        ...prev,
        coins: res.coins,
        activeSkin: res.activeSkin,
        ownedSkins: res.ownedSkins,
      }));
    }
    return res;
  };

  // Trang bị skin đã sở hữu (lưu vào MySQL)
  const equipSkin = async (skinId) => {
    if (!user) throw new Error('Vui lòng đăng nhập!');
    const res = await gameApi.equipSkin(skinId);
    if (res.success) {
      setUser((prev) => ({
        ...prev,
        activeSkin: res.activeSkin,
      }));
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
