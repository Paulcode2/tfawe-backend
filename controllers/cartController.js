import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity)
      return res.status(400).json({ message: "Product and quantity required" });
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity)
      return res
        .status(400)
        .json({ message: "Product unavailable or insufficient stock" });
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
    const itemIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
};
