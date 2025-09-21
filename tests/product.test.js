const request = require("supertest");
const app = require("../app.js");
const mongoose = require("mongoose");
const Product = require("../models/Product.js");
const User = require("../models/User.js");

describe("Product API", () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    const testDbUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI || "mongodb://localhost:27017/tfawe_test";
    await mongoose.connect(testDbUri.replace('/tfawe', '/tfawe_test'));

    // Clean up
    await Product.deleteMany();
    await User.deleteMany();

    // Create admin user
    const adminRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        isAdmin: true
      });

    adminToken = adminRes.body.token;

    // Create regular user
    const userRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Regular User",
        email: "user@example.com",
        password: "password123"
      });

    userToken = userRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /api/products", () => {
    beforeAll(async () => {
      // Create test products
      await Product.create([
        {
          name: "Test Product 1",
          description: "Description 1",
          price: 29.99,
          stock: 10,
          category: "Test"
        },
        {
          name: "Test Product 2",
          description: "Description 2",
          price: 39.99,
          stock: 5,
          category: "Test"
        }
      ]);
    });

    it("should get all products", async () => {
      const res = await request(app).get("/api/products");
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.total).toBe(2);
    });

    it("should filter products by category", async () => {
      const res = await request(app).get("/api/products?category=Test");
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(2);
    });

    it("should search products", async () => {
      const res = await request(app).get("/api/products?search=Product 1");
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toBe("Test Product 1");
    });

    it("should paginate products", async () => {
      const res = await request(app).get("/api/products?page=1&limit=1");
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(1);
    });
  });

  describe("POST /api/products", () => {
    it("should create product as admin", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New Product",
          description: "New Description",
          price: 49.99,
          stock: 15,
          category: "New Category"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe("New Product");
    });

    it("should not create product as regular user", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Unauthorized Product",
          price: 19.99,
          stock: 5
        });

      expect(res.statusCode).toBe(403);
    });

    it("should not create product without auth", async () => {
      const res = await request(app)
        .post("/api/products")
        .send({
          name: "No Auth Product",
          price: 19.99,
          stock: 5
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/products/:id", () => {
    let productId;

    beforeAll(async () => {
      const product = await Product.create({
        name: "Single Product",
        description: "Single Description",
        price: 19.99,
        stock: 8,
        category: "Single"
      });
      productId = product._id;
    });

    it("should get product by id", async () => {
      const res = await request(app).get(`/api/products/${productId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Single Product");
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });
  });
});