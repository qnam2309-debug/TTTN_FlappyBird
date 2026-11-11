// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\App.jsx
// Màn hình chính liên kết Game Loop, Canvas, Header, HUD và các Modal

import { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import Hud from './components/Hud.jsx';
import AuthModal from './components/AuthModal.jsx';
import LeaderboardModal from './components/LeaderboardModal.jsx';
import ShopModal from './components/ShopModal.jsx';
import AccountModal from './components/AccountModal.jsx';
import { H, W, setGameHeight } from './game/game.js';
import { useGame } from './game/useGame.js';

function GameScreen() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  // Quản lý trạng thái mở/đóng các Modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  // Tỉ lệ scale màn hình Canvas
  const [size, setSize] = useState({ width: W, height: H });
  // Lấy dữ liệu tài khoản và trang phục đang mặc
  const { user, activeSkinColors, submitScore } = useAuth();

  // Xử lý khi chim chết (kết thúc ván)
  const handleGameOver = async (finalScore) => {
    try {
      await submitScore(finalScore);
    } catch (err) {
      console.error('Lỗi lưu điểm:', err);
    }
  };

  // Khởi tạo Game Loop Canvas
  const [hud, flap] = useGame(canvasRef, activeSkinColors, handleGameOver, user?.bestScore);

  // Mở rộng chiều cao thế giới game theo màn hình điện thoại
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateGameSize = () => {
      const availableW = Math.max(1, el.clientWidth - 8);
      const availableH = Math.max(1, el.clientHeight - 8);

      // Giữ nguyên tỷ lệ chiều ngang
      const scale = availableW / W;

      // Tính chiều cao thế giới game
      const desiredHeight = Math.max(
        540,
        Math.round(availableH / scale)
      );

      setGameHeight(desiredHeight);

      // Cập nhật kích thước canvas theo màn hình
      setSize({
        width: Math.round(W * scale),
        height: Math.round(desiredHeight * scale)
      });
    };

    const observer = new ResizeObserver(updateGameSize);
    observer.observe(el);

    updateGameSize();

    return () => observer.disconnect();
  }, []);

  const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const playfieldWidth = size.width;
  const playfieldHeight = size.height;

  return (
    <div className="mobile-game-shell flex h-dvh w-screen flex-col items-center justify-start bg-slate-950 p-0 sm:p-4 select-none touch-none overflow-hidden">
      {/* 1. Header trên cùng */}
      <Header
        width={playfieldWidth}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* 2. Khung chơi Game (Sân khấu trung tâm) */}
      <div
        ref={stageRef}
        className="mobile-game-stage flex flex-1 min-h-0 w-full items-center justify-center cursor-pointer"
        onPointerDown={(e) => {
          // Bấm chuột trái hoặc chạm màn hình để bay
          if (e.button === 0) flap();
        }}
      >
        <div
          className="relative pixel-box overflow-hidden bg-sky-200"
          style={{ width: `${playfieldWidth}px`, height: `${playfieldHeight}px` }}
        >
          {/* Canvas vẽ game */}
          <canvas
            ref={canvasRef}
            width={Math.round(playfieldWidth * pixelRatio)}
            height={Math.round(playfieldHeight * pixelRatio)}
            className="block w-full h-full"
          />

          {/* Lớp HUD hiển thị điểm & Game Over */}
          <Hud {...hud} />
        </div>
      </div>

      {/* 3. Dòng nhắc nhở bên dưới */}
      <footer className="hidden sm:block text-center pb-1">
        <p className="text-xs text-slate-500 font-medium">
          Chạm vào màn hình hoặc bấm <kbd className="rounded-sm bg-slate-800 px-1.5 py-0.5 text-slate-300 font-mono">Space</kbd> / <kbd className="rounded-sm bg-slate-800 px-1.5 py-0.5 text-slate-300 font-mono">↑</kbd> để đập cánh
        </p>
      </footer>

      {/* 4. Các Popup Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameScreen />
    </AuthProvider>
  );
}
