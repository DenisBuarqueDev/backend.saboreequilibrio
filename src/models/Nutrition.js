import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema({
  age: Number,
  weight: Number,
  height: Number,
  goal: String, // emagrecer, ganhar massa, energia, etc.
  restrictions: [String], // ex: lactose, glúten, camarão
});

export default mongoose.model("Nutrition", nutritionSchema);
