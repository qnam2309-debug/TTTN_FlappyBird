// backend/middleware/rateLimiter.js
// Bộ kiểm soát tần suất truy cập (In-memory Rate Limiter) thuần Node.js
// Giúp phòng chống tấn công brute-force, spam OTP và DoS mà không cần cài thêm thư viện ngoài.

function createRateLimiter({ windowMs, max, message }) {
  const requests = new Map();

  // Dọn dẹp định kỳ các bản ghi IP đã hết hạn để giải phóng bộ nhớ RAM
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requests.entries()) {
      if (now - entry.startTime > windowMs) {
        requests.delete(ip);
      }
    }
  }, Math.max(60000, windowMs));

  // Không giữ tiến trình Node.js khi ứng dụng tắt
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // Nhận diện địa chỉ IP (hỗ trợ cả trường hợp chạy sau reverse proxy)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null)
      || req.ip
      || req.socket.remoteAddress
      || 'unknown-ip';

    const now = Date.now();
    let entry = requests.get(ip);

    if (!entry || now - entry.startTime > windowMs) {
      entry = { startTime: now, count: 1 };
      requests.set(ip, entry);
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfterSeconds = Math.ceil((entry.startTime + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message: message || `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfterSeconds} giây.`,
      });
    }

    return next();
  };
}

// Giới hạn cho các tác vụ nhạy cảm: Đăng ký, Đăng nhập, Google Auth (tối đa 25 lần / 15 phút)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'Bạn đã thực hiện quá nhiều thao tác đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút.',
});

// Giới hạn cho các tác vụ OTP: Gửi lại mã, Xác thực mã OTP (tối đa 6 lần / 3 phút)
const otpLimiter = createRateLimiter({
  windowMs: 3 * 60 * 1000,
  max: 6,
  message: 'Quá nhiều yêu cầu gửi/xác thực mã OTP. Vui lòng thử lại sau 3 phút.',
});

module.exports = {
  createRateLimiter,
  authLimiter,
  otpLimiter,
};
