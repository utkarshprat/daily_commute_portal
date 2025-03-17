const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getRoute,
  saveCommuteHistory,
  getCommuteHistory,
  getStats,
} = require('../controllers/commuteController');

// POST /api/commute/route - fetch route info from Google Maps
router.post('/route', authMiddleware, getRoute);

// POST /api/commute/history - save commute info to DB
router.post('/history', authMiddleware, saveCommuteHistory);

// GET /api/commute/history - get commute history for logged-in user
router.get('/history', authMiddleware, getCommuteHistory);

// GET /api/commute/stats - get user's total distance, average time, etc.
router.get('/stats', authMiddleware, getStats);

module.exports = router;
