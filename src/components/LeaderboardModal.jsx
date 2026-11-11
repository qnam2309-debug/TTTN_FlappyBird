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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-amber-200 pixel-box p-4 sm:p-6 flex flex-col max-h-[85vh]">
        {/* Tiêu đề & Nút đóng */}
        <div className="flex items-center justify-between gap-3 border-b-4 border-black pb-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-2xl">🏆</span>
            <h2 className="break-words text-lg font-black leading-tight text-black sm:text-xl">
              Bảng Xếp Hạng
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

        {/* Nội dung danh sách */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-10 text-center font-bold text-slate-700 text-sm">
              Đang tải bảng xếp hạng...
            </div>
          ) : loadError ? (
            <div className="py-10 text-center font-bold text-rose-700 text-sm">
              {loadError}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-10 text-center font-bold text-slate-700 text-sm">
              Chưa có dữ liệu bảng xếp hạng.
            </div>
          ) : (
            leaderboard.map((item) => {
              const isCurrentUser = user && user.username === item.username;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 px-3 py-2 border-2 border-black ${
                    isCurrentUser
                      ? 'bg-amber-300 pixel-box shadow-none'
                      : 'bg-amber-100 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center font-black text-xs border border-black ${
                        item.rank === 1
                          ? 'bg-amber-400 text-black'
                          : item.rank === 2
                          ? 'bg-slate-300 text-black'
                          : item.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-slate-800'
                      }`}
                    >
                      {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-black sm:text-sm">
                        {item.username}{' '}
                        {isCurrentUser && (
                          <span className="text-[11px] font-black text-amber-800">(Bạn)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 whitespace-nowrap text-right">
                    <span className="text-base font-black text-black sm:text-lg">{item.bestScore}</span>
                    <span className="ml-1 text-[11px] font-bold text-slate-700">điểm</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Thông báo nếu là Guest */}
        {isGuest && (
          <div className="mt-3 border-2 border-black bg-amber-100 p-2.5 text-center">
            <p className="text-xs font-bold text-slate-800">
              💡 Bạn đang chơi ở chế độ <b>Khách</b>. Hãy đăng nhập để lưu điểm kỷ lục và tranh hạng cùng các cao thủ!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
