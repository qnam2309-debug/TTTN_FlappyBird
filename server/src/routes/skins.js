import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { unlockEligibleSkins } from '../services/skins.js'

const router = Router()

// GET /api/skins
router.get('/', requireAuth, (req, res) => {
  const user = db.prepare('SELECT best_score, equipped_skin_id FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người chơi' })

  unlockEligibleSkins(req.user.id, user.best_score) // đồng bộ phòng khi thêm skin mới

  const skins = db
    .prepare(`SELECT s.id, s.name, s.unlock_score,
                     CASE WHEN us.user_id IS NULL THEN 0 ELSE 1 END AS unlocked
              FROM skins s
              LEFT JOIN user_skins us ON us.skin_id = s.id AND us.user_id = ?
              ORDER BY s.unlock_score ASC`)
    .all(req.user.id)
    .map((s) => ({
      id: s.id,
      name: s.name,
      unlockScore: s.unlock_score,
      unlocked: !!s.unlocked,
      equipped: s.id === user.equipped_skin_id,
    }))

  res.json({ equippedSkin: user.equipped_skin_id, bestScore: user.best_score, skins })
})

// POST /api/skins/equip
router.post('/equip', requireAuth, (req, res) => {
  const { skinId } = req.body ?? {}
  if (typeof skinId !== 'string' || !skinId) {
    return res.status(400).json({ message: 'Thiếu skinId' })
  }
  const skin = db.prepare('SELECT id, name FROM skins WHERE id = ?').get(skinId)
  if (!skin) return res.status(404).json({ message: 'Skin không tồn tại' })

  const owned = db
    .prepare('SELECT 1 FROM user_skins WHERE user_id = ? AND skin_id = ?')
    .get(req.user.id, skinId)
  if (!owned) return res.status(403).json({ message: 'Bạn chưa mở khoá skin này' })

  db.prepare('UPDATE users SET equipped_skin_id = ? WHERE id = ?').run(skinId, req.user.id)
  res.json({ message: 'Đã trang bị skin', equippedSkin: skin.id, name: skin.name })
})

export default router
