import { Router } from 'express'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import { JWT_SECRET } from '../middleware/auth.js'
import { unlockEligibleSkins } from '../services/skins.js'

// NOTE: Bản TẠM thay cho phần đăng ký/đăng nhập của Người 1.
// Khi ghép code thật, xoá file này và bỏ dòng mount '/api/auth' trong app.js.
const router = Router()

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const a = Buffer.from(hash, 'hex')
  const b = crypto.scryptSync(password, salt, 64)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

const sign = (user) => jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })

router.post('/register', (req, res) => {
  const { username, password } = req.body ?? {}
  if (typeof username !== 'string' || !/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ message: 'Tên đăng nhập 3-20 ký tự, chỉ gồm chữ, số, dấu _' })
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' })
  }
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) {
    return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' })
  }
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(username, hashPassword(password))
  const user = { id: Number(lastInsertRowid), username }
  unlockEligibleSkins(user.id, 0) // cấp skin mặc định
  res.status(201).json({ token: sign(user), user })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {}
  const row = typeof username === 'string' && db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username)
  if (!row || typeof password !== 'string' || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' })
  }
  const user = { id: row.id, username: row.username }
  res.json({ token: sign(user), user })
})

export default router
