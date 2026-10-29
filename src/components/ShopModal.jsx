// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\components\ShopModal.jsx
// Modal Cửa Hàng Trang Phục chim với Tailwind CSS v4

import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ShopModal({ isOpen, onClose }) {
  const { user, isGuest, availableSkins, buySkin, equipSkin } = useAuth();
  const [loadingId, setLoadingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const ownedSkins = user?.ownedSkins || ['default'];
  const activeSkinId = user?.activeSkin || 'default';
  const coins = user?.coins || 0;

  const handleAction = async (skin) => {
    setError('');
    setMsg('');

    if (isGuest) {
      setError('Vui lòng đăng nhập để mua và trang bị trang phục!');
      return;
    }

    const isOwned = ownedSkins.includes(skin.id);
    setLoadingId(skin.id);

    try {
      if (isOwned) {
        await equipSkin(skin.id);
        setMsg(`Đã trang bị "${skin.name}" thành công!`);
      } else {
        await buySkin(skin.id);
        setMsg(`Đã mở khóa và trang bị "${skin.name}" thành công!`);
      }
    } catch (err) {
      setError(err.message || 'Thao tác thất bại!');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Tiêu đề & Nút đóng */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-2xl">🛍️</span>
            <h2 className="break-words text-sm font-bold leading-tight text-amber-400 sm:text-base">
              Cửa Hàng Trang Phục
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Thông tin số xu của người chơi */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-2.5">
          <span className="text-xs text-slate-400">Ví xu của bạn:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🪙</span>
            <span className="text-base font-black text-amber-400">{coins}</span>
            <span className="text-xs text-amber-400/80">xu</span>
          </div>
        </div>

        {isGuest && (
          <div className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 text-center text-xs text-amber-300">
            ⚠️ Bạn đang ở chế độ Khách. Đăng nhập để mua và lưu trang phục nhé!
          </div>
        )}

        {/* Thông báo thành công / lỗi */}
        {msg && (
          <div className="mt-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-center text-xs text-emerald-400">
            {msg}
          </div>
        )}
        {error && (
          <div className="mt-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2 text-center text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Danh sách trang phục */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1">
          {availableSkins.map((skin) => {
            const isOwned = ownedSkins.includes(skin.id);
            const isActive = activeSkinId === skin.id;
            const canAfford = coins >= skin.price;
            const isProcessing = loadingId === skin.id;

            return (
              <div
                key={skin.id}
                className={`flex flex-col gap-3 rounded-xl p-3.5 border transition sm:flex-row sm:items-center sm:justify-between ${
                  isActive
                    ? 'border-amber-400 bg-amber-500/10 shadow-md'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                }`}
              >
                {/* Xem trước hình dạng và màu sắc của chim */}
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 shadow"
                    style={{ backgroundColor: skin.colors.bird }}
                  >
                    {/* Cánh chim mini */}
                    <div
                      className="absolute h-4 w-5 rounded-full border border-slate-900 shadow-xs"
                      style={{
                        backgroundColor: skin.colors.wing,
                        left: '6px',
                        top: '14px',
                      }}
                    />
                    {/* Mỏ chim mini */}
                    <div
                      className="absolute h-2.5 w-2.5 rotate-45 border-r border-b border-slate-900"
                      style={{
                        backgroundColor: skin.colors.beak,
                        right: '4px',
                        top: '16px',
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-sm font-bold text-white">{skin.name}</h3>
                      {isActive && (
                        <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-slate-950">
                          ĐANG DÙNG
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 break-words text-xs leading-relaxed text-slate-400">
                      {skin.description}
                    </p>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="shrink-0 self-end sm:self-auto sm:pl-2">
                  {isActive ? (
                    <button
                      disabled
                      className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/40 cursor-default"
                    >
                      ✓ Đang Mặc
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleAction(skin)}
                      disabled={isProcessing}
                      className="rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-95 px-3 py-1.5 text-xs font-bold text-white shadow transition cursor-pointer"
                    >
                      {isProcessing ? '...' : 'Trang Bị'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(skin)}
                      disabled={isProcessing || (!isGuest && !canAfford)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold shadow transition cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      {isProcessing ? '...' : `Mua ${skin.price} Xu`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
