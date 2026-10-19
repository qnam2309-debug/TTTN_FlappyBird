// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\models\User.js
// Model User: truy vấn bảng USERS (khớp ERD).
// Tách riêng lớp truy vấn để Controller gọn gàng, dễ bảo trì.

const db = require('../config/db');

// Chuyển dòng dữ liệu DB thành object "sạch" trả về cho client (bỏ mật khẩu)
function toPublic(row) {
  if (!row) return null;
  return {
    id: row.UserID,
    username: row.Username,
    coins: row.Coins,
    currentSkinId: row.CurrentSkinID,
    bestScore: Number(row.BestScore) || 0,
    createdAt: row.CreatedAt,
  };
}

// Tạo tài khoản mới và trả về user vừa tạo
async function createUser({ username, passwordHash, coins = 0, currentSkinId = null }) {
  const [result] = await db.execute(
    'INSERT INTO USERS (Username, PasswordHash, CurrentSkinID, Coins) VALUES (?, ?, ?, ?)',
    [username, passwordHash, currentSkinId, coins]
  );
  return findById(result.insertId);
}

// Tìm user theo username (dùng cho đăng nhập + kiểm tra trùng khi đăng ký)
async function findByUsername(username) {
  const [rows] = await db.execute(
    `SELECT USERS.*,
      (SELECT COALESCE(MAX(GAME_RESULTS.Score), 0)
       FROM GAME_RESULTS
       WHERE GAME_RESULTS.UserID = USERS.UserID) AS BestScore
     FROM USERS WHERE Username = ? LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

// Tìm user theo id (dùng cho GET /me)
async function findById(id) {
  const [rows] = await db.execute(
    `SELECT USERS.*,
      (SELECT COALESCE(MAX(GAME_RESULTS.Score), 0)
       FROM GAME_RESULTS
       WHERE GAME_RESULTS.UserID = USERS.UserID) AS BestScore
     FROM USERS WHERE UserID = ? LIMIT 1`,
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

module.exports = {
  createUser,
  findByUsername,
  findById,
  addOwnedSkin,
  toPublic,
};
