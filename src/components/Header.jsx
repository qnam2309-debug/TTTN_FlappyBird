// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\components\Header.jsx
// Thanh tiêu đề phong cách 2D Retro Arcade

import { useAuth } from '../context/AuthContext.jsx';

export default function Header({ onOpenAuth, onOpenLeaderboard, onOpenShop }) {
  const { user, logout } = useAuth();

  return (
    <header className="w-full max-w-md flex items-center justify-between px-3 py-2 bg-amber-400 pixel-box">
      {/* Logo & Tiêu đề game */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🐦</span>
        <h1 className="text-xs sm:text-sm font-black text-black tracking-tighter">
          FLAPPY BIRD
        </h1>
      </div>

      {/* Các nút chức năng */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Nút Bảng Xếp Hạng */}
        <button
          onClick={onOpenLeaderboard}
          title="Bảng Xếp Hạng"
          className="flex items-center gap-1 bg-yellow-300 hover:bg-yellow-200 pixel-btn px-2 py-1 text-[9px] font-black text-black cursor-pointer"
        >
          <span>🏆</span>
          <span className="hidden sm:inline">TOP</span>
        </button>

        {/* Nút Cửa Hàng */}
        <button
          onClick={onOpenShop}
          title="Cửa Hàng Trang Phục"
          className="flex items-center gap-1 bg-sky-300 hover:bg-sky-200 pixel-btn px-2 py-1 text-[9px] font-black text-black cursor-pointer"
        >
          <span>🛍️</span>
          <span className="hidden sm:inline">SHOP</span>
        </button>

        {/* Trạng thái Tài khoản */}
        {user ? (
          <div className="flex items-center gap-1 pl-1 border-l-2 border-black">
            {/* Hiển thị số Xu */}
            <div className="flex items-center gap-0.5 bg-yellow-200 border-2 border-black px-1.5 py-0.5 text-[9px] font-black text-black">
              <span>🪙</span>
              <span>{user.coins}</span>
            </div>

            {/* Tên người chơi */}
            <span className="text-[9px] font-black text-black max-w-[70px] truncate" title={user.username}>
              {user.username}
            </span>

            {/* Nút Đăng xuất */}
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1 bg-rose-400 hover:bg-rose-300 pixel-btn text-black cursor-pointer text-[9px]"
            >
              ✕
            </button>
          </div>
        ) : (
          /* Nút Đăng nhập / Đăng ký */
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1 bg-emerald-400 hover:bg-emerald-300 pixel-btn px-2.5 py-1 text-[9px] font-black text-black cursor-pointer"
          >
            <span>👤</span>
            <span>LOGIN</span>
          </button>
        )}
      </div>
    </header>
  );
}
