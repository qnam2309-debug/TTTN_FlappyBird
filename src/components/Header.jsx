// src/components/Header.jsx
// Thanh điều hướng: giữ phong cách cũ (dark, chữ/icon thường),
// avatar tròn — rê chuột vào để mở dropdown.

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
      className="flex shrink-0 items-center justify-center rounded-full font-black text-white"
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
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
        danger ? 'text-rose-400 hover:bg-rose-500/15' : 'text-slate-200 hover:bg-slate-800'
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
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
      className="relative z-50 flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2 shadow-lg backdrop-blur-xs"
      style={width ? { width: `${width}px`, maxWidth: '100vw' } : undefined}
    >
      {/* Trái: logo + tiêu đề (kiểu cũ) */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xl leading-none">🐦</span>
        <h1 className="text-base font-black tracking-wide text-amber-400 drop-shadow">
          Flappy Bird
        </h1>
      </div>

      {/* Giữa: thanh chỉnh âm lượng */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
        <span className="text-base leading-none" aria-hidden="true">
          {volume === 0 ? '🔇' : '🔊'}
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolume(Number(e.target.value))}
          className="h-1.5 w-28 cursor-pointer accent-amber-400"
          aria-label="Âm lượng"
          title={`Âm lượng: ${Math.round(volume * 100)}%`}
        />
      </div>

      {/* Phải: chỉ avatar tròn — hover để mở menu */}
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
              className="flex items-center justify-center rounded-full border-2 border-slate-700 transition hover:border-amber-400 cursor-pointer"
            >
              <Avatar name={displayName} size={32} />
            </button>

            {menuOpen && (
              <div className="absolute left-full top-0 z-50 pl-2">
                <div className="w-56 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
                  {/* Thông tin người dùng */}
                  <div className="flex items-center gap-3 border-b border-slate-800 p-4">
                    <Avatar name={displayName} size={44} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{displayName}</p>
                      <p className="truncate text-xs text-slate-400" title={email}>
                        {email}
                      </p>
                    </div>
                  </div>

                  {/* Các mục menu */}
                  <div className="p-2">
                    <MenuItem icon="🪪" label="Thông tin tài khoản" onClick={() => pick(onOpenAccount)} />
                    <MenuItem
                      icon="🏆"
                      label="Bảng xếp hạng"
                      onClick={() => pick(onOpenLeaderboard)}
                    />
                    <MenuItem icon="🪙" label="Xu & Trang phục" onClick={() => pick(onOpenShop)} />
                    <div className="my-1 h-px bg-slate-800" />
                    <MenuItem icon="🚪" label="Đăng xuất" onClick={() => pick(logout)} danger />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow transition hover:bg-amber-400 active:scale-95 cursor-pointer"
          >
            Đăng Nhập
          </button>
        )}
      </div>
    </header>
  );
}
