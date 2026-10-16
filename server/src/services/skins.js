import db from '../db.js'

// Mở khoá mọi skin mà bestScore đủ điều kiện. Trả về danh sách skin vừa mở mới.
export function unlockEligibleSkins(userId, bestScore) {
  const eligible = db
    .prepare(`SELECT id, name, unlock_score FROM skins
              WHERE unlock_score <= ?
                AND id NOT IN (SELECT skin_id FROM user_skins WHERE user_id = ?)`)
    .all(bestScore, userId)
  const ins = db.prepare('INSERT OR IGNORE INTO user_skins (user_id, skin_id) VALUES (?, ?)')
  for (const s of eligible) ins.run(userId, s.id)
  return eligible.map((s) => ({ id: s.id, name: s.name, unlockScore: s.unlock_score }))
}
