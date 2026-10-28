// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\routes\auth.js
// Định nghĩa các route Authentication, gắn với controller tương ứng.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Các route công khai (không cần đăng nhập)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);

// Route cần đăng nhập (bảo vệ bằng middleware auth)
router.get('/me', auth, authController.me);

module.exports = router;
