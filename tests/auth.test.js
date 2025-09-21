const request = require("supertest");
const app = require("../app.js");
const mongoose = require("mongoose");
const User = require("../models/User.js");

describe("Auth API", () => {
  beforeAll(async () => {
    const testDbUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI || "mongodb://localhost:27017/tfawe_test";
    await mongoose.connect(testDbUri.replace('/tfawe', '/tfawe_test'));
    await User.deleteMany();
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should signup a new user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "test@example.com", password: "password123" });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User created");
  });

  it("should not signup with existing email", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({ email: "test2@example.com", password: "password123" });
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "test2@example.com", password: "password123" });
    expect(res.statusCode).toBe(409);
  });

  it("should login with correct credentials", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({ email: "test3@example.com", password: "password123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test3@example.com", password: "password123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should not login with wrong password", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({ email: "test4@example.com", password: "password123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test4@example.com", password: "wrongpass" });
    expect(res.statusCode).toBe(401);
  });

  it("should not login with non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nouser@example.com", password: "password123" });
    expect(res.statusCode).toBe(401);
  });
});
