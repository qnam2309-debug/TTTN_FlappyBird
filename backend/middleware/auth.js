// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\middleware\auth.js
// Middleware xác thực JWT: CHỈ lấy token từ header Authorization.
// Bảo mật: KHÔNG chấp nhận token qua URL query string (tránh lộ token
// trong log, lịch sử trình duyệt, referrer...).

const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  // Chỉ đọc từ header: "Authorization: Bearer <token>"
  const header = req.headers.authorization || '';
  // Chấp nhận "Bearer" không phân biệt hoa/thường và khoảng trắng thừa
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  const token = match ? match[1].trim() : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập!',
    });
  }

  try {
    // Giải mã và xác thực token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn!',
    });
  }
};
