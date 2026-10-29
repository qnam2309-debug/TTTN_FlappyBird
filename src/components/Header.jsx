// src/components/Header.jsx
// Thanh tiêu đề phong cách 2D Pixel Retro, đồng bộ với màn hình chính.
// Giữ nguyên chức năng: âm lượng, avatar tròn + dropdown tài khoản.

import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { setVolume as setGameVolume } from '../game/sound.js';

// ---- Avatar tròn tạo từ tên (không cần cột DB) ----
function Avatar({ name, size = 32 }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  const palette = ['#f97316', '#ef4444', '#a855f7', '#3b82f6', '#10b981', '#eab308'];
  const idx = [...(name || '?')].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border-2 border-black font-black text-white"
      style={{ width: size, height: size, backgroundColor: palette[idx], fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

// ---- Một dòng trong dropdown ----
function MenuItem({ icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[9px] font-black transition ${
        danger ? 'text-rose-700 hover:bg-rose-300' : 'text-black hover:bg-amber-300'
      }`}
    >
      <span className="text-sm leading-none">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function Header({ width, onOpenAuth, onOpenLeaderboard, onOpenShop, onOpenAccount }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [volume, setVolume] = useState(0.6);

  const handleVolume = (v) => {
    setVolume(v);
    setGameVolume(v);
  };

  const email = user?.username || '';
  const displayName = email ? email.split('@')[0] : '';

  const pick = (cb) => {
    setMenuOpen(false);
    cb?.();
  };

  return (
    <header
      className={`relative z-50 flex w-full items-center justify-between gap-2 bg-amber-400 pixel-box px-2.5 py-2 sm:px-3 ${
        width ? '' : 'max-w-md'
      }`}
      style={width ? { width: `${width}px`, maxWidth: '100vw' } : undefined}
    >
      {/* Trái: logo + tiêu đề */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-lg leading-none">🐦</span>
        <h1 className="text-[10px] font-black leading-none tracking-tighter text-black sm:text-xs">
          FLAPPY BIRD
        </h1>
      </div>

      {/* Giữa: thanh chỉnh âm lượng kiểu pixel */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
        <span className="text-sm leading-none" aria-hidden="true">
          {volume === 0 ? '🔇' : '🔊'}
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolume(Number(e.target.value))}
          className="pixel-range w-14 shrink-0 sm:w-28"
          aria-label="Âm lượng"
          title={`Âm lượng: ${Math.round(volume * 100)}%`}
        />
      </div>

      {/* Phải: avatar tròn — hover để mở menu, hoặc nút đăng nhập */}
      <div className="flex shrink-0 items-center">
        {user ? (
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title={displayName}
              className="flex cursor-pointer items-center justify-center rounded-full shadow-[2px_2px_0_#000] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Avatar name={displayName} size={32} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 sm:left-full sm:right-auto sm:top-0 sm:mt-0 sm:pl-3">
                <div className="w-64 overflow-hidden bg-amber-200 pixel-box">
                  {/* Thông tin người dùng */}
                  <div className="flex items-center gap-2.5 border-b-4 border-black p-3">
                    <Avatar name={displayName} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-black text-black">{displayName}</p>
                      <p className="truncate text-[8px] text-slate-700" title={email}>
                        {email}
                      </p>
                    </div>
                  </div>

                  {/* Các mục menu */}
                  <div className="p-1.5">
                    {typeof onOpenAccount === 'function' && (
                      <MenuItem
                        icon="🪪"
                        label="Thông tin tài khoản"
                        onClick={() => pick(onOpenAccount)}
                      />
                    )}
                    <MenuItem
                      icon="🏆"
                      label="Bảng xếp hạng"
                      onClick={() => pick(onOpenLeaderboard)}
                    />
                    <MenuItem icon="🪙" label="Xu & Trang phục" onClick={() => pick(onOpenShop)} />
                    <div className="my-1 h-1 bg-black/20" />
                    <MenuItem icon="🚪" label="Đăng xuất" onClick={() => pick(logout)} danger />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="bg-emerald-400 hover:bg-emerald-300 pixel-btn px-2.5 py-1 text-[9px] font-black text-black cursor-pointer"
          >
            👤 LOGIN
          </button>
        )}
      </div>
    </header>
  );
}
