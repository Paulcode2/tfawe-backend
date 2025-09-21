import Order from "../models/Order.js";
import User from "../models/User.js";

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("items.product user");
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
};
