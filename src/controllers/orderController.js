const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { countOrdersByStatus } = require("../utils/orderUtil.js");

const createOrder = async (req, res) => {
  const { address, payment, items } = req.body;

  // Validação dos itens
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Nenhum item no pedido" });
  }

  // Validação do endereço
  const requiredAddressFields = [
    "street",
    "number",
    "district",
    "city",
    "state",
    "zipCode",
  ];

  const missingFields = requiredAddressFields.filter(
    (field) => !address?.[field]
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Campos de endereço ausentes: ${missingFields.join(", ")}`,
      code: "MISSING_ADDRESS_FIELDS",
    });
  }

  // Validação do pagamento
  if (!["pix", "cartao", "dinheiro"].includes(payment)) {
    return res.status(400).json({
      error: "Método de pagamento inválido",
      code: "INVALID_PAYMENT",
    });
  }

  // Validação de cada item
  for (const item of items) {
    if (!item.productId || !item.qtd || item.qtd < 1) {
      return res.status(400).json({
        error: "Item inválido no pedido",
      });
    }
  }

  try {
    let totalOrder = 0;

    // Cria a ordem com endereço embutido
    const order = await Order.create({
      userId: req.user._id,
      address,
      payment,
      status: "preparando",
      amount: 0,
      items: [],
    });

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error("Produto não encontrado");

        const subtotal = product.price * item.qtd;
        totalOrder += subtotal;

        return {
          productId: product._id,
          title: product.title,
          qtd: item.qtd,
          price: product.price,
          subtotal,
          imagem: product.image, // ajuste se necessário
        };
      })
    );

    order.items = enrichedItems;
    order.amount = totalOrder;
    await order.save();

    // Atualiza contagem
    const counts = await countOrdersByStatus();
    req.io.emit("ordersCountUpdated", counts);

    // Buscar novamente o pedido já populado
    const populatedOrder = await Order.findById(order._id)
      .populate("userId", "firstName lastName phone image");

    // Emitir evento para todos os dashboards conectados
    req.io.emit("newOrder", populatedOrder);

    return res.status(201).json({ order });

  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return res.status(500).json({
      error: error.message || "Erro interno ao criar pedido",
      code: "SERVER_ERROR",
    });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verificar permissão (caso use req.params.userId)
    if (req.params.userId && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({
        error: "Acesso negado.",
      });
    }

    // Buscar pedidos com endereço populado (items não precisam de populate, são subdocs)
    const orders = await Order.find({ userId })
      .populate({
        path: "address",
        model: "Address",
        select: "street city state zipCode",
      })
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        error: "Nenhum pedido realizado.",
      });
    }

    res.status(200).json({
      message: "Pedidos encontrados com sucesso.",
      data: orders,
    });
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    res.status(500).json({
      error: "Erro interno ao buscar pedidos.",
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
};

const getOrderItems = async (req, res) => {
  try {
    const items = await OrderItem.find({ orderId: req.params.id }).populate(
      "productId",
      "price"
    );
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar itens do pedido" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.find({ _id: req.params.id });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar order!" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    // monta filtro: se status existir, usa ele; se não, traz tudo
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "firstName lastName phone image");

    res.status(200).json(orders);
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    order.status = status;
    await order.save();

    // Atualiza contagem
    const counts = await countOrdersByStatus();
    req.io.emit("ordersCountUpdated", counts);

     // Notifica todos os clientes que o status mudou
    req.io.emit("orderStatusUpdated", order);

    res.status(200).json({ message: "Status atualizado", order });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar status do pedido" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    order.status = "cancelado";
    await order.save();

    res.status(200).json({ message: "Pedido cancelado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao cancelar pedido" });
  }
};

const getOrdersCount = async (req, res) => {
  try {
    const counts = await countOrdersByStatus();
    return res.status(200).json(counts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderItems,
  updateOrderStatus,
  cancelOrder,
  getOrdersByUserId,
  getOrdersCount,
  getOrderById,
};
