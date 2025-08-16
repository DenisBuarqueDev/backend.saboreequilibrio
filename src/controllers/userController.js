const User = require("../models/User");
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// Função auxiliar para validar imagem
const validateImage = (file) => {
  if (!file) return null;
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Apenas imagens PNG, JPG ou JPEG são permitidas");
  }
  return `/uploads/${file.filename}`;
};

// Criar Usuário
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors
        .array()
        .map((e) => e.msg)
        .join(", "),
    });
  }

  const { firstName, lastName, phone, email, password } = req.body;

  try {
    // Evita duplicidade de email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const image = req.file ? validateImage(req.file) : null;

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: hashedPassword,
      image,
    });

    res
      .status(201)
      .json({ message: "Usuário criado com sucesso", data: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Erro interno ao criar usuário" });
  }
};

// Listar Usuários
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({ message: "Usuários listados com sucesso", data: users });
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao buscar usuários" });
  }
};

// Buscar Usuário por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.status(200).json({ message: "Usuário encontrado", data: user });
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao buscar usuário" });
  }
};

// Atualizar Usuário
const updateUser = async (req, res) => {
  const { firstName, lastName, phone, email, password, imagem } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    let image;
    if (req.file) {
      image = validateImage(req.file);

      // Se existir imagem anterior, exclui do servidor
      if (user.image) {
        const fs = require("fs");
        const path = require("path");

        const oldImagePath = path.join(__dirname, "..", "uploads", user.image);

        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("Erro ao excluir imagem antiga:", err);
          }
        });
      }
    }

    let updatedData = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      ...(image && { image }),
    };

    if (password?.trim()) {
      updatedData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Usuário atualizado com sucesso",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Erro interno ao atualizar usuário",
    });
  }
};

const updateUserImage = async (req, res) => {
  try {
    // Verifica se veio arquivo na requisição
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }

    // Busca usuário pelo ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Valida a nova imagem
    const image = validateImage(req.file);

    // Se houver imagem anterior, exclui do servidor
    if (user.image) {
      const oldImagePath = path.join(__dirname, "..", "uploads", user.image);

      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Erro ao excluir imagem antiga:", err);
        }
      });
    }

    // Atualiza somente o campo "image"
    user.image = image;
    await user.save();

    res.status(200).json({
      message: "Imagem do usuário atualizada com sucesso",
      data: { image: user.image },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Erro interno ao atualizar imagem",
    });
  }
};

// Deletar Usuário
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    if (user.image) {
      const imagePath = path.join(
        __dirname,
        "../uploads",
        path.basename(user.image)
      );
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT")
          console.error("Erro ao excluir imagem:", err.message);
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao remover usuário" });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserImage,
  deleteUser,
};
