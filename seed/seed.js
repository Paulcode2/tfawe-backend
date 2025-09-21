import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

dotenv.config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const data = JSON.parse(
      fs.readFileSync(path.resolve("seed/products.json"))
    );
    await Product.deleteMany();
    await Product.insertMany(data);
    console.log("Products seeded");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedProducts();
