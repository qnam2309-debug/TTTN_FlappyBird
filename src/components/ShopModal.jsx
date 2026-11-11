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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg bg-amber-200 pixel-box p-4 sm:p-6 flex flex-col max-h-[85vh]">
        {/* Tiêu đề & Nút đóng */}
        <div className="flex items-center justify-between gap-3 border-b-4 border-black pb-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-2xl">🛍️</span>
            <h2 className="break-words text-lg font-black leading-tight text-black sm:text-xl">
              Cửa Hàng Trang Phục
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="shrink-0 cursor-pointer bg-rose-400 px-2 py-1 text-sm font-black text-black pixel-btn hover:bg-rose-300"
          >
            ✕
          </button>
        </div>

        {/* Thông tin số xu của người chơi */}
        <div className="mt-3 flex items-center justify-between border-2 border-black bg-amber-100 px-3 py-2">
          <span className="text-sm font-black text-slate-700">Ví xu của bạn:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🪙</span>
            <span className="text-xl font-black text-black">{coins}</span>
            <span className="text-xs font-black text-slate-700">xu</span>
          </div>
        </div>

        {isGuest && (
          <div className="mt-2 border-2 border-black bg-amber-100 p-2 text-center text-xs font-bold text-slate-800">
            ⚠️ Bạn đang ở chế độ Khách. Đăng nhập để mua và lưu trang phục nhé!
          </div>
        )}

        {/* Thông báo thành công / lỗi */}
        {msg && (
          <div className="mt-2 border-2 border-black bg-emerald-100 p-2 text-center text-xs font-bold text-emerald-900">
            {msg}
          </div>
        )}
        {error && (
          <div className="mt-2 border-2 border-black bg-rose-100 p-2 text-center text-xs font-bold text-rose-900">
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
                className={`p-3 border-2 border-black ${
                  isActive
                    ? 'bg-amber-300 pixel-box shadow-none'
                    : 'bg-amber-100 hover:bg-amber-50'
                }`}
              >
                {/* Hàng trên: chim + tên trang phục + nút hành động */}
                <div className="flex items-center gap-3">
                  <div
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black shadow-xs"
                    style={{ backgroundColor: skin.colors.bird }}
                  >
                    {/* Cánh chim mini */}
                    <div
                      className="absolute h-3.5 w-4.5 rounded-full border border-black shadow-xs"
                      style={{
                        backgroundColor: skin.colors.wing,
                        left: '5px',
                        top: '12px',
                      }}
                    />
                    {/* Mỏ chim mini */}
                    <div
                      className="absolute h-2 w-2 rotate-45 border-r border-b border-black"
                      style={{
                        backgroundColor: skin.colors.beak,
                        right: '3px',
                        top: '14px',
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-sm font-black text-black sm:text-base">{skin.name}</h3>
                      {isActive && (
                        <span className="border border-black bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-black">
                          ĐANG DÙNG
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="shrink-0">
                    {isActive ? (
                      <button
                        disabled
                        className="pixel-btn bg-amber-400 px-3 py-1 text-xs font-black text-black cursor-default"
                      >
                        ✓ Đang Mặc
                      </button>
                    ) : isOwned ? (
                      <button
                        onClick={() => handleAction(skin)}
                        disabled={isProcessing}
                        className="pixel-btn bg-sky-400 hover:bg-sky-300 px-3 py-1 text-xs font-black text-black cursor-pointer"
                      >
                        {isProcessing ? '...' : 'Trang Bị'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(skin)}
                        disabled={isProcessing || (!isGuest && !canAfford)}
                        className={`pixel-btn px-3 py-1 text-xs font-black cursor-pointer ${
                          canAfford
                            ? 'bg-emerald-400 hover:bg-emerald-300 text-black'
                            : 'bg-stone-300 text-stone-500 border-2 border-stone-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {isProcessing ? '...' : `Mua ${skin.price} Xu`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Ghi chú về chú chim */}
                <p
                  className="mt-1.5 truncate text-xs font-bold text-slate-700"
                  title={skin.description}
                >
                  {skin.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
