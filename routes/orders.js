import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

// User routes
router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);

// Admin routes
router.get("/admin/all", adminMiddleware, getAllOrders);
router.put("/:id/status", adminMiddleware, updateOrderStatus);

export default router;
