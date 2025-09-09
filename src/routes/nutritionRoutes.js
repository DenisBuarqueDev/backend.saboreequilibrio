const express = require("express");
const {
  getNutritionRecommendation,
} = require("../controllers/nutritionController");

const router = express.Router();

router.post("/", getNutritionRecommendation);

module.exports = router;
