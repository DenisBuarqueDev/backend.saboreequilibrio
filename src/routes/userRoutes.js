const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser, 
  updateUserImage,
  deleteUser,
} = require("../controllers/userController");
const { body } = require("express-validator");
const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

// Rotas protegidas
router.use(protect);

router.post(
  "/", protect, 
  upload.single("image"),
  [
    body("firstName").notEmpty().withMessage("Nome obrigatório"),
    body("lastName").notEmpty().withMessage("Sobrenome obrigatório"),
    body("phone").isNumeric().withMessage("Phone inválido"),
    body("email").notEmpty().withMessage("E-mail obrigatório"),
    body("password").notEmpty().withMessage("Senha obrigatória"),
  ],
  createUser
);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", upload.single("image"), updateUser);
router.put("/photo/:id", upload.single("image"), updateUserImage);
router.delete("/:id",  deleteUser);

module.exports = router;
