const bearer = [{ bearerAuth: [] }]
const err = (d) => ({ description: d, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } })

export default {
  openapi: '3.0.3',
  info: { title: 'Flappy Bird API — Người 2 (Game Data & Player Progress)', version: '1.0.0' },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: { type: 'object', properties: { message: { type: 'string' } } },
      Skin: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'blue' },
          name: { type: 'string', example: 'Chim Xanh' },
          unlockScore: { type: 'integer', example: 10 },
          unlocked: { type: 'boolean' },
          equipped: { type: 'boolean' },
        },
      },
    },
  },
  paths: {
    '/api/scores': {
      post: {
        tags: ['Scores'], summary: 'Lưu điểm lượt chơi, cập nhật bestScore, xác định newRecord',
        security: bearer,
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['score'], properties: { score: { type: 'integer', minimum: 0, example: 27 } } } } } },
        responses: {
          201: { description: 'Lưu thành công', content: { 'application/json': { schema: { type: 'object', properties: {
            score: { type: 'integer' }, bestScore: { type: 'integer' }, newRecord: { type: 'boolean' },
            newlyUnlockedSkins: { type: 'array', items: { $ref: '#/components/schemas/Skin' } } } } } } },
          400: err('score không hợp lệ'), 401: err('Chưa đăng nhập'), 404: err('Không tìm thấy người chơi'),
        },
      },
    },
    '/api/leaderboard': {
      get: {
        tags: ['Leaderboard'], summary: 'Bảng xếp hạng theo điểm cao nhất (công khai)',
        description: 'Không cần token. Nếu gửi kèm token, response có thêm hạng của bản thân trong `me`.',
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 } }],
        responses: { 200: { description: 'Danh sách xếp hạng', content: { 'application/json': { schema: { type: 'object', properties: {
          leaderboard: { type: 'array', items: { type: 'object', properties: {
            rank: { type: 'integer' }, username: { type: 'string' }, bestScore: { type: 'integer' }, skin: { type: 'string' } } } },
          me: { nullable: true, type: 'object', properties: { rank: { type: 'integer' }, username: { type: 'string' }, bestScore: { type: 'integer' } } } } } } } } },
      },
    },
    '/api/skins': {
      get: {
        tags: ['Skins'], summary: 'Danh sách skin và trạng thái mở khoá của người chơi', security: bearer,
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: {
          equippedSkin: { type: 'string' }, bestScore: { type: 'integer' },
          skins: { type: 'array', items: { $ref: '#/components/schemas/Skin' } } } } } } },
          401: err('Chưa đăng nhập') },
      },
    },
    '/api/skins/equip': {
      post: {
        tags: ['Skins'], summary: 'Kiểm tra quyền sở hữu skin và cập nhật skin đang trang bị', security: bearer,
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['skinId'], properties: { skinId: { type: 'string', example: 'blue' } } } } } },
        responses: {
          200: { description: 'Trang bị thành công' }, 400: err('Thiếu skinId'), 401: err('Chưa đăng nhập'),
          403: err('Chưa mở khoá skin'), 404: err('Skin không tồn tại'),
        },
      },
    },
  },
}
