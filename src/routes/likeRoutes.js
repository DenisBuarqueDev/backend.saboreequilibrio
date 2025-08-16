const express = require('express');
const { toggleLike, getLikesByProduct } = require('../controllers/likeController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, toggleLike);
router.get('/:id', getLikesByProduct); // id do produto

module.exports = router;
