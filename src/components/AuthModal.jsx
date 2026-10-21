// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\components\AuthModal.jsx
// Modal Đăng nhập / Đăng ký tài khoản với Tailwind CSS v4

import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import BirdEyeIcon from './BirdEyeIcon.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  if (!isOpen) return null;

  // Đóng thông báo thành công và vào game
  const handleStartGame = () => {
    setRegistered(false);
    setRegisteredName('');
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setError('');
    onClose();
  };

  // Màn hình thông báo đăng ký thành công (trước khi chuyển vào game)
  if (registered) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
        <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="mt-3 text-xl font-bold text-emerald-400">Đăng Ký Thành Công!</h2>
          <p className="mt-2 text-sm text-slate-300">
            Chào mừng <b className="text-amber-400">{registeredName}</b>!
          </p>
          <p className="mt-1 text-xs text-slate-400">Bạn được tặng 50 xu và skin mặc định.</p>
          <button
            onClick={handleStartGame}
            className="mt-5 w-full rounded-xl bg-amber-500 py-3 font-bold text-slate-950 shadow-lg transition hover:bg-amber-400 active:scale-98 cursor-pointer"
          >
            🎮 Bắt Đầu Chơi
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const u = username.trim();
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!u || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    if (u.length > 30) {
      setError('Tên đăng nhập tối đa 30 ký tự!');
      return;
    }

    if (!EMAIL_REGEX.test(u)) {
      setError('Tên đăng nhập phải là địa chỉ email hợp lệ (không chứa khoảng trắng)!');
      return;
    }

    // Chỉ kiểm tra độ phức tạp mật khẩu khi ĐĂNG KÝ (không áp dụng khi đăng nhập)
    if (!isLoginTab) {
      if (password.length > 8) {
        setError('Mật khẩu tối đa 8 ký tự!');
        return;
      }
      if (/\s/.test(password)) {
        setError('Mật khẩu không được chứa khoảng trắng!');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError('Mật khẩu phải chứa ít nhất một chữ in hoa!');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError('Mật khẩu phải chứa ít nhất một chữ thường!');
        return;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        setError('Mật khẩu phải chứa ít nhất một ký tự đặc biệt!');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLoginTab) {
        await login(username.trim(), password);
        // Đăng nhập: đóng modal và vào game ngay
        onClose();
        setUsername('');
        setPassword('');
        setShowPassword(false);
      } else {
        // Đăng ký: hiện thông báo thành công trước khi vào game
        await register(username.trim(), password);
        setRegisteredName(username.trim());
        setRegistered(true);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Nút đóng */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-bold text-amber-400">
            {isLoginTab ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div className="mt-4 flex rounded-xl bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition cursor-pointer ${
              isLoginTab
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition cursor-pointer ${
              !isLoginTab
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Email (Tên đăng nhập)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập email đăng nhập..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 pr-11 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <BirdEyeIcon covered={!showPassword} size={24} />
              </button>
            </div>
          </div>

          {!isLoginTab && (
            <p className="text-xs text-emerald-400">
              🎁 Tặng ngay 50 Xu khi đăng ký tài khoản mới!
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-3 font-bold text-slate-950 shadow-lg transition hover:bg-amber-400 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang xử lý...' : isLoginTab ? 'Đăng Nhập Ngay' : 'Đăng Ký & Nhận Quà'}
          </button>
        </form>
      </div>
    </div>
  );
}
