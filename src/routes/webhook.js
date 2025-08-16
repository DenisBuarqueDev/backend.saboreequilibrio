// routes/webhook.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const mercadopago = require("../config/mercadoPago");

router.post("/mp", async (req, res) => {
  try {
    const paymentId = req.body.data.id;
    const topic = req.body.type;

    if (topic !== "payment") return res.sendStatus(200);

    const payment = await mercadopago.payment.findById(paymentId);
    const status = payment.body.status;
    const userId = payment.body.metadata.userId;
    const items = payment.body.additional_info.items;

    if (status === "approved") {
      // Criar a order no MongoDB
      const order = new Order({
        user: userId,
        items: items.map((item) => ({
          name: item.title,
          price: item.unit_price,
          quantity: item.quantity,
        })),
        paymentStatus: status,
        createdAt: new Date(),
      });

      await order.save();
      console.log("Pedido criado com sucesso");
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook do MP:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
