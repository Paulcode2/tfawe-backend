import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: [{ type: String }],
    stock: { type: Number, required: true, min: 0 },
    category: { type: String },
    subCategory: { type: String },
    accessories: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
