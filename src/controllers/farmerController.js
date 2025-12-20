const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");

// REGISTER FARMER
exports.registerFarmer = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const farmer = await User.create({
      name,
      email,
      password: hashed,
      phone,
      address,
      role: "farmer",
    });

    const token = jwt.sign(
      { id: farmer._id, role: farmer.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Farmer registered successfully",
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        address: farmer.address,
        role: farmer.role,
      },
      token,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET FARMER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const farmer = await User.findById(req.user.id).select("-password");
    res.json({ farmer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE FARMER PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    delete updates.role;
    delete updates.password;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated", updated });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.farmer": req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ensure this farmer is part of the order
    const isFarmerOrder = order.items.some(
      (item) => item.farmer.toString() === req.user.id
    );

    if (!isFarmerOrder)
      return res.status(403).json({ message: "Not your order" });

    // update status
    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

