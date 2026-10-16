import jwt from 'jsonwebtoken'

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

function readToken(req) {
  const h = req.headers.authorization || ''
  return h.startsWith('Bearer ') ? h.slice(7) : null
}

// NOTE: Đây là bản tạm thay cho JWT middleware của Người 1.
// Khi ghép, thay import ở các route bằng middleware thật; chỉ cần nó gán req.user = { id }.
export function requireAuth(req, res, next) {
  const token = readToken(req)
  if (!token) return res.status(401).json({ message: 'Thiếu token xác thực' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.id ?? payload.userId ?? payload.sub }
    next()
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

// Dùng cho endpoint công khai nhưng vẫn nhận diện người dùng nếu có token
export function optionalAuth(req, _res, next) {
  const token = readToken(req)
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET)
      req.user = { id: payload.id ?? payload.userId ?? payload.sub }
    } catch { /* bỏ qua, coi như khách */ }
  }
  next()
}
