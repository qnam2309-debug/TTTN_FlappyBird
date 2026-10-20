const db = require('../config/db');

exports.submitScore = async (req, res, next) => {
  try {
    const { score } = req.body;
    if (!Number.isSafeInteger(score) || score < 0 || score > 2147483647) {
      return res.status(400).json({
        success: false,
        message: 'Điểm phải là số nguyên không âm hợp lệ.',
      });
    }

    const [rows] = await db.execute(
      'SELECT COALESCE(MAX(Score), 0) AS bestScore FROM GAME_RESULTS WHERE UserID = ?',
      [req.user.id]
    );
    const previousBest = Number(rows[0].bestScore) || 0;

    await db.execute(
      'INSERT INTO GAME_RESULTS (UserID, Score) VALUES (?, ?)',
      [req.user.id, score]
    );

    return res.json({
      success: true,
      score,
      bestScore: Math.max(previousBest, score),
      newRecord: score > previousBest,
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const requestedLimit = Number(req.query.limit ?? 10);
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 10;
    const [rows] = await db.execute(
      `SELECT USERS.UserID AS id, USERS.Username AS username,
        MAX(GAME_RESULTS.Score) AS bestScore
       FROM USERS
       INNER JOIN GAME_RESULTS ON GAME_RESULTS.UserID = USERS.UserID
       GROUP BY USERS.UserID, USERS.Username
       ORDER BY bestScore DESC, USERS.UserID ASC
       LIMIT ?`,
      [limit]
    );

    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      id: String(row.id),
      username: row.username,
      bestScore: Number(row.bestScore) || 0,
    }));

    return res.json({ success: true, leaderboard });
  } catch (err) {
    next(err);
  }
};
