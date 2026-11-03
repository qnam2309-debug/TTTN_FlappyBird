// backend/models/User.js
// Model User: truy vấn bảng USERS (đã gộp PENDING_REGISTRATIONS).
// Một dòng USERS có thể là:
//   - tài khoản đã xác thực: IsVerified = 1, các cột OTP = NULL
//   - đăng ký đang chờ OTP:  IsVerified = 0, có OTPHash/OTPExpiresAt/...

const db = require('../config/db');

// Chuyển dòng dữ liệu DB thành object "sạch" trả về cho client (bỏ mật khẩu)
function toPublic(row, ownedSkins = ['default']) {
  if (!row) return null;
  const activeSkin = row.CurrentSkinCode || (row.CurrentSkinID === 1 ? 'default' : 'default');
  return {
    id: row.UserID,
    username: row.Username,
    coins: row.Coins,
    currentSkinId: row.CurrentSkinID,
    activeSkin: activeSkin,
    ownedSkins: ownedSkins.length ? ownedSkins : ['default'],
    bestScore: Number(row.BestScore) || 0,
    createdAt: row.CreatedAt,
  };
}

const USER_SELECT = `SELECT USERS.*, SKINS.SkinCode AS CurrentSkinCode,
  (SELECT COALESCE(MAX(GAME_RESULTS.Score), 0)
   FROM GAME_RESULTS
   WHERE GAME_RESULTS.UserID = USERS.UserID) AS BestScore,
  (USERS.OTPExpiresAt IS NOT NULL AND USERS.OTPExpiresAt <= NOW()) AS IsOtpExpired,
  TIMESTAMPDIFF(SECOND, USERS.OTPLastSentAt, NOW()) AS SecondsSinceSent
  FROM USERS
  LEFT JOIN SKINS ON USERS.CurrentSkinID = SKINS.SkinID`;

// Tạo tài khoản mới và trả về user vừa tạo
async function createUser({
  username,
  passwordHash,
  coins = 0,
  currentSkinId = null,
  googleId = null,
  isVerified = 1,
}) {
  const [result] = await db.execute(
    `INSERT INTO USERS (Username, PasswordHash, GoogleID, CurrentSkinID, Coins, IsVerified)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, passwordHash, googleId, currentSkinId, coins, isVerified ? 1 : 0]
  );
  return findById(result.insertId);
}

// Tìm user theo username (dùng cho đăng nhập + kiểm tra trùng khi đăng ký)
async function findByUsername(username) {
  const [rows] = await db.execute(
    `${USER_SELECT} WHERE USERS.Username = ? LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

// Tìm user theo id (dùng cho GET /me)
async function findById(id) {
  const [rows] = await db.execute(
    `${USER_SELECT} WHERE USERS.UserID = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

// Tìm user theo GoogleID
async function findByGoogleId(googleId) {
  const [rows] = await db.execute(
    `${USER_SELECT} WHERE USERS.GoogleID = ? LIMIT 1`,
    [googleId]
  );
  return rows[0] || null;
}

// Tạo mới hoặc cập nhật đăng ký đang chờ OTP.
// Không ghi đè tài khoản đã xác thực (IsVerified = 1).
async function upsertPending({ username, passwordHash, otpHash, expiresAt, lastSentAt }) {
  await db.execute(
    `INSERT INTO USERS
       (Username, PasswordHash, Coins, IsVerified, OTPHash, OTPAttempts, OTPExpiresAt, OTPLastSentAt)
     VALUES (?, ?, 0, 0, ?, 0, ?, ?)
     ON DUPLICATE KEY UPDATE
       PasswordHash = IF(IsVerified = 0, VALUES(PasswordHash), PasswordHash),
       OTPHash = IF(IsVerified = 0, VALUES(OTPHash), OTPHash),
       OTPAttempts = IF(IsVerified = 0, 0, OTPAttempts),
       OTPExpiresAt = IF(IsVerified = 0, VALUES(OTPExpiresAt), OTPExpiresAt),
       OTPLastSentAt = IF(IsVerified = 0, VALUES(OTPLastSentAt), OTPLastSentAt)`,
    [username, passwordHash, otpHash, expiresAt, lastSentAt]
  );
}

// Cập nhật OTP mới khi người dùng bấm "Gửi lại mã"
async function updateOtp(username, otpHash, expiresAt, lastSentAt) {
  await db.execute(
    `UPDATE USERS
     SET OTPHash = ?, OTPExpiresAt = ?, OTPLastSentAt = ?, OTPAttempts = 0
     WHERE Username = ? AND IsVerified = 0`,
    [otpHash, expiresAt, lastSentAt, username]
  );
}

// Tăng số lần nhập sai OTP
async function incrementOtpAttempts(username) {
  await db.execute(
    'UPDATE USERS SET OTPAttempts = OTPAttempts + 1 WHERE Username = ? AND IsVerified = 0',
    [username]
  );
}

// Xóa đăng ký chờ (hết hạn / nhập sai quá nhiều lần)
async function deletePendingByUsername(username) {
  await db.execute('DELETE FROM USERS WHERE Username = ? AND IsVerified = 0', [username]);
}

// Đánh dấu tài khoản đã xác thực và xóa dữ liệu OTP
async function markVerified(userId) {
  const [result] = await db.execute(
    `UPDATE USERS
     SET IsVerified = 1, OTPHash = NULL, OTPAttempts = 0,
         OTPExpiresAt = NULL, OTPLastSentAt = NULL
     WHERE UserID = ? AND IsVerified = 0`,
    [userId]
  );
  return result.affectedRows > 0;
}

// Thêm skin vào danh sách sở hữu (bảng USER_SKINS)
async function addOwnedSkin(userId, skinId) {
  await db.execute(
    'INSERT IGNORE INTO USER_SKINS (UserID, SkinID) VALUES (?, ?)',
    [userId, skinId]
  );
}

// Cập nhật số xu (thưởng hoặc trừ xu)
async function updateCoins(userId, coinDelta) {
  await db.execute(
    'UPDATE USERS SET Coins = GREATEST(0, Coins + ?) WHERE UserID = ?',
    [coinDelta, userId]
  );
}

// Cập nhật skin đang trang bị
async function updateCurrentSkin(userId, skinId) {
  await db.execute(
    'UPDATE USERS SET CurrentSkinID = ? WHERE UserID = ?',
    [skinId, userId]
  );
}

// Lấy danh sách skinCode mà user đã sở hữu
async function getOwnedSkins(userId) {
  const [rows] = await db.execute(
    `SELECT SKINS.SkinCode
     FROM USER_SKINS
     JOIN SKINS ON USER_SKINS.SkinID = SKINS.SkinID
     WHERE USER_SKINS.UserID = ?`,
    [userId]
  );
  return rows.map((r) => r.SkinCode);
}

// Gắn GoogleID cho tài khoản đã tồn tại (liên kết theo email).
// Google đã xác thực email nên đánh dấu tài khoản là đã xác thực luôn.
async function linkGoogleId(userId, googleId) {
  await db.execute(
    `UPDATE USERS
     SET GoogleID = ?, IsVerified = 1, OTPHash = NULL, OTPAttempts = 0,
         OTPExpiresAt = NULL, OTPLastSentAt = NULL
     WHERE UserID = ?`,
    [googleId, userId]
  );
}

module.exports = {
  createUser,
  findByUsername,
  findById,
  findByGoogleId,
  linkGoogleId,
  upsertPending,
  updateOtp,
  incrementOtpAttempts,
  deletePendingByUsername,
  markVerified,
  addOwnedSkin,
  updateCoins,
  updateCurrentSkin,
  getOwnedSkins,
  toPublic,
};
