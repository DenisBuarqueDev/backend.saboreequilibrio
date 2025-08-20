const express = require("express");
const { register, login, logoutUser, getCurrentUser, getUserById } = require("../controllers/authController");
const { body } = require("express-validator");
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("O nome é obrigatório"),
    body("lastName").notEmpty().withMessage("O sobrenome é obrigatório"),
    body("email").isEmail().withMessage("E-mail inválido"),
    body("phone").notEmpty().withMessage("Telefone obrigatório"),
    body("password").isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
  ],
  register
);

router.get("/:id", protect, getUserById);
router.get("/me", protect, getCurrentUser);
router.post("/logout", logoutUser);

router.post("/login", login);

module.exports = router;
