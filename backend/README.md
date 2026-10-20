# Flappy Bird — Backend

Backend Node/Express cho xác thực, lưu điểm và bảng xếp hạng của game Flappy Bird.

---

## 1. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Runtime | Node.js |
| Web framework | Express (CommonJS) |
| Database | MySQL / MariaDB (XAMPP) |
| Driver DB | `mysql2` (connection pool) |
| Băm mật khẩu | `bcryptjs` |
| Xác thực | `jsonwebtoken` (JWT) |
| Biến môi trường | `dotenv` |
| CORS | `cors` |
| Tài liệu & test API | `swagger-ui-express` (Swagger UI) |
| Dev tool | `nodemon` |

---

## 2. Cấu trúc thư mục

```
backend/
├── index.js                    # Entry point: nạp route, Swagger, xử lý lỗi
├── swagger.js                  # Cấu hình tài liệu OpenAPI (Swagger)
├── .env.example                # Mẫu cấu hình (copy thành .env)
├── config/
│   └── db.js                   # Kết nối MySQL (connection pool)
├── sql/
│   └── schema.sql              # Script tạo database + bảng (khớp ERD)
├── models/
│   ├── User.js                 # Truy vấn bảng USERS
│   └── Skin.js                 # Truy vấn bảng SKINS
├── controllers/
│   ├── authController.js       # Xử lý nghiệp vụ xác thực
│   └── gameController.js       # Lưu điểm và lấy bảng xếp hạng
├── middleware/
│   └── auth.js                 # Middleware xác thực JWT
└── routes/
    ├── auth.js                 # Khai báo các route Auth
    └── game.js                 # Khai báo các route Game
```

---

## 3. Yêu cầu trước khi chạy

- **Node.js** (khuyến nghị v18+).
- **XAMPP** (đã bật MySQL trên cổng `3306`).

---

## 4. Cài đặt & chạy

```bash
# 1. Vào thư mục backend
cd backend

# 2. Cài dependencies
npm install

# 3. Tạo file .env từ file mẫu
#    (Windows PowerShell)
Copy-Item .env.example .env
#    (hoặc chép thủ công rồi điền giá trị)

# 4. Tạo database & bảng (chọn 1 trong 2 cách):
#    Cách A - dùng phpMyAdmin: mở http://localhost/phpmyadmin
#             -> Import file sql/schema.sql
#    Cách B - dùng dòng lệnh (XAMPP):
#             "C:\xampp\mysql\bin\mysql.exe" -u root < sql/schema.sql

# 5. Chạy server (chế độ dev, tự reload)
npm run dev
#    hoặc chạy thường:
npm start
```

Server chạy tại: **http://localhost:5000**

---

## 5. Cấu hình file `.env`

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=TTTN_FlappyBird

JWT_SECRET=thay_bang_chuoi_bi_mat_ngau_nhien
JWT_EXPIRES_IN=7d
```

> ⚠️ **Không commit file `.env` thật lên Git.** Chỉ commit `.env.example`. `JWT_SECRET` phải là chuỗi ngẫu nhiên dài, không tiết lộ cho ai.

---

## 6. API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Chức năng | Xác thực |
|---|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản mới | Không |
| POST | `/api/auth/login` | Đăng nhập | Không |
| GET | `/api/auth/me` | Lấy thông tin người dùng hiện tại | ✅ Bearer token |
| POST | `/api/auth/logout` | Đăng xuất | Không |
| POST | `/api/scores` | Lưu điểm ván chơi, trả về điểm cao nhất | ✅ Bearer JWT |
| GET | `/api/leaderboard?limit=10` | Lấy bảng xếp hạng (tối đa 100 người chơi) | Không |

Điểm lưu qua `/api/scores` phải là số nguyên không âm. Kết quả được ghi vào `GAME_RESULTS`; leaderboard xếp người chơi theo điểm cao nhất.

### Ví dụ

**Đăng ký** — `POST /api/auth/register`
```json
// Request body
{ "username": "player1", "password": "123456" }

// Response 201
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "player1",
    "coins": 50,
    "currentSkinId": 1,
    "bestScore": 0,
    "createdAt": "2026-10-15T21:28:43.000Z"
  }
}
```

**Lưu điểm** — `POST /api/scores` (cần `Authorization: Bearer <token>`)
```json
{ "score": 12 }
```

**Bảng xếp hạng** — `GET /api/leaderboard?limit=10`
```json
{
  "success": true,
  "leaderboard": [
    { "rank": 1, "id": "1", "username": "player1", "bestScore": 12 }
  ]
}
```

**Lấy thông tin** — `GET /api/auth/me`
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Mã lỗi thường gặp**

| Mã | Ý nghĩa |
|---|---|
| `400` | Dữ liệu không hợp lệ (thiếu trường, mật khẩu < 3 ký tự) |
| `401` | Sai tên đăng nhập/mật khẩu, hoặc chưa đăng nhập |
| `409` | Tên đăng nhập đã tồn tại |
| `500` | Lỗi máy chủ |

> 📘 Khi đăng ký: tặng **50 xu** và trang bị **skin mặc định** (`default`).

---

## 7. Cơ sở dữ liệu (khớp ERD)

Database: `TTTN_FlappyBird` — 4 bảng:

| Bảng | Khóa chính | Khóa ngoại | Mô tả |
|---|---|---|---|
| `SKINS` | `SkinID` | — | Danh mục trang phục |
| `USERS` | `UserID` | `CurrentSkinID` → `SKINS.SkinID` | Tài khoản người chơi |
| `USER_SKINS` | (`UserID`, `SkinID`) | → `USERS`, → `SKINS` | Trang phục đã sở hữu (n-n) |
| `GAME_RESULTS` | `ResultID` | `UserID` → `USERS.UserID` | Kết quả từng lượt chơi |

Chi tiết cột xem trong file [`sql/schema.sql`](sql/schema.sql).

---

## 8. Kiểm thử bằng Swagger UI

1. Chạy server xong, mở: **http://localhost:5000/api-docs**
2. Test `POST /api/auth/register` → **Try it out** → nhập body → **Execute** → copy `token`.
3. Bấm **🔒 Authorize** → dán `token` → **Authorize**.
4. Gọi `GET /api/auth/me` để lấy thông tin người dùng.
5. Test `POST /api/scores` với token, sau đó gọi `GET /api/leaderboard`.
6. Test thêm các case lỗi: đăng ký trùng (409), sai mật khẩu (401), thiếu token (401).

> File spec thô (OpenAPI JSON): **http://localhost:5000/api-docs.json**

---

## 9. Ghi chú

- **JWT là "stateless"**: đăng xuất = client xóa token (server không lưu phiên).
- `bestScore` được tính từ `GAME_RESULTS`. Cửa hàng skin không thuộc các API backend được triển khai ở đây.
- Cấu trúc database được chuyển từ ERD (cú pháp SQL Server) sang **MySQL/MariaDB** để chạy trên XAMPP.
