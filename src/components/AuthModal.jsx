// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\components\AuthModal.jsx
// Modal Đăng nhập / Đăng ký tài khoản với Tailwind CSS v4

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import BirdEyeIcon from './BirdEyeIcon.jsx';

// Chỉ tải Google Identity Services một lần cho toàn trang
let gsiScriptPromise = null;
let gsiInitializedClientId = null;

function loadGsiScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiScriptPromise) return gsiScriptPromise;

  gsiScriptPromise = new Promise((resolve) => {
    const existing = document.getElementById('google-gsi-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });

  return gsiScriptPromise;
}

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, loginWithGoogle } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // { mode: 'login' | 'register', name }
  const googleBtnRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Luôn giữ callback mới nhất để GIS chỉ cần initialize một lần
  const credentialHandlerRef = useRef(null);
  useEffect(() => {
    credentialHandlerRef.current = async (response) => {
      if (!response?.credential) return;
      setError('');
      setLoading(true);
      try {
        const loggedUser = await loginWithGoogle(response.credential);
        setSuccess({
          mode: 'login',
          name: (loggedUser?.username || '').split('@')[0] || 'bạn',
        });
      } catch (err) {
        setError(err.message || 'Đăng nhập Google thất bại!');
      } finally {
        setLoading(false);
      }
    };
  });

  // Khởi tạo nút "Đăng nhập bằng Google" (chỉ initialize một lần mỗi Client ID)
  useEffect(() => {
    if (!isOpen || !googleClientId) return;
    let cancelled = false;

    const renderButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleBtnRef.current) return;

      if (gsiInitializedClientId !== googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => credentialHandlerRef.current?.(response),
          locale: 'vi',
        });
        gsiInitializedClientId = googleClientId;
      }

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 300,
        text: 'continue_with',
        shape: 'rectangular',
        locale: 'vi',
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      loadGsiScript().then(renderButton);
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen, googleClientId]);

  if (!isOpen) return null;

  // Đóng thông báo thành công và vào game
  const handleStartGame = () => {
    setSuccess(null);
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setError('');
    onClose();
  };

  // Màn hình thông báo đăng nhập/đăng ký thành công (trước khi vào game)
  if (success) {
    const isRegister = success.mode === 'register';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-sm bg-amber-200 pixel-box p-5 text-center sm:p-6">
          <div className="text-4xl">🎉</div>
          <h2 className="mt-3 break-words text-sm font-black leading-tight text-black sm:text-base">
            {isRegister ? 'Đăng Ký Thành Công!' : 'Đăng Nhập Thành Công!'}
          </h2>
          <p className="mt-3 break-words text-[10px] font-black text-slate-800">
            Chào mừng <span className="text-rose-700">{success.name}</span>!
          </p>
          <p className="mt-1 text-[9px] leading-relaxed text-slate-700">
            {isRegister
              ? 'Bạn được tặng 50 xu và skin mặc định.'
              : 'Chúc bạn chơi game vui vẻ!'}
          </p>
          <button
            onClick={handleStartGame}
            className="mt-4 w-full bg-emerald-400 hover:bg-emerald-300 pixel-btn py-2.5 text-[10px] font-black text-black cursor-pointer"
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
        // Đăng nhập: hiện thông báo thành công trước khi vào game
        setSuccess({ mode: 'login', name: username.trim().split('@')[0] });
      } else {
        // Đăng ký: hiện thông báo thành công trước khi vào game
        await register(username.trim(), password);
        setSuccess({ mode: 'register', name: username.trim().split('@')[0] });
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm bg-amber-200 pixel-box p-4 sm:p-6">
        {/* Nút đóng */}
        <div className="flex items-center justify-between gap-3 border-b-4 border-black pb-3">
          <h2 className="min-w-0 flex-1 break-words text-sm font-black leading-tight text-black">
            {isLoginTab ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="shrink-0 cursor-pointer bg-rose-400 px-2 py-1 text-[10px] font-black text-black pixel-btn hover:bg-rose-300"
          >
            ✕
          </button>
        </div>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError('');
            }}
            className={`pixel-btn cursor-pointer py-1.5 text-[9px] font-black ${
              isLoginTab ? 'bg-amber-400 text-black' : 'bg-amber-100 text-slate-700 hover:bg-amber-50'
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
            className={`pixel-btn cursor-pointer py-1.5 text-[9px] font-black ${
              !isLoginTab ? 'bg-amber-400 text-black' : 'bg-amber-100 text-slate-700 hover:bg-amber-50'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="mt-3 border-2 border-black bg-rose-200 p-2 text-center text-[9px] font-black leading-relaxed text-rose-700">
            {error}
          </div>
        )}

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-[9px] font-black text-slate-700">
              Email (Tên đăng nhập)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập email đăng nhập..."
              className="w-full border-2 border-black bg-amber-100 px-2.5 py-2 text-[10px] font-black text-black placeholder:text-slate-500 focus:bg-amber-50 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-[9px] font-black text-slate-700">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full border-2 border-black bg-amber-100 px-2.5 py-2 pr-10 text-[10px] font-black text-black placeholder:text-slate-500 focus:bg-amber-50 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-2 text-slate-700 transition hover:text-rose-600"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <BirdEyeIcon covered={!showPassword} size={24} />
              </button>
            </div>
          </div>

          {!isLoginTab && (
            <p className="border-2 border-black bg-emerald-200 px-2 py-1.5 text-[9px] font-black leading-relaxed text-emerald-800">
              🎁 Tặng ngay 50 Xu khi đăng ký tài khoản mới!
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-emerald-400 py-2.5 text-[10px] font-black text-black pixel-btn hover:bg-emerald-300 disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : isLoginTab ? 'Đăng Nhập Ngay' : 'Đăng Ký & Nhận Quà'}
          </button>
        </form>

        {/* Đăng nhập bằng Google */}
        {googleClientId ? (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-[8px] font-black text-slate-600">
              <span className="h-0.5 flex-1 bg-black/40" />
              <span>hoặc</span>
              <span className="h-0.5 flex-1 bg-black/40" />
            </div>
            <div ref={googleBtnRef} className="mt-2 flex justify-center" />
          </div>
        ) : (
          <p className="mt-3 text-center text-[8px] font-black leading-relaxed text-slate-600">
            (Chưa cấu hình đăng nhập Google — thiếu VITE_GOOGLE_CLIENT_ID)
          </p>
        )}
      </div>
    </div>
  );
}
