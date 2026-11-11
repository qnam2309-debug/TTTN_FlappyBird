const db = require('../config/db');
const User = require('../models/User');
const Skin = require('../models/Skin');

exports.submitScore = async (req, res, next) => {
  try {
    const { score, durationSeconds } = req.body;
    if (!Number.isSafeInteger(score) || score < 0 || score > 3000) {
      return res.status(400).json({
        success: false,
        message: 'Điểm số không hợp lệ (phải là số nguyên từ 0 đến 3000).',
      });
    }

    // Cơ chế Anti-Cheat: Kiểm tra thời gian ván chơi tối thiểu đối với điểm số > 0
    if (score > 0) {
      // Vận tốc cuộn 150px/s, khoảng cách cột 200px -> tối thiểu ~1.33s/ống (cho phép dung sai 0.9s/ống)
      const minDuration = 1.5 + (score - 1) * 0.9;
      if (
        typeof durationSeconds !== 'number' ||
        !Number.isFinite(durationSeconds) ||
        durationSeconds < minDuration
      ) {
        return res.status(400).json({
          success: false,
          message: 'Điểm số không hợp lệ (thời gian chơi không tương xứng với kết quả đạt được).',
        });
      }
    }

    // Lấy kỷ lục hiện tại của user trong GAME_RESULTS (nếu có)
    const [rows] = await db.execute(
      'SELECT Score FROM GAME_RESULTS WHERE UserID = ? LIMIT 1',
      [req.user.id]
    );
    const previousBest = rows.length > 0 ? Number(rows[0].Score) : 0;
    const isNewRecord = rows.length === 0 ? true : score > previousBest;

    // Lưu điểm theo cơ chế Upsert (chỉ giữ 1 dòng kỷ lục duy nhất cho mỗi User)
    await db.execute(
      `INSERT INTO GAME_RESULTS (UserID, Score, PlayedAt) 
       VALUES (?, ?, CURRENT_TIMESTAMP(6))
       ON DUPLICATE KEY UPDATE 
         Score = GREATEST(Score, VALUES(Score)),
         PlayedAt = IF(VALUES(Score) > Score, CURRENT_TIMESTAMP(6), PlayedAt)`,
      [req.user.id, score]
    );

    // Thưởng xu vào database MySQL: 1 điểm = 1 xu
    if (score > 0) {
      await User.updateCoins(req.user.id, score);
    }

    const updatedUser = await User.findById(req.user.id);

    return res.json({
      success: true,
      score,
      bestScore: Math.max(previousBest, score),
      newRecord: isNewRecord,
      coinsEarned: score,
      totalCoins: updatedUser.Coins,
    });
  } catch (err) {
    next(err);
  }
};

// Mua skin bằng xu lưu vào DB MySQL có bọc Transaction đảm bảo tính toàn vẹn (ACID)
exports.buySkin = async (req, res, next) => {
  const { skinCode } = req.body;
  if (!skinCode) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã trang phục!' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Kiểm tra skin tồn tại
    const [skinRows] = await connection.execute(
      'SELECT SkinID, SkinCode, Price FROM SKINS WHERE SkinCode = ? LIMIT 1',
      [skinCode]
    );
    if (skinRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Trang phục không tồn tại!' });
    }
    const skin = skinRows[0];

    // 2. Khóa dòng user để kiểm tra số dư xu và chống Race Condition (SELECT ... FOR UPDATE)
    const [userRows] = await connection.execute(
      'SELECT UserID, Coins, CurrentSkinID FROM USERS WHERE UserID = ? FOR UPDATE',
      [req.user.id]
    );
    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại!' });
    }
    const currentUser = userRows[0];

    // 3. Kiểm tra xem đã sở hữu skin này chưa
    const [ownedRows] = await connection.execute(
      'SELECT SkinID FROM USER_SKINS WHERE UserID = ? AND SkinID = ? LIMIT 1',
      [req.user.id, skin.SkinID]
    );
    if (ownedRows.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Bạn đã sở hữu trang phục này!' });
    }

    // 4. Kiểm tra số dư xu
    if (currentUser.Coins < skin.Price) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Không đủ xu! Cần thêm ${skin.Price - currentUser.Coins} xu.`,
      });
    }

    // 5. Trừ xu, lưu quyền sở hữu vào USER_SKINS và trang bị ngay
    await connection.execute(
      'UPDATE USERS SET Coins = Coins - ?, CurrentSkinID = ? WHERE UserID = ?',
      [skin.Price, skin.SkinID, req.user.id]
    );
    await connection.execute(
      'INSERT INTO USER_SKINS (UserID, SkinID) VALUES (?, ?)',
      [req.user.id, skin.SkinID]
    );

    // 6. Lấy danh sách skin đã sở hữu mới nhất
    const [allOwnedRows] = await connection.execute(
      `SELECT SKINS.SkinCode
       FROM USER_SKINS
       JOIN SKINS ON USER_SKINS.SkinID = SKINS.SkinID
       WHERE USER_SKINS.UserID = ?`,
      [req.user.id]
    );
    const ownedSkins = allOwnedRows.map((r) => r.SkinCode);

    // 7. Hoàn tất giao dịch (Commit)
    await connection.commit();

    return res.json({
      success: true,
      message: 'Mua trang phục thành công!',
      coins: currentUser.Coins - skin.Price,
      activeSkin: skinCode,
      ownedSkins,
    });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error('Lỗi khi rollback transaction:', rollbackErr);
      }
    }
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// Trang bị skin đã sở hữu
exports.equipSkin = async (req, res, next) => {
  try {
    const { skinCode } = req.body;
    const skin = await Skin.findByCode(skinCode);
    if (!skin) {
      return res.status(404).json({ success: false, message: 'Trang phục không tồn tại!' });
    }

    const ownedSkins = await User.getOwnedSkins(req.user.id);
    if (!ownedSkins.includes(skinCode)) {
      return res.status(403).json({ success: false, message: 'Bạn chưa sở hữu trang phục này!' });
    }

    await User.updateCurrentSkin(req.user.id, skin.SkinID);

    return res.json({
      success: true,
      message: 'Trang bị thành công!',
      activeSkin: skinCode,
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

    // Do mỗi user chỉ có duy nhất 1 dòng kỷ lục trong GAME_RESULTS nên không cần GROUP BY
    const [rows] = await db.execute(
      `SELECT USERS.UserID AS id, USERS.Username AS username,
        GAME_RESULTS.Score AS bestScore
       FROM GAME_RESULTS
       INNER JOIN USERS ON GAME_RESULTS.UserID = USERS.UserID
       WHERE USERS.IsVerified = 1
       ORDER BY GAME_RESULTS.Score DESC, GAME_RESULTS.PlayedAt ASC
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
