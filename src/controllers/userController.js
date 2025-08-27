const User = require("../models/User");
const { validationResult } = require("express-validator");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const { v2: cloudinary } = require("cloudinary");

// Criar Usuário
const createUser = async (req, res) => {
  // Validação dos campos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors
        .array()
        .map((e) => e.msg)
        .join(", "),
    });
  }

  const { firstName, lastName, phone, email, password } = req.body;

  try {
    // Evita duplicidade de e-mail
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "E-mail já cadastrado!" });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users"
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;

      // remover arquivo temporário
      fs.unlinkSync(req.file.path);
    }

    // Cria usuário
    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: hashedPassword,
      image: imageUrl,
      imagePublicId,
    });

    return res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Erro interno ao criar usuário!",
    });
  }
};

// Listar Usuários
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({ message: "Usuários listados com sucesso", data: users });
  } catch (err) {
    res.status(500).json({ message: "Erro interno ao buscar usuários" });
  }
};

// Buscar Usuário por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado!" });

    res.status(200).json({ message: "Usuário encontrado!", data: user });
  } catch (err) {
    res.status(500).json({ message: "Erro interno ao buscar usuário!" });
  }
};

// Atualizar dados + imagem
const updateUser = async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado!!" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    

    if (user.imagePublicId) {
      await cloudinary.uploader.destroy(user.imagePublicId);
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users"
      });
      user.image = result.secure_url;
      user.imagePublicId = result.public_id;
      fs.unlinkSync(req.file.path);
    }

    await user.save();

    res.status(200).json({
      message: "Usuário atualizado com sucesso",
      data: user.toObject(),
    });
  } catch (err) {
    res.status(500).json({ message: "Erro interno ao atualizar usuário!" });
  }
};

// Atualizar imagem do usuário
const updateUserImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado!!" });

    if (!req.file)
      return res.status(400).json({ message: "Nenhuma imagem enviada" });

    // Remove imagem antiga no Cloudinary
    if (user.imagePublicId) {
      await cloudinary.uploader.destroy(user.imagePublicId);
    }

    // Upload nova imagem
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users"
      });
      user.image = result.secure_url;
      user.imagePublicId = result.public_id;
      fs.unlinkSync(req.file.path);
    }

    await user.save();

    res.status(200).json({
      message: "Imagem do usuário atualizada com sucesso",
      data: user.toObject(),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erro interno ao atualizar imagem do usuário!" });
  }
};

// Deletar Usuário
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado!!" });

    // Exclui a imagem do Cloudinary (se existir)
    if (user.imagePublicId) {
      await cloudinary.uploader.destroy(user.imagePublicId);
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Usuário removido com sucesso" });
  } catch (err) {
    res.status(500).json({ message: "Erro interno ao remover usuário!" });
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
