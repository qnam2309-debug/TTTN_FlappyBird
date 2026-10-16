import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { unlockEligibleSkins } from '../services/skins.js'

const router = Router()
const MAX_SCORE = 100000 // chặn điểm vô lý (chống gửi điểm giả quá lố)

// POST /api/scores
router.post('/', requireAuth, (req, res) => {
  const { score } = req.body ?? {}
  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return res.status(400).json({ message: `score phải là số nguyên từ 0 đến ${MAX_SCORE}` })
  }

  const userId = req.user.id
  const user = db.prepare('SELECT id, best_score FROM users WHERE id = ?').get(userId)
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người chơi' })

  const run = db.transaction(() => {
    db.prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)').run(userId, score)
    const newRecord = score > user.best_score
    const bestScore = newRecord ? score : user.best_score
    if (newRecord) db.prepare('UPDATE users SET best_score = ? WHERE id = ?').run(bestScore, userId)
    const newlyUnlockedSkins = unlockEligibleSkins(userId, bestScore)
    return { score, bestScore, newRecord, newlyUnlockedSkins }
  })

  res.status(201).json(run())
})

export default router
