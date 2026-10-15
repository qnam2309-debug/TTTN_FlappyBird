// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\components\Header.jsx
// Thanh tiêu đề điều hướng, số xu, tài khoản và nút mở modal

import { useAuth } from '../context/AuthContext.jsx';

export default function Header({ onOpenAuth, onOpenLeaderboard, onOpenShop }) {
  const { user, logout } = useAuth();

  return (
    <header className="w-full max-w-md flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg backdrop-blur-xs">
      {/* Logo & Tiêu đề game */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🐦</span>
        <h1 className="text-base sm:text-lg font-black tracking-wide text-amber-400 drop-shadow">
          Flappy Bird
        </h1>
      </div>

      {/* Các nút chức năng */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Nút Bảng Xếp Hạng */}
        <button
          onClick={onOpenLeaderboard}
          title="Bảng Xếp Hạng"
          className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-amber-300 border border-slate-700 shadow transition cursor-pointer"
        >
          <span>🏆</span>
          <span className="hidden sm:inline">Hạng</span>
        </button>

        {/* Nút Cửa Hàng */}
        <button
          onClick={onOpenShop}
          title="Cửa Hàng Trang Phục"
          className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-sky-300 border border-slate-700 shadow transition cursor-pointer"
        >
          <span>🛍️</span>
          <span className="hidden sm:inline">Shop</span>
        </button>

        {/* Trạng thái Tài khoản */}
        {user ? (
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
            {/* Hiển thị số Xu */}
            <div className="flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-1 text-xs font-black text-amber-300">
              <span>🪙</span>
              <span>{user.coins}</span>
            </div>

            {/* Tên người chơi */}
            <span className="text-xs font-bold text-slate-300 max-w-[80px] truncate" title={user.username}>
              {user.username}
            </span>

            {/* Nút đăng xuất */}
            <button
              onClick={logout}
              title="Đăng xuất"
              className="rounded-lg bg-rose-500/10 hover:bg-rose-500/25 p-1.5 text-xs font-bold text-rose-400 border border-rose-500/20 transition cursor-pointer"
            >
              🚪
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 hidden xs:inline">
              Khách
            </span>
            <button
              onClick={onOpenAuth}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-950 shadow transition cursor-pointer"
            >
              Đăng Nhập
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
