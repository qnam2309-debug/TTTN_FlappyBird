// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\middleware\auth.js
// Middleware xác thực JWT: kiểm tra token trong header Authorization.
// Dùng để bảo vệ các route cần đăng nhập (ví dụ GET /api/auth/me).

const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  // Lấy token từ header: "Authorization: Bearer <token>"
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

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
