const express = require('express');
const auth = require('../middleware/auth');
const gameController = require('../controllers/gameController');

const router = express.Router();

router.post('/scores', auth, gameController.submitScore);
router.get('/leaderboard', gameController.getLeaderboard);
router.post('/coins', auth, gameController.updateCoins);
router.post('/skins/buy', auth, gameController.buySkin);
router.post('/skins/equip', auth, gameController.equipSkin);

module.exports = router;
