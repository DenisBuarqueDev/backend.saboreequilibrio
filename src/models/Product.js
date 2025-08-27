const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    stock: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    image: { type: String }, // URL ou nome do arquivo
    imagePublicId: { type: String },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
