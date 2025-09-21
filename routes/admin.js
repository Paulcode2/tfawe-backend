import express from "express";
import { getAllUsers } from "../controllers/adminController.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { createProduct, updateProduct, deleteProduct, getProducts } from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authMiddleware, adminMiddleware);

// Order management
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// User management
router.get("/users", getAllUsers);

// Product management
router.get("/products", getProducts);
router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", upload.single("image"), updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
