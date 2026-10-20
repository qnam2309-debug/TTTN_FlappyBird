const db = require('../config/db');
const User = require('../models/User');
const Skin = require('../models/Skin');

exports.submitScore = async (req, res, next) => {
  try {
    const { score } = req.body;
    if (!Number.isSafeInteger(score) || score < 0 || score > 2147483647) {
      return res.status(400).json({
        success: false,
        message: 'Điểm phải là số nguyên không âm hợp lệ.',
      });
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

// Cập nhật số xu trực tiếp (thêm hoặc trừ xu)
exports.updateCoins = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!Number.isInteger(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Số xu thay đổi (amount) phải là số nguyên.',
      });
    }

    await User.updateCoins(req.user.id, amount);
    const updatedUser = await User.findById(req.user.id);

    return res.json({
      success: true,
      message: 'Cập nhật xu thành công!',
      coins: updatedUser.Coins,
    });
  } catch (err) {
    next(err);
  }
};

// Mua skin bằng xu lưu vào DB MySQL
exports.buySkin = async (req, res, next) => {
  try {
    const { skinCode } = req.body;
    if (!skinCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã trang phục!' });
    }

    const skin = await Skin.findByCode(skinCode);
    if (!skin) {
      return res.status(404).json({ success: false, message: 'Trang phục không tồn tại!' });
    }

    const user = await User.findById(req.user.id);
    const ownedSkins = await User.getOwnedSkins(req.user.id);

    if (ownedSkins.includes(skinCode)) {
      return res.status(400).json({ success: false, message: 'Bạn đã sở hữu trang phục này!' });
    }

    if (user.Coins < skin.Price) {
      return res.status(400).json({
        success: false,
        message: `Không đủ xu! Cần thêm ${skin.Price - user.Coins} xu.`,
      });
    }

    // Trừ xu, thêm vào bảng sở hữu, và trang bị luôn
    await User.updateCoins(req.user.id, -skin.Price);
    await User.addOwnedSkin(req.user.id, skin.SkinID);
    await User.updateCurrentSkin(req.user.id, skin.SkinID);

    const freshUser = await User.findById(req.user.id);
    const freshOwnedSkins = await User.getOwnedSkins(req.user.id);

    return res.json({
      success: true,
      message: 'Mua trang phục thành công!',
      coins: freshUser.Coins,
      activeSkin: skinCode,
      ownedSkins: freshOwnedSkins,
    });
  } catch (err) {
    next(err);
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
