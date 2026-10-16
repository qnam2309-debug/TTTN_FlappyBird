import Database from 'better-sqlite3'

const db = new Database(process.env.DB_PATH || 'flappy.db')
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// NOTE: bảng `users` do Người 1 phụ trách. Đây chỉ là bản tối thiểu để Người 2 chạy độc lập.
// Khi ghép code, giữ lại các cột best_score và equipped_skin_id trong bảng users thật.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL DEFAULT '',
    best_score INTEGER NOT NULL DEFAULT 0,
    equipped_skin_id TEXT NOT NULL DEFAULT 'default'
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);

  CREATE TABLE IF NOT EXISTS skins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unlock_score INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_skins (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skin_id TEXT NOT NULL REFERENCES skins(id) ON DELETE CASCADE,
    unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, skin_id)
  );
`)

// Dữ liệu skin mặc định (sửa tuỳ ý): mở khoá khi bestScore >= unlock_score
const seed = db.prepare('INSERT OR IGNORE INTO skins (id, name, unlock_score) VALUES (?, ?, ?)')
for (const [id, name, score] of [
  ['default', 'Chim Vàng', 0],
  ['blue', 'Chim Xanh', 10],
  ['red', 'Chim Đỏ', 25],
  ['ninja', 'Chim Ninja', 50],
  ['golden', 'Chim Hoàng Kim', 100],
]) seed.run(id, name, score)

export default db
