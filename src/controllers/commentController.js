const Comment = require('../models/Comment');

// Criar um novo comentário
const createComment = async (req, res) => {
  const { commentary, productId } = req.body;

  if (!commentary) return res.status(400).json({ error: 'Comentário é obrigatório' });

  try {
    const comment = await Comment.create({
      userId: req.user._id,
      productId,
      commentary,
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
};

// Buscar comentários de um produto
const getCommentsByProduct = async (req, res) => {
  try {
    const comments = await Comment.find({ productId: req.params.id })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
};

// Permitir que QUALQUER USUÁRIO AUTENTICADO exclua um comentário
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });

    await comment.deleteOne();
    res.status(200).json({ message: 'Comentário excluído' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir comentário' });
  }
};

module.exports = { createComment, getCommentsByProduct, deleteComment };
