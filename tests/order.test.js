const request = require("supertest");
const app = require("../app.js");
const mongoose = require("mongoose");
const Order = require("../models/Order.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const Cart = require("../models/Cart.js");

describe("Order API", () => {
  let userToken;
  let productId;
  let userId;

  beforeAll(async () => {
    const testDbUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI || "mongodb://localhost:27017/tfawe_test";
    await mongoose.connect(testDbUri.replace('/tfawe', '/tfawe_test'));

    // Clean up
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();

    // Create user
    const userRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Order User",
        email: "orderuser@example.com",
        password: "password123"
      });

    userToken = userRes.body.token;
    // Extract user ID from token (simplified for testing)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "orderuser@example.com",
        password: "password123"
      });
    // For testing purposes, we'll create a user and get their ID
    const user = await User.findOne({ email: "orderuser@example.com" });
    userId = user._id;

    // Create test product
    const product = await Product.create({
      name: "Order Test Product",
      description: "For order testing",
      price: 35.99,
      stock: 15,
      category: "Test"
    });
    productId = product._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /api/orders", () => {
    it("should create order successfully", async () => {
      const orderData = {
        items: [
          {
            product: productId,
            quantity: 2
          }
        ],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country"
        },
        paymentMethod: "card"
      };

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Order created successfully");
      expect(res.body.order).toBeDefined();
      expect(res.body.order._id).toBeDefined();
      expect(res.body.order.totalAmount).toBe(71.98); // 35.99 * 2
    });

    it("should not create order without auth", async () => {
      const orderData = {
        items: [{ product: productId, quantity: 1 }],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country"
        },
        paymentMethod: "card"
      };

      const res = await request(app)
        .post("/api/orders")
        .send(orderData);

      expect(res.statusCode).toBe(401);
    });

    it("should not create order with empty cart", async () => {
      const orderData = {
        items: [],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country"
        },
        paymentMethod: "card"
      };

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("No items in order");
    });

    it("should not create order with insufficient stock", async () => {
      const lowStockProduct = await Product.create({
        name: "Low Stock Product",
        price: 10.99,
        stock: 2,
        category: "Test"
      });

      const orderData = {
        items: [
          {
            product: lowStockProduct._id,
            quantity: 5 // More than available stock
          }
        ],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country"
        },
        paymentMethod: "card"
      };

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("insufficient stock");
    });

    it("should deduct inventory after order", async () => {
      const initialStock = 15;
      const orderQuantity = 3;

      const orderData = {
        items: [
          {
            product: productId,
            quantity: orderQuantity
          }
        ],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country"
        },
        paymentMethod: "card"
      };

      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      // Check if inventory was deducted
      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct.stock).toBe(initialStock - orderQuantity);
    });
  });

  describe("GET /api/orders", () => {
    beforeAll(async () => {
      // Create a test order
      await Order.create({
        user: userId,
        items: [{
          product: productId,
          name: "Order Test Product",
          price: 35.99,
          quantity: 1
        }],
        totalAmount: 35.99,
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country"
        },
        paymentMethod: "card",
        paymentStatus: "paid"
      });
    });

    it("should get user orders", async () => {
      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should not get orders without auth", async () => {
      const res = await request(app).get("/api/orders");
      expect(res.statusCode).toBe(401);
    });
  });
});