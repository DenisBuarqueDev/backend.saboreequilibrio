const express = require("express");
const {
  getMessagesByOrder,
  createMessage,
  countMessagesByOrder,
} = require("../controllers/messageController");

const router = express.Router();

router.get("/:orderId", getMessagesByOrder);
router.post("/:orderId", createMessage);
router.get("/count/:orderId", countMessagesByOrder);

module.exports = router;
