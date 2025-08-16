const mercadopago = require("mercadopago");
const Order = require("../models/Order"); // ou onde está seu model de pedidos

const handleWebhook = async (req, res) => {
  try {
    const paymentId = req.body?.data?.id;
    const topic = req.body?.type;

    if (topic !== "payment" || !paymentId) {
      return res.sendStatus(200);
    }

    // Busca detalhes do pagamento no Mercado Pago
    const payment = await mercadopago.payment.findById(paymentId);
    const { status, metadata } = payment.body;

    // Só cria pedido se aprovado
    if (status === "approved") {
      const items = JSON.parse(metadata.items);
      const userId = metadata.userId;

      // Verifica se o pedido já existe (evita duplicação)
      const existingOrder = await Order.findOne({ "payment.id": paymentId });
      if (existingOrder) return res.sendStatus(200);

      // Cria a Order
      const order = new Order({
        user: userId,
        items: items,
        total: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        payment: {
          id: paymentId,
          status: status,
        },
        status: "Aprovado",
      });

      await order.save();
    }

    res.sendStatus(200); // Sempre responder 200
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.sendStatus(500);
  }
};

module.exports = {
  handleWebhook,
};
