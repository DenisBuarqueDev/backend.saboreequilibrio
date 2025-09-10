const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      street: { type: String, required: true },
      number: { type: String, required: true },
      district: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      complement: { type: String },
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pendente", "preparando", "entrega", "cancelado", "finalizado"],
      default: "pendente",
    },
    payment: {
      type: String,
      enum: ["pix", "cartao", "dinheiro"],
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: { type: String },
        description: { type: String },
        price: { type: Number },
        subtotal: { type: Number },
        qtd: Number,
        image: { type: String }
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);

