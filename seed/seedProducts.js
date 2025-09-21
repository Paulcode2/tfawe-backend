import mongoose from "mongoose";
import Product from "../models/Product.js";
import dotenv from "dotenv";
dotenv.config();

const seedProducts = [
  {
    name: "Classic Sunglasses",
    description: "Timeless design, UV protection.",
    price: 49.99,
    image: ["/uploads/Dark eye wear.jpg"],
    stock: 20,
    category: "Eyewear",
    accessories: true,
  },
  {
    name: "Modern Aviators",
    description: "Trendy aviator style sunglasses.",
    price: 59.99,
    image: ["/uploads/Tfawe prod 2.jpg"],
    stock: 15,
    category: "Eyewear",
    accessories: false,
  },
  {
    name: "Sport Shades",
    description: "Durable and lightweight for active use.",
    price: 39.99,
    image: ["/uploads/Tfawe prod 3.jpg"],
    stock: 30,
    category: "Eyewear",
    accessories: false,
  },
  {
    name: "Brown Double Breasted Suits",
    description: "Brown Double Breasted Suits",
    price: 220,
    stock: 10,
    category: "Suits",
    subCategory: "Topwear",
    bestseller: true,
    image: ["/uploads/TFAWE 1.jpg"],
  },
  {
    name: "White Double Breasted Suit",
    description: "White double breasted suit",
    price: 140,
    stock: 10,
    category: "Suits",
    subCategory: "Topwear",
    bestseller: true,
    image: ["/uploads/TFAWE 2.png"],
  },
  {
    name: "Peak Lapel Breasted Suit",
    description: "Peak Lapel double breasted suit",
    price: 120,
    stock: 10,
    category: "Suits",
    subCategory: "Topwear",
    bestseller: true,
    image: ["/uploads/TFAWE 3.jpg"],
  },
  {
    name: "Black Double Breasted Suit",
    description: "Black double breasted suit",
    price: 150,
    stock: 10,
    category: "Suits",
    subCategory: "Topwear",
    bestseller: true,
    image: ["/uploads/Tfawe prod 2.jpg"],
  },
  {
    name: "Double Breasted Suit",
    description: "Double Breasted Suit",
    price: 100,
    image: [
      "/uploads/TFAWE 1.jpg",
      "/uploads/TFAWE 2.png",
      "/uploads/TFAWE 3.jpg",
      "/uploads/Tfawe prod 2.jpg",
      "/uploads/Tfawe prod 4.jpg",
    ],
    stock: 10,
    category: "Suits",
    subCategory: "Topwear",
    bestseller: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(seedProducts);
    console.log("Seed data inserted successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
