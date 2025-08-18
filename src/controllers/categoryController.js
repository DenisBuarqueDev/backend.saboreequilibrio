const Category = require("../models/Category");
const { validationResult } = require("express-validator");

// Criar Categoria
const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const title = req.body.title?.trim();

  if (!title) {
    return res
      .status(400)
      .json({ error: "O título da categoria é obrigatório!" });
  }

  try {
    // Busca case-insensitive
    const exists = await Category.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (exists) {
      return res.status(400).json({ error: "Categoria já existe!" });
    }

    const category = await Category.create({ title });
    res.status(201).json({
      message: "Categoria criada com sucesso!",
      data: category,
    });
  } catch (error) {
    console.error("Erro ao criar categoria:", error.message);
    res.status(500).json({ error: "Erro ao criar categoria!" });
  }
};

// Listar Categorias
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error.message);
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
};

// Buscar Categoria por ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada!" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error.message);
    res.status(500).json({ error: "Erro ao buscar categoria!" });
  }
};

// Atualizar Categoria
const updateCategory = async (req, res) => {
  const title = req.body.title?.trim();

  if (!title) {
    return res
      .status(400)
      .json({ error: "O título da categoria é obrigatório!" });
  }

  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Categoria não encontrada!" });
    }

    res.status(200).json({
      message: "Categoria atualizada com sucesso!",
      data: updated,
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error.message);
    res.status(500).json({ error: "Erro ao atualizar categoria" });
  }
};

// Deletar Categoria
const deleteCategory = async (req, res) => {
  try {
    const removed = await Category.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: "Categoria não encontrada!" });
    }

    res.status(200).json({ message: "Categoria removida com sucesso!" });
  } catch (error) {
    console.error("Erro ao remover categoria:", error.message);
    res.status(500).json({ error: "Erro ao remover categoria!" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
