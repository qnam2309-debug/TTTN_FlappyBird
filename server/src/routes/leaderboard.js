import { Router } from 'express'
import db from '../db.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/leaderboard?limit=10  (công khai; nếu có token sẽ kèm hạng của bản thân)
router.get('/', optionalAuth, (req, res) => {
  let limit = parseInt(req.query.limit, 10)
  if (!Number.isInteger(limit) || limit < 1) limit = 10
  limit = Math.min(limit, 100)

  const rows = db
    .prepare(`SELECT id, username, best_score, equipped_skin_id FROM users
              WHERE best_score > 0
              ORDER BY best_score DESC, id ASC LIMIT ?`)
    .all(limit)

  const leaderboard = rows.map((r, i) => ({
    rank: i + 1,
    username: r.username,
    bestScore: r.best_score,
    skin: r.equipped_skin_id,
  }))

  let me = null
  if (req.user) {
    const u = db.prepare('SELECT username, best_score FROM users WHERE id = ?').get(req.user.id)
    if (u && u.best_score > 0) {
      const { higher } = db
        .prepare('SELECT COUNT(*) AS higher FROM users WHERE best_score > ? OR (best_score = ? AND id < ?)')
        .get(u.best_score, u.best_score, req.user.id)
      me = { rank: higher + 1, username: u.username, bestScore: u.best_score }
    }
  }

  res.json({ leaderboard, me })
})

export default router
