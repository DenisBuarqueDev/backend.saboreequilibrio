const express = require("express");
const router = express.Router();
const { createPreference } = require("../controllers/mercadoPagoController");

router.post("/create-preference", createPreference);

module.exports = router;
