# 🐤 Flappy Bird (React + Vite + Express)

## Chạy
```bash
npm install     # tự cài luôn cả thư mục server/
npm start       # chạy web (http://localhost:5500) + API (http://localhost:3000)
```
- Mở **http://localhost:5500**, đăng ký tài khoản rồi chơi.
- Swagger của 4 API: **http://localhost:3000/api-docs**
- Test backend: `npm --prefix server test`

## Cách chơi
Space / ↑ / chạm màn hình để bay. Điểm cao nhất mở khoá skin mới (10 / 25 / 50 / 100 điểm).

## Cấu trúc
- `src/` — frontend React (game canvas, đăng nhập, bảng xếp hạng, skin)
- `server/` — backend Express + SQLite (file `flappy.db` tự tạo)
  - **Người 2:** `routes/scores.js`, `leaderboard.js`, `skins.js`, `services/skins.js`, `swagger.js`
  - **Tạm thay Người 1:** `routes/auth.js` (đăng ký/đăng nhập) và `middleware/auth.js` (JWT).
    Khi ghép code thật, thay 2 file này; JWT middleware chỉ cần gán `req.user = { id }` và dùng cùng `JWT_SECRET`.
- Biến môi trường backend: `PORT`, `JWT_SECRET`, `DB_PATH`.
