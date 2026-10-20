const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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
