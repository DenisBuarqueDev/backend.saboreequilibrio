const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getNutritionRecommendation = async (req, res) => {
  try {
    const { age, weight, height, goal, restrictions } = req.body;

    // pega as saladas disponíveis
    const salads = await Product.find()
      .populate("categoryId", "title")
      .sort({ createdAt: 1 });

    const saladList = salads
      .map((s) => `${s.title} - ${s.description}`)
      .join("\n");

    const prompt = `
      Você é um nutricionista virtual.
      Avalie o seguinte usuário:
      - Idade: ${age} anos
      - Peso: ${weight} kg
      - Altura: ${height} cm
      - Objetivo: ${goal || "nenhuma"} 
      - Restrições: ${restrictions || "nenhuma"}

      Aqui está a lista de saladas disponíveis no cardápio:
      ${saladList}

      Escolha a melhor salada para esse usuário, levando em conta os objetivos e restrições.
      Explique brevemente sua escolha.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    res.json({
      recommendation: result.response.text(),
    });
  } catch (err) {
    console.error("Erro IA:", err.message);
    res.status(500).json({ error: "Erro ao gerar recomendação nutricional" });
  }
};

module.exports = {
  getNutritionRecommendation,
};
