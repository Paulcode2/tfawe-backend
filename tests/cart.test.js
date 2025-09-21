const request = require("supertest");
const app = require("../app.js");
const mongoose = require("mongoose");
const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");

describe("Cart API", () => {
  let userToken;
  let productId;

  beforeAll(async () => {
    const testDbUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI || "mongodb://localhost:27017/tfawe_test";
    await mongoose.connect(testDbUri.replace('/tfawe', '/tfawe_test'));

    // Clean up
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Create user
    const userRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "cartuser@example.com",
        password: "password123"
      });

    userToken = userRes.body.token;

    // Create test product
    const product = await Product.create({
      name: "Cart Test Product",
      description: "For cart testing",
      price: 25.99,
      stock: 20,
      category: "Test"
    });
    productId = product._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /api/cart/add", () => {
    it("should add item to cart", async () => {
      const res = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].product).toBe(productId.toString());
      expect(res.body.items[0].quantity).toBe(2);
    });

    it("should not add item without auth", async () => {
      const res = await request(app)
        .post("/api/cart/add")
        .send({
          productId: productId,
          quantity: 1
        });

      expect(res.statusCode).toBe(401);
    });

    it("should not add out of stock item", async () => {
      const outOfStockProduct = await Product.create({
        name: "Out of Stock",
        price: 10.99,
        stock: 0,
        category: "Test"
      });

      const res = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: outOfStockProduct._id,
          quantity: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("insufficient stock");
    });
  });

  describe("GET /api/cart", () => {
    it("should get user cart", async () => {
      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toBeDefined();
    });

    it("should not get cart without auth", async () => {
      const res = await request(app).get("/api/cart");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /api/cart/remove", () => {
    it("should remove item from cart", async () => {
      // First add an item
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 1
        });

      // Then remove it
      const res = await request(app)
        .post("/api/cart/remove")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });
  });

  describe("POST /api/cart/clear", () => {
    it("should clear cart", async () => {
      // Add items first
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 3
        });

      // Clear cart
      const res = await request(app)
        .post("/api/cart/clear")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });
  });
});