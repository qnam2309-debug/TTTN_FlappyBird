# 🐦 Web Game Flappy Bird

Trò chơi **Flappy Bird** chạy trên nền web, tích hợp **bảng xếp hạng** và **xác thực người dùng** — được phát triển cho đồ án đại học.

---

## 📖 Giới Thiệu Dự Án

**Web Game Flappy Bird** là phiên bản hiện đại của trò chơi Flappy Bird kinh điển, chạy trực tiếp trên trình duyệt. Người chơi điều khiển chú chim, chạm hoặc nhấn phím để vỗ cánh bay qua các ống nước và cố gắng đạt điểm số cao nhất.

Dự án kết hợp giữa giao diện trò chơi hấp dẫn và hệ thống backend hoàn chỉnh:

- 🎮 **Frontend** — trò chơi được xây dựng bằng React và Canvas, có hệ thống xu (coin), cửa hàng trang phục (skin) và bảng xếp hạng.
- 🔐 **Backend** — REST API xử lý xác thực người dùng (đăng ký, đăng nhập, đăng xuất, lấy thông tin) sử dụng JWT và băm mật khẩu bằng bcrypt.
- 🗄️ **Database** — cơ sở dữ liệu MySQL lưu tài khoản, trang phục đã sở hữu và kết quả các lượt chơi.

Mục tiêu chính của dự án là thực hành và thể hiện kỹ năng lập trình full-stack: thiết kế cơ sở dữ liệu, xây dựng API xác thực bảo mật và kết nối với giao diện người dùng hoàn chỉnh.

---

## 👥 Thành Viên Thực Hiện

| Họ và Tên | MSSV |
|-----------|------|
| [Nguyen Van A] | [123456] |
| [Tran Thi B] | [654321] |
| [Le Van C] | [789012] |

> ✏️ Thay các nội dung trong ngoặc bằng tên và MSSV thật của các thành viên trong nhóm.

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- ⚛️ **ReactJS** — thư viện xây dựng giao diện
- ⚡ **Vite** — công cụ build và dev server
- 🎨 **Tailwind CSS** — thư viện CSS

### Backend
- 🟢 **Node.js** — môi trường chạy JavaScript
- 🚂 **Express** — web framework (CommonJS)
- 🔑 **JSON Web Token (JWT)** — xác thực người dùng
- 🔒 **bcryptjs** — băm mật khẩu
- 📚 **Swagger UI** — tài liệu và kiểm thử API

### Database
- 🐬 **MySQL** — cơ sở dữ liệu quan hệ (dùng connection pool qua `mysql2`)

---

## ✨ Các Chức Năng Chính

- ✅ **Đăng ký** — tạo tài khoản mới (mật khẩu được băm bằng bcryptjs).
- ✅ **Đăng nhập** — xác thực bằng tên đăng nhập/mật khẩu và nhận JWT.
- ✅ **Đăng xuất** — thoát khỏi phiên làm việc hiện tại.
- ✅ **Lấy thông tin người dùng** — truy xuất thông tin tài khoản (bảo vệ bằng JWT).
- ✅ **Swagger UI** — tài liệu API tương tác để kiểm thử các endpoint Auth.

---

## 📁 Cấu Trúc Thư Mục

```
TTTN_FlappyBird/
├── src/                        # Frontend (React + Vite)
│   ├── components/             # Header, HUD, các modal (Auth, Leaderboard, Shop)
│   ├── context/                # AuthContext (quản lý trạng thái xác thực)
│   ├── game/                   # Game engine, vẽ canvas, hook game loop
│   └── services/               # Lớp gọi API
├── public/                     # Tài nguyên tĩnh (favicon, icons)
├── index.html                  # Điểm vào HTML
├── vite.config.js              # Cấu hình Vite
├── package.json                # Dependencies & scripts của frontend
└── backend/                    # Backend (Express + MySQL)
    ├── index.js                # Entry point (route, Swagger, xử lý lỗi)
    ├── swagger.js              # Cấu hình OpenAPI (Swagger)
    ├── .env.example            # Mẫu cấu hình môi trường
    ├── config/db.js            # Connection pool MySQL
    ├── sql/schema.sql          # Script tạo database & bảng
    ├── models/                 # Lớp truy xuất dữ liệu User & Skin
    ├── controllers/            # Xử lý nghiệp vụ (auth)
    ├── middleware/             # Middleware xác thực JWT
    └── routes/                 # Định nghĩa các route
```

---

## 🚀 Bắt Đầu

### Yêu Cầu

Trước khi bắt đầu, hãy cài đặt:

- **Node.js** (phiên bản 18 trở lên) — [nodejs.org](https://nodejs.org)
- **XAMPP** (hoặc bất kỳ máy chủ MySQL nào) — [apachefriends.org](https://www.apachefriends.org)

### 1. Clone repository

```bash
git clone https://github.com/qnam2309-debug/TTTN_FlappyBird.git
cd TTTN_FlappyBird
```

### 2. Cài đặt Backend

```bash
# Chuyển vào thư mục backend
cd backend

# Cài dependencies
npm install

# Tạo file .env từ file mẫu
# (Windows PowerShell)
Copy-Item .env.example .env
# (Linux / macOS)
cp .env.example .env
```

Sửa file `.env` và điền thông tin kết nối database:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=TTTN_FlappyBird

JWT_SECRET=thay_bang_chuoi_ngau_nhien_dai
JWT_EXPIRES_IN=7d
```

> ⚠️ **Lưu ý:** Không commit file `.env` thật lên Git. Chỉ commit `.env.example`.

Import cấu trúc database (`backend/sql/schema.sql`):

- **Cách A — phpMyAdmin:** mở `http://localhost/phpmyadmin`, chọn **Import** và tải file `sql/schema.sql`.
- **Cách B — Dòng lệnh:**
  ```bash
  "C:\xampp\mysql\bin\mysql.exe" -u root < sql/schema.sql
  ```

### 3. Cài đặt Frontend

Mở một terminal mới **tại thư mục gốc của dự án** và chạy:

```bash
npm install
```

---

## 💻 Cách Chạy

Chạy **backend** (từ thư mục `backend`):

```bash
cd backend
npm run dev
# hoặc: npm start
```

Chạy **frontend** (từ thư mục gốc của dự án):

```bash
npm run dev
```

| Thành phần | URL |
|------------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:5000 |
| Swagger UI | http://localhost:5000/api-docs |

> 💡 Vite sẽ in ra URL chính xác của frontend khi khởi động (mặc định là `http://localhost:5173`).

---

## 📚 Tài Liệu API (Swagger)

Backend cung cấp tài liệu API tương tác thông qua **Swagger UI**.

1. Khởi động backend.
2. Mở trình duyệt và truy cập: **http://localhost:5000/api-docs**
3. Kiểm thử các API Auth trực tiếp trên giao diện.

### Các Endpoint Auth

| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|-------|----------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới | ❌ |
| `POST` | `/api/auth/login` | Đăng nhập và nhận JWT | ❌ |
| `GET` | `/api/auth/me` | Lấy thông tin người dùng hiện tại | ✅ Bearer token |
| `POST` | `/api/auth/logout` | Đăng xuất | ❌ |

### Hướng dẫn test bằng Swagger

1. Gọi **`POST /api/auth/register`** → bấm **Try it out** → nhập `username` và `password` → **Execute** → copy `token` trả về.
2. Bấm nút **🔒 Authorize** (góc trên bên phải) → dán `token` → **Authorize**.
3. Gọi **`GET /api/auth/me`** để lấy thông tin người dùng.
4. Test thêm các trường hợp lỗi: đăng ký trùng tên (`409`), sai mật khẩu (`401`), thiếu token (`401`).

> 📄 File spec OpenAPI (JSON) cũng có tại: **http://localhost:5000/api-docs.json**

---

## 🗄️ Cấu Trúc Database

Tên database: **`TTTN_FlappyBird`**

| Bảng | Khóa chính | Khóa ngoại | Mô tả |
|------|------------|------------|-------|
| `SKINS` | `SkinID` | — | Danh mục trang phục |
| `USERS` | `UserID` | `CurrentSkinID` → `SKINS.SkinID` | Tài khoản người chơi |
| `USER_SKINS` | (`UserID`, `SkinID`) | → `USERS`, → `SKINS` | Trang phục đã sở hữu (n-n) |
| `GAME_RESULTS` | `ResultID` | `UserID` → `USERS.UserID` | Kết quả từng lượt chơi |

Cấu trúc chi tiết (cột, ràng buộc và index) nằm trong file [`backend/sql/schema.sql`](backend/sql/schema.sql).

---

## 📄 Giấy Phép

Dự án được phát triển cho mục đích học tập trong khuôn khổ môn học tại trường đại học.
