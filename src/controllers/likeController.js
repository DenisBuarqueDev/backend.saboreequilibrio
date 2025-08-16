const Like = require('../models/Like');

const toggleLike = async (req, res) => {
  const { productId } = req.body;

  try {
    const existing = await Like.findOne({
      userId: req.user._id,
      productId,
    });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ liked: false });
    }

    await Like.create({
      userId: req.user._id,
      productId,
    });

    res.status(201).json({ liked: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar like' });
  }
};

const getLikesByProduct = async (req, res) => {
  try {
    const likes = await Like.find({ productId: req.params.id });
    res.status(200).json({ total: likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar likes' });
  }
};

module.exports = { toggleLike, getLikesByProduct };
