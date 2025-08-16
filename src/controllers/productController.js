const Product = require("../models/Product");
const Category = require("../models/Category");
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs"); // Adicionado para exclusão de arquivos

// Criar Produto
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(", ") });
  }

  const { title, subtitle, price, description, stock, categoryId } = req.body;

  // Validação explícita
  if (!title?.trim()) {
    return res.status(400).json({ error: "O título é obrigatório" });
  }
  if (!price || price <= 0) {
    return res.status(400).json({ error: "O preço deve ser maior que zero" });
  }
  if (!categoryId) {
    return res.status(400).json({ error: "A categoria é obrigatória" });
  }
  if (stock && stock < 0) {
    return res.status(400).json({ error: "O estoque não pode ser negativo" });
  }

  try {
    // Verificar categoria
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    // Validar imagem (se fornecida)
    let image = null;
    if (req.file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Apenas imagens PNG, JPG ou JPEG são permitidas" });
      }
      image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create({
      title: title.trim(),
      subtitle: subtitle?.trim(),
      price: parseFloat(price),
      description: description?.trim(),
      stock: stock ? parseInt(stock) : 0,
      image,
      categoryId,
    });

    res.status(201).json({
      message: "Produto criado com sucesso",
      data: product,
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error.message);
    res.status(500).json({ error: "Erro interno ao criar produto" });
  }
};

// Listar Produtos
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "title")
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Produtos listados com sucesso",
      data: products,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error.message);
    res.status(500).json({ error: "Erro interno ao buscar produtos" });
  }
};

// Buscar Produto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("categoryId", "title");
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.status(200).json({
      message: "Produto encontrado",
      data: product,
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error.message);
    res.status(500).json({ error: "Erro interno ao buscar produto" });
  }
};

// Buscar Produtos por Categoria
const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "ID de categoria inválido" });
  }

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    const products = await Product.find({ categoryId, active: true }).populate("categoryId", "title");

    if (products.length === 0) {
      return res.status(404).json({ message: "Nenhum produto encontrado para essa categoria" });
    }

    res.status(200).json({
      message: "Produtos encontrados",
      data: products,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos por categoria:", error.message);
    res.status(500).json({ error: "Erro interno ao buscar produtos por categoria" });
  }
};

// Atualizar Produto
const updateProduct = async (req, res) => {
  const { title, subtitle, price, description, stock, categoryId } = req.body;

  // Validações básicas
  if (!title?.trim()) {
    return res.status(400).json({ error: "O título é obrigatório" });
  }
  if (price && price <= 0) {
    return res.status(400).json({ error: "O preço deve ser maior que zero" });
  }
  if (categoryId && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "ID de categoria inválido" });
  }
  if (stock && stock < 0) {
    return res.status(400).json({ error: "O estoque não pode ser negativo" });
  }

  try {
    // Valida se a categoria existe
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Categoria não encontrada" });
      }
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    let image;
    if (req.file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Apenas imagens PNG, JPG ou JPEG são permitidas" });
      }

      // Excluir imagem anterior se existir
      if (product.image) {
        const oldImagePath = path.join(process.cwd(), product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Definir nova imagem
      image = `/uploads/${req.file.filename}`;
    }

    const updatedData = {
      title: title?.trim(),
      subtitle: subtitle?.trim(),
      price: price ? parseFloat(price) : undefined,
      description: description?.trim(),
      stock: stock ? parseInt(stock) : undefined,
      categoryId,
      ...(image && { image }),
    };

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).populate("categoryId", "title");

    res.status(200).json({
      message: "Produto atualizado com sucesso",
      data: updated,
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error.message);
    res.status(500).json({ error: "Erro interno ao atualizar produto" });
  }
};

// Deletar Produto
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Excluir imagem, se existir
    if (product.image) {
      const imagePath = path.join(__dirname, "../uploads", product.image.split("/").pop());
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Erro ao excluir imagem:", err.message);
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Produto removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover produto:", error.message);
    res.status(500).json({ error: "Erro interno ao remover produto" });
  }
};

// Filtrar Produtos por Descrição
const filterProductsByDescription = async (req, res) => {
  try {
    const { q, categoryId } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Parâmetro de busca 'q' é obrigatório" });
    }

    const query = {};
    if (categoryId && categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      query.categoryId = categoryId;
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Categoria não encontrada" });
      }
    }

    // Divide a busca em palavras e cria um array de expressões regulares
    const keywords = q.trim().split(/\s+/).map(word => ({
      description: { $regex: word, $options: "i" },
    }));

    query.$or = keywords;

    const products = await Product.find(query).populate("categoryId", "title");

    if (products.length === 0) {
      return res.status(404).json({ message: "Nenhum produto encontrado" });
    }

    res.status(200).json({
      message: "Produtos encontrados",
      data: products,
    });
  } catch (error) {
    console.error("Erro ao filtrar produtos:", error.message);
    res.status(500).json({ error: "Erro interno ao filtrar produtos" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  filterProductsByDescription,
};