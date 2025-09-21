import Product from "../models/Product.js";

export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const count = await Product.countDocuments(filter);
    res.json({ products, total: count });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    let { name, description, price, image, stock, category } = req.body;
    if (!name || !price || stock === null || stock === undefined || stock < 0)
      return res.status(400).json({ message: "Missing required fields or invalid stock value" });
    // Ensure image is always an array
    if (image && !Array.isArray(image)) {
      image = [image];
    }
    const product = await Product.create({
      name,
      description,
      price,
      image,
      stock,
      category,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};
