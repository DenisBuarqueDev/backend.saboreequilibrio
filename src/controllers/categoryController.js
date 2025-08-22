const Category = require("../models/Category");
const { validationResult } = require("express-validator");

// Criar Categoria
const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const title = req.body.title?.trim();

  if (!title) {
    return res
      .status(400)
      .json({ message: "O título da categoria é obrigatório!" });
  }

  try {
    // Busca case-insensitive
    const exists = await Category.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (exists) {
      return res.status(400).json({ message: "Categoria já existe!" });
    }

    const category = await Category.create({ title });
    res.status(201).json({
      message: "Categoria criada com sucesso!",
      data: category,
    });
  } catch (err) {
    console.error("Erro ao criar categoria:", err.message);
    res.status(500).json({ message: "Erro ao criar categoria!" });
  }
};

// Listar Categorias
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ data: categories });
  } catch (err) {
    console.error("Erro ao buscar categorias:", err.message);
    res.status(500).json({ message: "Erro ao buscar categorias" });
  }
};

// Buscar Categoria por ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada!" });
    }
    res.status(200).json(category);
  } catch (err) {
    console.error("Erro ao buscar categoria:", err.message);
    res.status(500).json({ message: "Erro ao buscar categoria!" });
  }
};

// Atualizar Categoria
const updateCategory = async (req, res) => {
  const title = req.body.title?.trim();

  if (!title) {
    return res
      .status(400)
      .json({ message: "O título da categoria é obrigatório!" });
  }

  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Categoria não encontrada!" });
    }

    res.status(200).json({
      message: "Categoria atualizada com sucesso!",
      data: updated,
    });
  } catch (err) {
    console.error("Erro ao atualizar categoria:", err.message);
    res.status(500).json({ message: "Erro ao atualizar categoria" });
  }
};

// Deletar Categoria
const deleteCategory = async (req, res) => {
  try {
    const removed = await Category.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: "Categoria não encontrada!" });
    }

    res.status(200).json({ message: "Categoria removida com sucesso!" });
  } catch (err) {
    console.error("Erro ao remover categoria:", err.message);
    res.status(500).json({ message: "Erro ao remover categoria!" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
