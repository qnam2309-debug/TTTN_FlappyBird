// Kiểm tra cấu hình SMTP trong backend/.env
// Chạy: npm run test:smtp

require('dotenv').config();
const nodemailer = require('nodemailer');

const host = (process.env.SMTP_HOST || '').trim();
const port = Number(process.env.SMTP_PORT) || 587;
const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
const user = (process.env.SMTP_USER || '').trim();
// App Password Gmail hiển thị có dấu cách -> bỏ hết trước khi dùng
const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

(async () => {
  console.log(`SMTP : ${host || '(trống)'}:${port} (secure=${secure})`);
  console.log(`User : ${user || '(trống)'}`);
  console.log(`Pass : ${pass ? `${pass.length} ký tự` : '(trống)'}`);

  if (!host || !user || !pass) {
    console.error('❌ Thiếu SMTP_HOST / SMTP_USER / SMTP_PASS trong backend/.env');
    process.exit(1);
  }

  if (/your_email|example\.com/i.test(user)) {
    console.error('❌ SMTP_USER vẫn là giá trị mẫu. Hãy điền email Gmail thật vào backend/.env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    console.log('✅ Kết nối và đăng nhập SMTP thành công!');
  } catch (err) {
    console.error('❌ Kết nối SMTP thất bại:', err.code || '', err.responseCode || '');
    console.error(err.message);
    if (err.responseCode === 535 || err.code === 'EAUTH') {
      console.error('→ Kiểm tra: đã bật xác thực 2 bước và dùng App Password 16 ký tự chưa?');
    }
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNECTION') {
      console.error('→ Thử đổi SMTP_PORT=465 và SMTP_SECURE=true (một số mạng chặn cổng 587).');
    }
    process.exit(1);
  }
})();
