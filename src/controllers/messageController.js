// controllers/messageController.js
const Message = require("../models/Message");

const getMessagesByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const messages = await Message.find({ orderId })
      .populate("userId", "firstName image")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
};

const createMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { text, sender, userId } = req.body;

    // validações básicas
    if (!orderId) {
      return res.status(400).json({ error: "ID do pedido é obrigatório." });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "A mensagem não pode ser vazia." });
    }
    if (!sender) {
      return res.status(400).json({ error: "O campo sender é obrigatório." });
    }

    // cria a mensagem
    const message = await Message.create({
      orderId,
      text: text.trim(),
      sender,
      userId,
    });
    const populatedMessage = await message.populate(
      "userId",
      "firstName lastName image"
    );

    // emite para a sala correta via socket.io (se estiver configurado)
    if (req.io) {
      req.io.to(orderId).emit("newMessage", populatedMessage);
    }

    // 2) avisos direcionados
    if (sender === "user") {
      // avisa o admin (global)
      req.io.emit("notifyAdmin", {
        orderId: String(orderId),
        message: populatedMessage,
      });
    } else if (sender === "admin") {
      // avisa o usuário — envia para a sala do pedido (usuário normalmente está nessa sala)
       req.io.emit("notifyUser", {
        orderId: String(orderId),
        message: populatedMessage,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Mensagem enviada com sucesso!",
      data: message,
    });
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    return res.status(500).json({ error: "Erro interno ao enviar mensagem." });
  }
};

const countMessagesByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "ID da ordem é obrigatório." });
    }

    const totalMessages = await Message.countDocuments({ orderId });

    return res.status(200).json({
      success: true,
      orderId,
      totalMessages,
    });
  } catch (error) {
    console.error("Erro ao contar mensagens:", error);
    return res.status(500).json({ error: "Erro interno ao contar mensagens" });
  }
};

module.exports = {
  getMessagesByOrder,
  createMessage,
  countMessagesByOrder,
};
