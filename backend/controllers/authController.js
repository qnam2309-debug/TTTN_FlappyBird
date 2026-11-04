// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\controllers\authController.js
// Xử lý nghiệp vụ Authentication: đăng ký, đăng nhập, lấy thông tin, đăng xuất.
// (Cập nhật theo ERD: bảng USERS có CurrentSkinID trỏ tới SKINS)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Skin = require('../models/Skin');
const db = require('../config/db');
const { sendOtpEmail, isMailConfigured } = require('../services/mailer');

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

// OTP đăng ký
const OTP_TTL_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function otpExpiresAt() {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

function canExposeDevOtp() {
  return !isMailConfigured && process.env.NODE_ENV !== 'production';
}

function validateCredentials(username, password) {
  // Username: định dạng email, tối đa 30 ký tự, không khoảng trắng
  if (!username) return 'Vui lòng nhập tên đăng nhập!';
  if (username.length > 30) return 'Tên đăng nhập tối đa 30 ký tự!';
  if (!EMAIL_REGEX.test(username)) {
    return 'Tên đăng nhập phải là địa chỉ email hợp lệ (không chứa khoảng trắng)!';
  }

  // Password: tối thiểu 8 ký tự, có ít nhất 1 chữ cái + 1 chữ số, không khoảng trắng
  if (!password) return 'Vui lòng nhập mật khẩu!';
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự!';
  if (/\s/.test(password)) return 'Mật khẩu không được chứa khoảng trắng!';
  if (!/[A-Za-z]/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ cái!';
  if (!/\d/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ số!';

  return null;
}

// 1. POST /api/auth/register - Gửi OTP xác thực email (chưa tạo tài khoản)
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

    // Chỉ chặn nếu tài khoản đã xác thực.
    // Nếu đang chờ OTP (IsVerified = 0) thì cho phép đăng ký lại / ghi đè OTP cũ.
    const existing = await User.findByUsername(username);
    if (existing && Number(existing.IsVerified) === 1) {
      return res.status(409).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.',
      });
    }

    // Băm mật khẩu + tạo OTP (chưa xác thực tài khoản)
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = otpExpiresAt();
    const now = new Date();

    await User.upsertPending({
      username,
      passwordHash,
      otpHash,
      expiresAt,
      lastSentAt: now,
    });

    let mailResult;
    try {
      mailResult = await sendOtpEmail(username, otp, { expiresMinutes: OTP_TTL_MINUTES });
    } catch (mailErr) {
      console.error('Gửi email OTP thất bại:', mailErr);
      return res.status(502).json({
        success: false,
        message: 'Không thể gửi email OTP. Vui lòng kiểm tra cấu hình SMTP và thử lại!',
      });
    }

    const dev = canExposeDevOtp() && mailResult?.dev;
    return res.status(202).json({
      success: true,
      requiresVerification: true,
      email: username,
      message: dev
        ? 'Mã OTP đã được tạo (chế độ dev, xem mã bên dưới).'
        : 'Mã OTP đã được gửi tới email của bạn.',
      expiresIn: OTP_TTL_MINUTES * 60,
      ...(dev ? { devOtp: otp, devMode: true } : {}),
    });
  } catch (err) {
    next(err);
  }
};

// 1b. POST /api/auth/verify-otp - Xác thực OTP và tạo tài khoản
exports.verifyOtp = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim();
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mã OTP!' });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'Mã OTP phải gồm 6 chữ số!' });
    }

    const pending = await User.findByUsername(email);
    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy yêu cầu đăng ký. Vui lòng đăng ký lại!',
      });
    }
    if (Number(pending.IsVerified) === 1) {
      return res.status(409).json({
        success: false,
        message: 'Tài khoản đã được xác thực. Vui lòng đăng nhập!',
      });
    }
    if (!pending.OTPHash) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy mã OTP. Vui lòng đăng ký lại!',
      });
    }
    if (Number(pending.IsOtpExpired) === 1) {
      await User.deletePendingByUsername(email);
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng đăng ký lại!',
      });
    }
    if (Number(pending.OTPAttempts) >= OTP_MAX_ATTEMPTS) {
      await User.deletePendingByUsername(email);
      return res.status(429).json({
        success: false,
        message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng đăng ký lại!',
      });
    }

    const isMatch = await bcrypt.compare(otp, pending.OTPHash);
    if (!isMatch) {
      await User.incrementOtpAttempts(email);
      const left = Math.max(OTP_MAX_ATTEMPTS - (Number(pending.OTPAttempts) + 1), 0);
      return res.status(400).json({
        success: false,
        message: `Mã OTP không đúng. Bạn còn ${left} lần thử.`,
      });
    }

    const defaultSkin = await Skin.findByCode('default');
    const defaultSkinId = defaultSkin ? defaultSkin.SkinID : null;

    // Xác thực tài khoản + gắn skin mặc định trong 1 transaction
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.execute(
        `UPDATE USERS
         SET IsVerified = 1, OTPHash = NULL, OTPAttempts = 0,
             OTPExpiresAt = NULL, OTPLastSentAt = NULL,
             Coins = 50, CurrentSkinID = COALESCE(?, CurrentSkinID)
         WHERE UserID = ? AND IsVerified = 0`,
        [defaultSkinId, pending.UserID]
      );
      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(409).json({
          success: false,
          message: 'Tài khoản đã được xác thực. Vui lòng đăng nhập!',
        });
      }
      if (defaultSkinId) {
        await conn.execute(
          'INSERT IGNORE INTO USER_SKINS (UserID, SkinID) VALUES (?, ?)',
          [pending.UserID, defaultSkinId]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const user = await User.findById(pending.UserID);
    const ownedSkins = await User.getOwnedSkins(pending.UserID);
    const token = signToken(user);
    return res.status(201).json({
      success: true,
      token,
      user: User.toPublic(user, ownedSkins),
    });
  } catch (err) {
    next(err);
  }
};

// 1c. POST /api/auth/resend-otp - Gửi lại mã OTP
exports.resendOtp = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Thiếu email cần gửi lại mã!' });
    }

    const pending = await User.findByUsername(email);
    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy yêu cầu đăng ký. Vui lòng đăng ký lại!',
      });
    }
    if (Number(pending.IsVerified) === 1) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản đã được xác thực. Vui lòng đăng nhập!',
      });
    }

    const secondsSinceSent = Number(pending.SecondsSinceSent) || 0;
    if (secondsSinceSent < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = OTP_RESEND_COOLDOWN_SECONDS - secondsSinceSent;
      return res.status(429).json({
        success: false,
        message: `Vui lòng đợi ${wait} giây trước khi gửi lại mã!`,
        retryAfter: wait,
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = otpExpiresAt();
    await User.updateOtp(email, otpHash, expiresAt, new Date());

    let mailResult;
    try {
      mailResult = await sendOtpEmail(email, otp, { expiresMinutes: OTP_TTL_MINUTES });
    } catch (mailErr) {
      console.error('Gửi lại email OTP thất bại:', mailErr);
      return res.status(502).json({
        success: false,
        message: 'Không thể gửi lại email OTP. Vui lòng thử lại sau!',
      });
    }

    const dev = canExposeDevOtp() && mailResult?.dev;
    return res.json({
      success: true,
      message: dev
        ? 'Đã tạo lại mã OTP (chế độ dev, xem mã bên dưới).'
        : 'Đã gửi lại mã OTP tới email của bạn.',
      expiresIn: OTP_TTL_MINUTES * 60,
      ...(dev ? { devOtp: otp, devMode: true } : {}),
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
    // Tài khoản chưa xác thực OTP cũng bị coi như không hợp lệ.
    if (!user || Number(user.IsVerified) !== 1) {
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
    if (!user || Number(user.IsVerified) !== 1) {
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

// 5. POST /api/auth/google - Đăng nhập/Đăng ký bằng Google
exports.googleLogin = async (req, res, next) => {
  try {
    const credential = req.body.credential;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Thiếu Google credential!' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Server chưa cấu hình GOOGLE_CLIENT_ID!',
      });
    }

    // Xác thực ID token do Google phát hành
    let payload;
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ success: false, message: 'Google token không hợp lệ!' });
    }

    const email = (payload?.email || '').trim().toLowerCase();
    const googleId = payload?.sub;

    if (!email || !googleId || !payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email Google chưa được xác thực!',
      });
    }
    if (email.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Email Google quá dài (tối đa 30 ký tự) để dùng làm tên đăng nhập!',
      });
    }

    // Tìm theo GoogleID trước, rồi theo email
    let user = await User.findByGoogleId(googleId);
    if (!user) {
      user = await User.findByUsername(email);
      if (user) {
        // Liên kết tài khoản email đã có với Google
        await User.linkGoogleId(user.UserID, googleId);
        user = await User.findById(user.UserID);
      }
    }

    // Chưa có tài khoản -> tạo mới
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const defaultSkin = await Skin.findByCode('default');
      const defaultSkinId = defaultSkin ? defaultSkin.SkinID : null;

      user = await User.createUser({
        username: email,
        passwordHash,
        coins: 50,
        currentSkinId: defaultSkinId,
        googleId,
        isVerified: 1,
      });

      if (defaultSkinId) {
        await User.addOwnedSkin(user.UserID, defaultSkinId);
      }
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
