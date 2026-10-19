// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\components\LeaderboardModal.jsx
// Modal hiển thị Bảng xếp hạng Top điểm cao với Tailwind CSS v4

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { gameApi } from '../services/api.js';

export default function LeaderboardModal({ isOpen, onClose }) {
  const { user, isGuest } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    if (isOpen) {
      gameApi.getLeaderboard()
        .then((data) => {
          if (!Array.isArray(data?.leaderboard)) {
            throw new Error('Dữ liệu bảng xếp hạng từ máy chủ không hợp lệ.');
          }
          if (active) {
            setLoadError('');
            setLeaderboard(data.leaderboard);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Lỗi lấy leaderboard:', err);
          if (active) {
            setLoadError(err.message || 'Không thể tải bảng xếp hạng.');
            setLoading(false);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Tiêu đề & Nút đóng */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold text-amber-400">Bảng Xếp Hạng</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Nội dung danh sách */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Đang tải bảng xếp hạng...
            </div>
          ) : loadError ? (
            <div className="py-12 text-center text-rose-400 text-sm">
              {loadError}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Chưa có dữ liệu bảng xếp hạng.
            </div>
          ) : (
            leaderboard.map((item) => {
              const isCurrentUser = user && user.username === item.username;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                    isCurrentUser
                      ? 'border border-amber-400/50 bg-amber-500/15'
                      : 'border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg font-black text-sm ${
                        item.rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : item.rank === 3
                          ? 'bg-amber-700 text-amber-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                    </span>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {item.username}{' '}
                        {isCurrentUser && (
                          <span className="text-xs text-amber-400 font-normal">(Bạn)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400">{item.bestScore}</span>
                    <span className="ml-1 text-xs text-slate-400">điểm</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Thông báo nếu là Guest */}
        {isGuest && (
          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-center">
            <p className="text-xs text-amber-300">
              💡 Bạn đang chơi ở chế độ <b>Khách</b>. Hãy đăng nhập để lưu điểm kỷ lục và tranh hạng cùng các cao thủ!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
