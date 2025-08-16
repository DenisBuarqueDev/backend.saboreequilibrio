const express = require("express");
const { body } = require("express-validator");
const addressController = require("../controllers/addressController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();
// Rotas protegidas
router.use(protect);

// Validações comuns para criação/atualização de endereço
const addressValidations = [
  body("zipCode")
    .notEmpty()
    .withMessage("CEP é obrigatório")
    .isPostalCode("any")
    .withMessage("CEP inválido"),
  body("street").notEmpty().withMessage("Logradouro é obrigatório"),
  body("number").notEmpty().withMessage("Número é obrigatório"),
  body("district").notEmpty().withMessage("Bairro é obrigatório"),
  body("city").notEmpty().withMessage("Cidade é obrigatória"),
  body("state")
    .notEmpty()
    .withMessage("Estado é obrigatório")
    .isLength({ min: 2, max: 2 })
    .withMessage("Estado deve ter 2 caracteres"),
];

router.post("/", addressValidations, addressController.createAddress);
router.get("/:id", addressController.getAddressById);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);
router.get("/user/:userId", addressController.getAddressByUserId);

module.exports = router;
