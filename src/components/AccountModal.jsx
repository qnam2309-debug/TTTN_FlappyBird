// src/components/AccountModal.jsx
// Modal "Account Info" phong cách 2D Pixel Retro, đồng bộ với màn hình chính.

import { useAuth } from '../context/AuthContext.jsx';

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-2 border-black bg-amber-100 px-2 py-1.5">
      <span className="shrink-0 text-[9px] font-black text-slate-700">{label}</span>
      <span className="break-all text-right text-[9px] font-black text-black">{value}</span>
    </div>
  );
}

export default function AccountModal({ isOpen, onClose }) {
  const { user } = useAuth();
  if (!isOpen || !user) return null;

  const email = user.username || '';
  const displayName = email ? email.split('@')[0] : '';
  const created = user.createdAt
    ? new Date(user.createdAt).toLocaleString('vi-VN')
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-amber-200 pixel-box p-4 sm:p-6">
        <div className="flex items-center justify-between border-b-4 border-black pb-3">
          <h2 className="text-sm font-black text-black sm:text-base">Thông tin tài khoản</h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="bg-rose-400 hover:bg-rose-300 pixel-btn px-2 py-1 text-[10px] font-black text-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <Row label="ID" value={`#${user.id}`} />
          <Row label="Email" value={email} />
          <Row label="Tên hiển thị" value={displayName} />
          <Row label="Xu" value={`🪙 ${user.coins}`} />
          <Row label="Điểm cao nhất" value={`${user.bestScore} điểm`} />
          <Row label="Trang phục đang dùng" value={user.activeSkin || 'default'} />
          <Row label="Trang phục sở hữu" value={(user.ownedSkins || ['default']).join(', ')} />
          <Row label="Ngày tạo" value={created} />
        </div>
      </div>
    </div>
  );
}
