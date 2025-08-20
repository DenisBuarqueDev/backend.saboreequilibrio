const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// 🔐 Gerar token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { firstName, lastName, phone, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Usuário já existe!" });

    const user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      password,
    });

    const token = generateToken(user._id);

    // 🧠 Definir o cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(201).json({
      message: "Cadastro realizado com sucesso! Redirecionando...",
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
      },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};

// 🔐 Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await User.findOne({ email });
    if (!data)
      return res.status(404).json({ message: "Usuário não encontrado!" });

    const isMatch = await data.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Usuário não encontrado!" });

    const token = generateToken(data._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(200).json({
      message: "Login realizado com sucesso!",
      user: {
        id: data._id,
        name: data.firstName,
        email: data.email,
      },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro no login" });
  }
};

// 🙋 Obter usuário atual (usando middleware para decodificar token)
const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar usuário" });
  }
};

// 🚪 Logout
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  return res.status(200).json({ message: "Logout realizado com sucesso" });
};

// Buscar dados do usuário pelo ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password"); // Não retorna a senha
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar usuário" });
  }
};

module.exports = { register, login, logoutUser, getCurrentUser, getUserById };
