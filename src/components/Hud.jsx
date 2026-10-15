// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\components\Hud.jsx
// Lớp hiển thị điểm số, Get Ready và bảng Game Over đè trên Canvas

import { useAuth } from '../context/AuthContext.jsx';

export default function Hud({ phase, score, best, newBest }) {
  const { user } = useAuth();

  // 1. Khi đang chơi: Hiển thị điểm số to ở giữa phía trên
  if (phase === 'play') {
    return (
      <div className="pointer-events-none absolute inset-0 flex justify-center pt-8">
        <span
          className="text-5xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          style={{ WebkitTextStroke: '2px #0f172a' }}
        >
          {score}
        </span>
      </div>
    );
  }

  // 2. Màn hình chờ bắt đầu (Ready)
  if (phase === 'ready') {
    return (
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4">
        <h2
          className="text-3xl font-black text-amber-400 drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)]"
          style={{ WebkitTextStroke: '1.5px #0f172a' }}
        >
          SẴN SÀNG!
        </h2>
        <p className="mt-2 text-sm font-bold text-white bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 shadow animate-pulse">
          Chạm hoặc bấm Phím Cách để bay
        </p>

        <div className="mt-4 rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
          Kỷ lục: <span className="font-black text-amber-400">{user?.bestScore || best}</span> điểm
        </div>
      </div>
    );
  }

  // 3. Màn hình Kết Thúc Ván Bay (Game Over)
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[280px] rounded-2xl border-2 border-slate-800 bg-slate-900/95 p-5 shadow-2xl text-center">
        <h2
          className="text-2xl font-black text-rose-500 drop-shadow"
          style={{ WebkitTextStroke: '1px #0f172a' }}
        >
          GAME OVER
        </h2>

        {/* Khung điểm số */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-800/80 p-3 border border-slate-700/60">
          <div>
            <p className="text-[11px] font-bold text-slate-400">ĐIỂM SỐ</p>
            <p className="text-2xl font-black text-white">{score}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">
              {newBest ? 'KỶ LỤC MỚI 🎉' : 'KỶ LỤC'}
            </p>
            <p className="text-2xl font-black text-amber-400">{best}</p>
          </div>
        </div>

        {/* Phần thưởng xu hoặc nhắc đăng nhập */}
        {user ? (
          <p className="mt-2 text-xs font-semibold text-emerald-400">
            🪙 +{score} xu thưởng đã thêm vào ví!
          </p>
        ) : (
          <p className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 rounded-lg p-1.5 border border-amber-500/20">
            💡 Đăng nhập để lưu điểm vào Bảng Xếp Hạng!
          </p>
        )}

        {/* Hướng dẫn chơi lại */}
        <p className="mt-4 text-xs font-bold text-slate-400">
          Chạm hoặc bấm Phím Cách để chơi lại
        </p>
      </div>
    </div>
  );
}
