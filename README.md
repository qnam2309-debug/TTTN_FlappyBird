# Flappy Bird

Game Flappy Bird dùng React, Vite, Canvas và backend Node/Express với MySQL.

## Chạy ứng dụng

1. Cài dependencies frontend: `npm install`.
2. Tạo file `.env` từ `.env.example`. Mặc định `VITE_API_BASE_URL=/api` và Vite proxy request đến backend tại `http://localhost:5000`.
3. Cấu hình MySQL và biến môi trường backend theo hướng dẫn trong [`backend/README.md`](./backend/README.md), sau đó khởi tạo database bằng [`backend/sql/schema.sql`](./backend/sql/schema.sql).
4. Khởi động backend trên port 5000: `cd backend` rồi `npm install` và `npm start`.
5. Khởi động frontend: `npm run dev`.

Khi triển khai frontend ngoài môi trường Vite dev server, đặt `VITE_API_BASE_URL` thành URL backend kết thúc bằng `/api`, ví dụ `https://example.com/api`.

## API frontend sử dụng

- `POST /api/auth/register` và `POST /api/auth/login`: đăng ký, đăng nhập; phản hồi chứa `token` và `user`.
- `GET /api/auth/me`: lấy tài khoản hiện tại bằng Bearer token.
- `POST /api/scores`: lưu điểm ván chơi đã đăng nhập; body `{ "score": 12 }`; phản hồi có `bestScore`.
- `GET /api/leaderboard?limit=10`: lấy bảng xếp hạng; phản hồi chứa mảng `leaderboard` với `id`, `username`, `bestScore` và `rank`.

Đăng xuất chỉ xóa session phía frontend vì JWT của backend là stateless.

Cửa hàng skin và cơ chế mua bằng xu hiện tại được giữ nguyên, không chuyển sang cơ chế mở khóa theo điểm cao nhất.
