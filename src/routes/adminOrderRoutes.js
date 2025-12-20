const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

const { auth, isAdmin } = require("../middleware/auth");


// ⭐ GET ALL ORDERS
router.get("/", auth, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", err });
  }
});

// ⭐ UPDATE ORDER STATUS
router.put("/update-status/:id", auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ message: "Order status updated", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: "Error updating status", err });
  }
});

module.exports = router;
