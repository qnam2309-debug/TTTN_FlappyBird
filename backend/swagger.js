// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\backend\swagger.js
// Cấu hình tài liệu OpenAPI (Swagger) cho API Backend Flappy Bird.
// Mở trình duyệt: http://localhost:5000/api-docs

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Flappy Bird API',
    version: '1.0.0',
    description:
      'Tài liệu API Backend Flappy Bird — xác thực, lưu điểm và bảng xếp hạng.\n\n' +
      'Quy trình test:\n' +
      '1. Dùng `POST /api/auth/register` để tạo tài khoản (nhận token).\n' +
      '2. Bấm nút **Authorize** (🔒) và dán token vừa nhận.\n' +
      '3. Gọi `GET /api/auth/me` để lấy thông tin người dùng.\n' +
      '4. Gọi `POST /api/scores` để lưu điểm hoặc `GET /api/leaderboard` để xem bảng xếp hạng.',
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Máy chủ local (XAMPP + Express)' },
  ],
  tags: [
    { name: 'Auth', description: 'Đăng ký, đăng nhập, thông tin người dùng' },
    { name: 'Game', description: 'Lưu điểm và bảng xếp hạng' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Dán JWT nhận được từ API đăng nhập/đăng ký (không cần chữ "Bearer").',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'player1' },
          coins: { type: 'integer', example: 50 },
          currentSkinId: { type: 'integer', example: 1, nullable: true },
          bestScore: { type: 'integer', example: 12 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ScoreRequest: {
        type: 'object',
        required: ['score'],
        properties: {
          score: { type: 'integer', minimum: 0, example: 12 },
        },
      },
      ScoreResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          score: { type: 'integer', example: 12 },
          bestScore: { type: 'integer', example: 12 },
          newRecord: { type: 'boolean', example: true },
        },
      },
      LeaderboardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          leaderboard: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rank: { type: 'integer', example: 1 },
                id: { type: 'string', example: '1' },
                username: { type: 'string', example: 'player1' },
                bestScore: { type: 'integer', example: 12 },
              },
            },
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'player1' },
          password: { type: 'string', format: 'password', example: '123456' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Sai tên đăng nhập hoặc mật khẩu!' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký tài khoản mới',
        description:
          'Tạo tài khoản mới. Tặng 50 xu và trang bị skin mặc định. Trả về JWT + thông tin người dùng.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Đăng ký thành công',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          400: {
            description: 'Dữ liệu không hợp lệ',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          409: {
            description: 'Tên đăng nhập đã tồn tại',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập',
        description: 'Xác thực username/password, trả về JWT + thông tin người dùng.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Đăng nhập thành công',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          400: {
            description: 'Dữ liệu không hợp lệ',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Sai tên đăng nhập hoặc mật khẩu',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Lấy thông tin người dùng hiện tại',
        description: 'Cần JWT. Bấm nút **Authorize** và dán token trước khi gọi.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Thành công',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } },
            },
          },
          401: {
            description: 'Chưa đăng nhập / token không hợp lệ',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng xuất',
        description:
          'JWT là stateless: đăng xuất = client xóa token. Endpoint này chỉ trả về xác nhận.',
        responses: {
          200: {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Đăng xuất thành công!' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/scores': {
      post: {
        tags: ['Game'],
        summary: 'Lưu điểm một ván chơi',
        description: 'Cần JWT. Điểm cao nhất tài khoản được trả về cùng phản hồi.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ScoreRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Đã lưu điểm',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScoreResponse' },
              },
            },
          },
          400: {
            description: 'Điểm không hợp lệ',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Chưa đăng nhập / token không hợp lệ',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/leaderboard': {
      get: {
        tags: ['Game'],
        summary: 'Lấy bảng xếp hạng',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          200: {
            description: 'Bảng xếp hạng điểm cao nhất',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LeaderboardResponse' },
              },
            },
          },
        },
      },
    },
  },
};
