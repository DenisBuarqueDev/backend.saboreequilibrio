const express = require('express');
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderItems,
  updateOrderStatus,
  cancelOrder,
  getOrdersByUserId, 
  getOrdersCount, 
  getOrderById
} = require('../controllers/orderController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/me', getUserOrders);
router.get('/user', getOrdersByUserId);
router.get('/admin', getAllOrders); 
router.get('/:id/items', getOrderItems);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);
router.get("/countstatus", getOrdersCount);
router.get('/:id', getOrderById);

module.exports = router;
