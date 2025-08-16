const express = require('express');
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderItems,
  updateOrderStatus,
  cancelOrder,
  getOrdersByUserId,
} = require('../controllers/orderController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/me', getUserOrders);
router.get('/user', getOrdersByUserId);
router.get('/admin', getAllOrders); // futura proteção por perfil
router.get('/:id/items', getOrderItems);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
