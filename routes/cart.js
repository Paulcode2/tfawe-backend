import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.post("/remove", authMiddleware, removeFromCart);
router.post("/clear", authMiddleware, clearCart);

export default router;
