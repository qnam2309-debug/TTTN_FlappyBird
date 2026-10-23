// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\models\Skin.js
// Model Skin: truy vấn bảng SKINS (khớp ERD).
// Dùng để lấy skin mặc định khi đăng ký tài khoản mới.

const db = require('../config/db');

// Tìm skin theo mã code (ví dụ 'default')
async function findByCode(skinCode) {
  const [rows] = await db.execute(
    'SELECT * FROM SKINS WHERE SkinCode = ? LIMIT 1',
    [skinCode]
  );
  return rows[0] || null;
}

// Tìm skin theo id
async function findById(skinId) {
  const [rows] = await db.execute(
    'SELECT * FROM SKINS WHERE SkinID = ? LIMIT 1',
    [skinId]
  );
  return rows[0] || null;
}

module.exports = { findByCode, findById };
