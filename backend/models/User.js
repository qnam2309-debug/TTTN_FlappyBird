// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\models\User.js
// Model User: truy vấn bảng USERS (khớp ERD).
// Tách riêng lớp truy vấn để Controller gọn gàng, dễ bảo trì.

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

// Tạo tài khoản mới và trả về user vừa tạo
async function createUser({ username, passwordHash, coins = 0, currentSkinId = null, googleId = null }) {
  const [result] = await db.execute(
    'INSERT INTO USERS (Username, PasswordHash, GoogleID, CurrentSkinID, Coins) VALUES (?, ?, ?, ?, ?)',
    [username, passwordHash, googleId, currentSkinId, coins]
  );
  return findById(result.insertId);
}

// Tìm user theo username (dùng cho đăng nhập + kiểm tra trùng khi đăng ký)
async function findByUsername(username) {
  const [rows] = await db.execute(
    `SELECT USERS.*, SKINS.SkinCode AS CurrentSkinCode,
      (SELECT COALESCE(MAX(GAME_RESULTS.Score), 0)
       FROM GAME_RESULTS
       WHERE GAME_RESULTS.UserID = USERS.UserID) AS BestScore
     FROM USERS 
     LEFT JOIN SKINS ON USERS.CurrentSkinID = SKINS.SkinID
     WHERE Username = ? LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

// Tìm user theo id (dùng cho GET /me)
async function findById(id) {
  const [rows] = await db.execute(
    `SELECT USERS.*, SKINS.SkinCode AS CurrentSkinCode,
      (SELECT COALESCE(MAX(GAME_RESULTS.Score), 0)
       FROM GAME_RESULTS
       WHERE GAME_RESULTS.UserID = USERS.UserID) AS BestScore
     FROM USERS 
     LEFT JOIN SKINS ON USERS.CurrentSkinID = SKINS.SkinID
     WHERE UserID = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
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

// Tìm user theo GoogleID
async function findByGoogleId(googleId) {
  const [rows] = await db.execute(
    `SELECT USERS.*, SKINS.SkinCode AS CurrentSkinCode,
      (SELECT COALESCE(MAX(GAME_RESULTS.Score), 0)
       FROM GAME_RESULTS
       WHERE GAME_RESULTS.UserID = USERS.UserID) AS BestScore
     FROM USERS
     LEFT JOIN SKINS ON USERS.CurrentSkinID = SKINS.SkinID
     WHERE GoogleID = ? LIMIT 1`,
    [googleId]
  );
  return rows[0] || null;
}

// Gắn GoogleID cho tài khoản đã tồn tại (liên kết theo email)
async function linkGoogleId(userId, googleId) {
  await db.execute('UPDATE USERS SET GoogleID = ? WHERE UserID = ?', [googleId, userId]);
}

module.exports = {
  createUser,
  findByUsername,
  findById,
  findByGoogleId,
  linkGoogleId,
  addOwnedSkin,
  updateCoins,
  updateCurrentSkin,
  getOwnedSkins,
  toPublic,
};
