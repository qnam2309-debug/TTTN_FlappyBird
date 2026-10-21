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

// Ràng buộc dữ liệu cho username & password
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(username, password) {
  // Username: định dạng email, tối đa 30 ký tự, không khoảng trắng
  if (!username) return 'Vui lòng nhập tên đăng nhập!';
  if (username.length > 30) return 'Tên đăng nhập tối đa 30 ký tự!';
  if (!EMAIL_REGEX.test(username)) {
    return 'Tên đăng nhập phải là địa chỉ email hợp lệ (không chứa khoảng trắng)!';
  }

  // Password: tối đa 8 ký tự, có in hoa + thường + ký tự đặc biệt, không khoảng trắng
  if (!password) return 'Vui lòng nhập mật khẩu!';
  if (password.length > 8) return 'Mật khẩu tối đa 8 ký tự!';
  if (/\s/.test(password)) return 'Mật khẩu không được chứa khoảng trắng!';
  if (!/[A-Z]/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ in hoa!';
  if (!/[a-z]/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ thường!';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!';

  return null;
}

// 1. POST /api/auth/register - Đăng ký tài khoản mới
exports.register = async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    // Validate dữ liệu đầu vào (email + độ phức tạp mật khẩu)
    const validationError = validateCredentials(username, password);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
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
    const ownedSkins = await User.getOwnedSkins(user.UserID);
    return res.status(201).json({
      success: true,
      token,
      user: User.toPublic(user, ownedSkins),
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
    const ownedSkins = await User.getOwnedSkins(user.UserID);
    return res.json({
      success: true,
      token,
      user: User.toPublic(user, ownedSkins),
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
    const ownedSkins = await User.getOwnedSkins(user.UserID);
    return res.json({ success: true, user: User.toPublic(user, ownedSkins) });
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
