const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình CORS: cho phép domain frontend khi deploy, mặc định mở cho localhost khi dev


const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean)
  : [];

// Cho phép ứng dụng Android Capacitor kết nối API
const capacitorOrigins = [
  "https://localhost",
  "http://localhost",
];

const trustedOrigins = [
  ...new Set([...allowedOrigins, ...capacitorOrigins]),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || trustedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());


// Tài liệu API (Swagger UI) tại http://localhost:5000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// File JSON thuần để export / tích hợp
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// Health-check: kiểm tra server còn sống
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Flappy Bird Backend API is running!",
  });
});

// Các route nghiệp vụ
app.use("/api/auth", authRoutes);
app.use("/api", gameRoutes);

// Xử lý route không tồn tại (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Không tìm thấy đường dẫn!",
  });
});

// Xử lý lỗi tập trung (500)
app.use((err, req, res, next) => {
  console.error("Lỗi server:", err);
  res.status(500).json({
    success: false,
    message: "Lỗi máy chủ nội bộ!",
  });
});

app.listen(PORT, () => {
  console.log(`Backend đang chạy tại http://localhost:${PORT}`);
});
