const Address = require("../models/Address");
const User = require("../models/User");
const mongoose = require("mongoose");

// Criar endereço
const createAddress = async (req, res) => {
  try {
    // Verificar autenticação
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    const userId = req.user.id;

    // Validar req.body
    const { zipCode, street, number, district, complement, city, state } =
      req.body; // Ajuste conforme o schema
    if (!zipCode || !street || !number || !district || !city || !state) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    // Criar endereço
    const address = new Address({ ...req.body, userId });
    const saved = await address.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Erro ao criar endereço:", err);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Dados inválidos", details: err.errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: "Endereço duplicado." });
    }
    res.status(500).json({ error: "Erro ao criar endereço." });
  }
};

// Buscar Produto por ID
const getAddressById = async (req, res) => {
  const { id } = req.params;

  // Validação do ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido!" });
  }

  try {
    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({ error: "Endereço não encontrado!" });
    }

    return res.status(200).json({
      message: "Endereço encontrado!",
      data: address,
    });
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);

    return res.status(500).json({
      error: "Erro interno ao buscar endereço!",
    });
  }
};

const getAddressByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validar se userId foi fornecido
    if (!userId) {
      return res.status(400).json({
        error: "ID do usuário é obrigatório.",
      });
    }

    // Opcional: Validar se userId é um ObjectId válido (se usar MongoDB)
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "ID do usuário inválido.",
      });
    }

    // Buscar endereços associados ao userId
    const addresses = await Address.find({ userId });

    // Verificar se foram encontrados endereços
    if (!addresses || addresses.length === 0) {
      return res.status(404).json({
        message: "Nenhum endereço cadastrado.",
      });
    }

    // Retornar os endereços encontrados
    return res.status(200).json({
      data: addresses,
      message: "Endereços encontrados com sucesso.",
    });
  } catch (err) {
    console.error(`Erro ao buscar endereços do usuário:`, err);
    return res.status(500).json({
      message: "Erro interno ao buscar endereços.",
    });
  }
};

// Buscar todos os endereços do usuário
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ userId });
    res.status(200).json(addresses);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar endereços." });
  }
};

// Atualizar endereço
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ error: "Endereço não encontrado." });
    }

    Object.assign(address, req.body);
    const updated = await address.save();
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar endereço." });
  }
};

// Deletar endereço
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ error: "Endereço não encontrado." });
    }

    res.status(200).json({ message: "Endereço removido com sucesso." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover endereço." });
  }
};

module.exports = {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
  getAddressByUserId,
  getAddressById,
};
