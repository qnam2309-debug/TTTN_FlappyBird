// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\routes\auth.js
// Định nghĩa các route Authentication, gắn với controller tương ứng.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// Các route công khai (không cần đăng nhập, áp dụng Rate Limiting chống Brute-force & Spam)
router.post('/register', authLimiter, authController.register);
router.post('/verify-otp', otpLimiter, authController.verifyOtp);
router.post('/resend-otp', otpLimiter, authController.resendOtp);
router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/logout', authController.logout);

// Route cần đăng nhập (bảo vệ bằng middleware auth)
router.get('/me', auth, authController.me);

module.exports = router;
