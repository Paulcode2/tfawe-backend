import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

export const createOrder = async (req, res, next) => {
  try {
    console.log('Order request body:', req.body); // Debug log
    console.log('User from auth:', req.user); // Debug log

    if (!req.user || !req.user.id) {
      console.error('No authenticated user found');
      return res.status(401).json({ message: "Authentication required" });
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: "Shipping address and payment method required" });
    }

    console.log('Processing items:', items); // Debug log
    let totalAmount = 0;
    const orderItems = [];

    // Validate items and calculate total
    for (const item of items) {
      console.log('Processing item:', item); // Debug log
      const product = await Product.findById(item.product);
      if (!product) {
        console.log(`Product not found: ${item.product}`); // Debug log
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image[0],
      });

      totalAmount += product.price * item.quantity;
    }

    console.log('Order items created:', orderItems); // Debug log

    // Create order
    console.log('Creating order with user:', req.user?.id); // Debug log
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "card" ? "paid" : "pending",
    });

    console.log('Order created:', order); // Debug log
    console.log('Order ID:', order?._id); // Debug log
    console.log('Order type:', typeof order); // Debug log
    console.log('Order keys:', order ? Object.keys(order) : 'No order'); // Debug log

    if (!order) {
      console.error('Order creation failed - order is null/undefined');
      return res.status(500).json({ message: "Failed to create order" });
    }

    if (!order._id) {
      console.error('Order created but missing _id:', order);
      return res.status(500).json({ message: "Order created but missing ID" });
    }

    // Deduct inventory
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    );

    console.log('Final order to send:', order); // Debug log
    console.log('Response structure:', { message: "Order created successfully", order }); // Debug log

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product");

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order belongs to user (unless admin)
    if (order.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.product");

    res.json(orders);
  } catch (err) {
    next(err);
  }
};
