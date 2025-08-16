const express = require('express');
const {
  createComment,
  getCommentsByProduct,
  deleteComment,
} = require('../controllers/commentController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createComment);
router.get('/:id', getCommentsByProduct); // id do produto
router.delete('/:id', protect, deleteComment);

module.exports = router;
