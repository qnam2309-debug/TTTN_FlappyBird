const express = require('express');
const auth = require('../middleware/auth');
const gameController = require('../controllers/gameController');

const router = express.Router();

router.post('/scores', auth, gameController.submitScore);
router.get('/leaderboard', gameController.getLeaderboard);

module.exports = router;
