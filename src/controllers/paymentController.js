// controllers/paymentController.js
const mercadopago = require("../config/mercadoPago");

const createPayment = async (req, res) => {
  try {
    const { items, userId } = req.body;

    const preference = {
      items: items.map(item => ({
        title: item.name,
        unit_price: Number(item.price),
        quantity: item.quantity,
        currency_id: "BRL",
      })),
      back_urls: {
        success: "https://seusite.com/pagamento-sucesso", // send for http://localhost:5173/orders
        failure: "https://seusite.com/pagamento-falha", // send for http://localhost:5173/checkout
        pending: "https://seusite.com/pagamento-pendente", // send for http://localhost:5173/checkout
      },
      auto_return: "approved",
      notification_url: "https://seusite.com/api/webhook/mp", // webhooks
      metadata: {
        userId,
      },
    };

    const response = await mercadopago.preferences.create(preference);

    return res.status(200).json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
};

module.exports = { createPayment };
