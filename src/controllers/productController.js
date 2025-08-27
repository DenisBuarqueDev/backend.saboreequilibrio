const Product = require("../models/Product");
const Category = require("../models/Category");
const { validationResult } = require("express-validator");
const fs = require("fs"); // Adicionado para exclusão de arquivos
const { v2: cloudinary } = require("cloudinary");

// Criar Produto
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors
        .array()
        .map((e) => e.msg)
        .join(", "),
    });
  }

  const { title, subtitle, price, description, stock, categoryId } = req.body;

  // Validação explícita
  if (!title?.trim()) {
    return res.status(400).json({ message: "O título é obrigatório!" });
  }
  if (!price || price <= 0) {
    return res
      .status(400)
      .json({ message: "O preço deve ser maior que zero!" });
  }
  if (!categoryId) {
    return res.status(400).json({ message: "A categoria é obrigatória!" });
  }
  if (stock && stock < 0) {
    return res
      .status(400)
      .json({ message: "O estoque não pode ser negativo!" });
  }

  try {
    // Verificar categoria
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada!" });
    }

    // Validar imagem (se fornecida)
    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;

      // remover arquivo temporário
      fs.unlinkSync(req.file.path);
    }

    const product = await Product.create({
      title: title.trim(),
      subtitle: subtitle?.trim(),
      price: parseFloat(price),
      description: description?.trim(),
      stock: stock ? parseInt(stock) : 0,
      image: imageUrl,
      imagePublicId,
      categoryId,
    });

    res.status(201).json({
      message: "Produto criado com sucesso!",
      data: product,
    });
  } catch (err) {
    console.error("Erro ao criar produto:", err.message);
    res.status(500).json({ message: "Erro interno ao criar produto!" });
  }
};

// Listar Produtos
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "title")
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Produtos listados com sucesso!",
      data: products,
    });
  } catch (err) {
    console.error("Erro ao buscar produtos:", err.message);
    res.status(500).json({ message: "Erro interno ao buscar produtos" });
  }
};

// Buscar Produto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categoryId",
      "title"
    );
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.status(200).json({
      message: "Produto encontrado",
      data: product,
    });
  } catch (err) {
    console.error("Erro ao buscar produto:", err.message);
    res.status(500).json({ message: "Erro interno ao buscar produto" });
  }
};

// Buscar Produtos por Categoria
const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "ID de categoria inválido!" });
  }

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada!" });
    }

    const products = await Product.find({ categoryId, active: true }).populate(
      "categoryId",
      "title"
    );

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum produto encontrado para essa categoria!" });
    }

    res.status(200).json({
      message: "Produtos encontrados!",
      data: products,
    });
  } catch (err) {
    console.error("Erro ao buscar produtos por categoria:", err.message);
    res
      .status(500)
      .json({ message: "Erro interno ao buscar produtos por categoria" });
  }
};

// Atualizar Produto
const updateProduct = async (req, res) => {
  const { title, subtitle, price, description, stock, categoryId } = req.body;

  // Validações básicas
  if (!title?.trim()) {
    return res.status(400).json({ message: "O título é obrigatório!" });
  }
  if (price && price <= 0) {
    return res
      .status(400)
      .json({ message: "O preço deve ser maior que zero!" });
  }
  if (categoryId && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "ID de categoria inválido!" });
  }
  if (stock && stock < 0) {
    return res
      .status(400)
      .json({ message: "O estoque não pode ser negativo!" });
  }

  try {
    // Valida se a categoria existe
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada!" });
      }
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado!" });
    }

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      product.image = result.secure_url;
      product.imagePublicId = result.public_id;
      fs.unlinkSync(req.file.path);
    }

    const updatedData = {
      title: title?.trim(),
      subtitle: subtitle?.trim(),
      price: price ? parseFloat(price) : undefined,
      description: description?.trim(),
      stock: stock ? parseInt(stock) : undefined,
      categoryId,
      imagePublicId: product.imagePublicId,
      image: product.image,
    };

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).populate("categoryId", "title");

    res.status(200).json({
      message: "Produto atualizado com sucesso!",
      data: updated,
    });
  } catch (err) {
    console.error("Erro ao atualizar produto:", err.message);
    res.status(500).json({ message: "Erro interno ao atualizar produto!" });
  }
};

// Deletar Produto
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado!" });
    }

    // Excluir imagem, se existir
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Produto removido com sucesso!" });
  } catch (err) {
    console.error("Erro ao remover produto:", err.message);
    res.status(500).json({ message: "Erro interno ao remover produto!" });
  }
};

// Filtrar Produtos por Descrição
const filterProductsByDescription = async (req, res) => {
  try {
    const { q, categoryId } = req.query;

    if (!q || q.trim() === "") {
      return res
        .status(400)
        .json({ message: "Parâmetro de busca 'q' é obrigatório!" });
    }

    const query = {};
    if (categoryId && categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      query.categoryId = categoryId;
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada!" });
      }
    }

    // Divide a busca em palavras e cria um array de expressões regulares
    const keywords = q
      .trim()
      .split(/\s+/)
      .map((word) => ({
        description: { $regex: word, $options: "i" },
      }));

    query.$or = keywords;

    const products = await Product.find(query).populate("categoryId", "title");

    if (products.length === 0) {
      return res.status(404).json({ message: "Nenhum produto encontrado!" });
    }

    res.status(200).json({
      message: "Produtos encontrados",
      data: products,
    });
  } catch (err) {
    console.error("Erro ao filtrar produtos:", err.message);
    res.status(500).json({ message: "Erro interno ao filtrar produtos" });
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
