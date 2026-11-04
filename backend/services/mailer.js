// backend/services/mailer.js
// Gửi mã OTP qua email bằng nodemailer.
// Nếu chưa cấu hình SMTP, dùng chế độ dev: ghi OTP ra console để test.

const nodemailer = require('nodemailer');

const smtpHost = (process.env.SMTP_HOST || '').trim();
const smtpUser = (process.env.SMTP_USER || '').trim();
// App Password của Gmail thường được hiển thị theo nhóm 4 ký tự (có dấu cách).
// Bỏ toàn bộ khoảng trắng để tránh lỗi 535 khi đăng nhập SMTP.
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

// Giá trị mẫu trong .env.example — coi như chưa cấu hình để backend chạy chế độ DEV
const isPlaceholderUser = /your_email|example\.com/i.test(smtpUser);
const isMailConfigured = Boolean(smtpHost && smtpUser && smtpPass) && !isPlaceholderUser;

if (isPlaceholderUser) {
  console.warn(
    '[MAIL] SMTP_USER vẫn là giá trị mẫu. Đang dùng chế độ DEV: mã OTP sẽ được in ra console. ' +
      'Hãy điền email Gmail thật và App Password vào backend/.env.'
  );
}

let transporter = null;

function getTransporter() {
  if (!isMailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    });
  }
  return transporter;
}

function buildHtml(otp, expiresMinutes) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#0c1017;padding:24px">
    <div style="max-width:420px;margin:0 auto;background:#fde68a;border:4px solid #000;box-shadow:4px 4px 0 #000;padding:20px">
      <h2 style="margin:0 0 12px;color:#000;font-size:20px">🐦 Flappy Bird</h2>
      <p style="margin:0 0 8px;color:#111;font-size:14px">Mã OTP xác thực đăng ký của bạn:</p>
      <div style="background:#fef3c7;border:2px solid #000;padding:12px;text-align:center;font-size:28px;font-weight:bold;letter-spacing:8px;color:#be123c">${otp}</div>
      <p style="margin:12px 0 0;color:#333;font-size:12px">Mã có hiệu lực ${expiresMinutes} phút. Không chia sẻ mã này với bất kỳ ai.</p>
    </div>
  </div>`;
}

async function sendOtpEmail(email, otp, { expiresMinutes = 5 } = {}) {
  const rawFrom = (process.env.SMTP_FROM || '').trim();
  // Nếu SMTP_FROM còn là giá trị mẫu, dùng chính tài khoản SMTP làm người gửi
  const from = !rawFrom || /your_email|flappybird\.local/i.test(rawFrom)
    ? `Flappy Bird <${smtpUser}>`
    : rawFrom;
  const subject = 'Mã OTP xác thực đăng ký Flappy Bird';
  const text = `Mã OTP của bạn là: ${otp}\nMã có hiệu lực ${expiresMinutes} phút. Không chia sẻ mã này với ai.`;
  const html = buildHtml(otp, expiresMinutes);

  const t = getTransporter();
  if (!t) {
    // Dev fallback: log OTP ra console để test khi chưa có SMTP
    console.log(`[DEV OTP] ${email} -> ${otp} (hết hạn sau ${expiresMinutes} phút)`);
    return { dev: true };
  }

  await t.sendMail({ from, to: email, subject, text, html });
  return { dev: false };
}

module.exports = { isMailConfigured, sendOtpEmail };
