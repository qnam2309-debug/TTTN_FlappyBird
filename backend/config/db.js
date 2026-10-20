// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\config\db.js
// Cấu hình kết nối MySQL (XAMPP) bằng mysql2, dùng connection pool
// để tái sử dụng kết nối, tăng hiệu năng khi có nhiều request.

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'TTTN_FlappyBird',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // Trả về DATE/DATETIME dạng chuỗi dễ đọc
});

// Kiểm tra kết nối thành công (dùng khi khởi động server)
async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('✅ Kết nối MySQL thành công!');
  } finally {
    connection.release();
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;
