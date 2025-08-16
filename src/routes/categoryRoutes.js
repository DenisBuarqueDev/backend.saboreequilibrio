const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { body } = require("express-validator");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  [body("title").notEmpty().withMessage("O título é obrigatório")],
  createCategory
);
router.get("/", getCategories);
router.get("/:id", protect, getCategoryById);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

module.exports = router;
