const { mercadopago, Preference } = require("../config/mercadoPago");

const createPreference = async (req, res) => {
  try {
    const { items, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Nenhum item no pedido." });
    }

    const formattedItems = items.map((item) => {
      //const price = parseFloat(item.price);
      const quantity = parseInt(item.qtd || 1);

      if (isNaN(quantity)) {
        throw new Error("Quantidade inválido.");
      }

      return {
        title: item.title,
        unit_price: 30,
        quantity: item.qtd || 1,
        currency_id: "BRL",
      };
    });

    const preference = new Preference(mercadopago);

    const result = await preference.create({
      body: {
        items: formattedItems,
        back_urls: {
          success: "https://www.google.com",
          failure: "http://localhost:5173/cart",
          pending: "http://localhost:5173/checkout",
        },
        auto_return: "approved",
        notification_url: `http://localhost:5000/api/webhook/mp`,
        metadata: {
          userId: userId,
          items: JSON.stringify(items),
        },
      },
    });

    res.status(200).json({ id: result.id });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência de pagamento." });
  }
};

module.exports = {
  createPreference,
};
