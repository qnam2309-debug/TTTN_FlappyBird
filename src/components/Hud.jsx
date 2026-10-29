// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\components\Hud.jsx
// Lớp hiển thị điểm số, Get Ready và bảng Game Over phong cách 2D Pixel

import { useAuth } from '../context/AuthContext.jsx';

export default function Hud({ phase, score, best, newBest, offline, countdown }) {
  const { user } = useAuth();

  if (offline || countdown !== null) {
    return (
      <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 p-4 text-center" role="status" aria-live="polite">
        <div className="pixel-box bg-amber-200 p-5 text-black">
          <h2 className="text-lg font-black text-rose-700">{offline ? 'MẤT KẾT NỐI MẠNG' : 'ĐÃ KẾT NỐI LẠI'}</h2>
          <p className="mt-3 text-xs font-bold">{offline ? 'Ván chơi đã tạm dừng. Đang chờ kết nối...' : 'Tiếp tục sau:'}</p>
          {!offline && <p className="mt-2 text-5xl font-black text-emerald-700">{countdown}</p>}
        </div>
      </div>
    );
  }

  // 1. Khi đang chơi: Hiển thị điểm số to ở giữa phía trên
  if (phase === 'play') {
    return (
      <div className="pointer-events-none absolute inset-0 flex justify-center pt-8">
        <span
          className="text-4xl font-black text-white"
          style={{
            textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000',
          }}
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
          className="text-2xl font-black text-amber-300"
          style={{
            textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000',
          }}
        >
          GET READY!
        </h2>
        <p className="mt-3 text-[9px] font-black text-black bg-white px-2.5 py-1.5 pixel-box animate-bounce">
          CLICK / SPACE ĐỂ BAY
        </p>

        <div className="mt-4 bg-amber-200 pixel-box px-2.5 py-1 text-[9px] text-black font-black">
          KỶ LỤC: <span className="text-rose-600">{user?.bestScore || best}</span>
        </div>
      </div>
    );
  }

  // 3. Màn hình Kết Thúc Ván Bay (Game Over)
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[280px] bg-amber-300 pixel-box p-4 text-center">
        <h2
          className="text-xl font-black text-rose-600 mb-3"
          style={{
            textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
          }}
        >
          GAME OVER
        </h2>

        {/* Khung điểm số dạng Pixel Scoreboard */}
        <div className="bg-amber-100 border-2 border-black p-3 mb-3 text-left">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-black text-slate-700">ĐIỂM:</span>
            <span className="text-base font-black text-black">{score}</span>
          </div>

          <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-slate-400">
            <span className="text-[9px] font-black text-slate-700">KỶ LỤC:</span>
            <span className="text-base font-black text-rose-600">
              {Math.max(user?.bestScore || 0, best, score)}
            </span>
          </div>

          {newBest && (
            <div className="mt-2 text-center text-[8px] font-black text-emerald-700 animate-pulse bg-emerald-200 border border-emerald-500 py-0.5">
              ★ KỶ LỤC MỚI! ★
            </div>
          )}
        </div>

        {/* Thưởng xu */}
        <p className="text-[8px] font-black text-amber-900 mb-3 bg-yellow-200 border border-yellow-400 py-1">
          🪙 +{score} XU THƯỞNG
        </p>

        <p className="text-[8px] text-black font-black animate-pulse">
          BẤM ĐỂ CHƠI LẠI
        </p>
      </div>
    </div>
  );
}
