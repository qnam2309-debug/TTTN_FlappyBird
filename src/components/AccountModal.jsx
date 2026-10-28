// src/components/AccountModal.jsx
// Modal "Account Info": hiển thị thông tin tài khoản lấy từ backend/DB.

import { useAuth } from '../context/AuthContext.jsx';

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-slate-800/50 px-3 py-2">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="break-all text-right font-semibold text-white">{value}</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-amber-400">Thông tin tài khoản</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm">
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
