const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "O primeiro nome é obrigatório"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "O sobrenome é obrigatório"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "O telefone é obrigatório"],
    },
    email: {
      type: String,
      required: [true, "O e-mail é obrigatório"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "E-mail inválido"],
    },
    password: {
      type: String,
      required: [true, "A senha é obrigatória"],
      minlength: 6,
    },
    image: { type: String },
  },
  { timestamps: true }
);

// Hash da senha antes de salvar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
