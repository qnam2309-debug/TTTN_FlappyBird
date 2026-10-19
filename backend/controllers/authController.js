// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\controllers\authController.js
// Xử lý nghiệp vụ Authentication: đăng ký, đăng nhập, lấy thông tin, đăng xuất.
// (Cập nhật theo ERD: bảng USERS có CurrentSkinID trỏ tới SKINS)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Skin = require('../models/Skin');

// Tạo JWT cho user (payload chứa id + username)
function signToken(user) {
  return jwt.sign(
    { id: user.UserID, username: user.Username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// 1. POST /api/auth/register - Đăng ký tài khoản mới
exports.register = async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    // Validate dữ liệu đầu vào
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!',
      });
    }
    if (password.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải từ 3 ký tự trở lên!',
      });
    }

    // Kiểm tra username đã tồn tại chưa
    const existing = await User.findByUsername(username);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.',
      });
    }

    // Băm mật khẩu trước khi lưu (không lưu mật khẩu thô)
    const passwordHash = await bcrypt.hash(password, 10);

    // Lấy skin mặc định để trang bị cho tài khoản mới
    const defaultSkin = await Skin.findByCode('default');
    const defaultSkinId = defaultSkin ? defaultSkin.SkinID : null;

    // Tạo user (tặng 50 xu khi đăng ký, trang bị skin mặc định)
    const user = await User.createUser({
      username,
      passwordHash,
      coins: 50,
      currentSkinId: defaultSkinId,
    });

    // Thêm skin mặc định vào danh sách sở hữu (USER_SKINS)
    if (defaultSkinId) {
      await User.addOwnedSkin(user.UserID, defaultSkinId);
    }

    const token = signToken(user);
    return res.status(201).json({
      success: true,
      token,
      user: User.toPublic(user),
    });
  } catch (err) {
    next(err);
  }
};

// 2. POST /api/auth/login - Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!',
      });
    }

    const user = await User.findByUsername(username);
    // Không tiết lộ chính xác "sai username" hay "sai mật khẩu" (bảo mật)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Sai tên đăng nhập hoặc mật khẩu!',
      });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Sai tên đăng nhập hoặc mật khẩu!',
      });
    }

    const token = signToken(user);
    return res.json({
      success: true,
      token,
      user: User.toPublic(user),
    });
  } catch (err) {
    next(err);
  }
};

// 3. GET /api/auth/me - Lấy thông tin user hiện tại (cần token)
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!',
      });
    }
    return res.json({ success: true, user: User.toPublic(user) });
  } catch (err) {
    next(err);
  }
};

// 4. POST /api/auth/logout - Đăng xuất
// JWT là "stateless": server không lưu phiên, client chỉ cần xóa token.
exports.logout = (req, res) => {
  return res.json({
    success: true,
    message: 'Đăng xuất thành công!',
  });
};
