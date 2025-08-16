const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  filterProductsByDescription
} = require("../controllers/productController");
const { body } = require("express-validator");
const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

// Rotas protegidas
//router.use(protect);

router.post(
  "/", protect, 
  upload.single("image"),
  [
    body("title").notEmpty().withMessage("Título obrigatório"),
    body("subtitle").notEmpty().withMessage("Subtítulo obrigatório"),
    body("price").isNumeric().withMessage("Preço inválido"),
    body("description").notEmpty().withMessage("Descrição obrigatório"),
    body("categoryId").notEmpty().withMessage("Categoria obrigatória"),
  ],
  createProduct
);

router.get("/", getProducts);
router.get("/search", filterProductsByDescription);
router.get("/:id", getProductById);
router.get("/category/:categoryId", getProductsByCategory);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id",  deleteProduct);

module.exports = router;
