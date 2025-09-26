import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import cors from "cors";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for dev and production frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // "https://tfawe-frontend.onrender.com",
      "https://tfawe-revamp.vercel.app",
    ],
    credentials: true,
  })
);

// Serve uploaded images
app.use("/uploads", express.static("public/uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Error handler
app.use(errorHandler);

export default app;
