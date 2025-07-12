const express = require('express');
const router = express.Router();
const { addAddress, deleteAddress, getPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/portfolio - Get user's portfolio
router.get('/', protect, getPortfolio);

// POST /api/portfolio/address - Add new address
router.post('/address', protect, addAddress);

// DELETE /api/portfolio/address/:id - Remove address
router.delete('/address/:id', protect, deleteAddress);

module.exports = router;