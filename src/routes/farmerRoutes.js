const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth, isFarmer , isVerifiedFarmer} = require("../middleware/auth");

// ⭐ GET FARMER INCOME + STATS
router.get("/stats", auth, isFarmer, async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Get all products created by this farmer
    const products = await Product.find({ farmerId });

    // Extract product IDs
    const productIds = products.map((p) => p._id.toString());

    // Fetch all orders that include this farmer's products
    const orders = await Order.find({
      "items.productId": { $in: productIds }
    });

    router.get("/monthly-income", auth, isFarmer, async (req, res) => {
  try {
    const farmerId = req.user.id;

    const products = await Product.find({ farmerId }).select("_id");
    const productIds = products.map((p) => p._id.toString());

    if (productIds.length === 0) return res.json([]);

    const pipeline = [
      { $match: { "items.productId": { $in: productIds } } },
      { $unwind: "$items" },
      { $match: { "items.productId": { $in: productIds } } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          },
          income: {
            $sum: { $multiply: ["$items.pricePerUnit", "$items.quantity"] },
          },
        },
      },
      { $sort: { "_id.month": 1 } }
    ];

    const agg = await Order.aggregate(pipeline);
    const result = agg.map((r) => ({ month: r._id.month, income: r.income }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching monthly income", err });
  }
});

    let totalIncome = 0;
    let totalOrders = 0;
    let totalItemsSold = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.productId && productIds.includes(item.productId)) {
          totalIncome += item.pricePerUnit * item.quantity;
          totalItemsSold += item.quantity;
        }
      });
      totalOrders++;
    });

    res.json({
      totalIncome,
      totalOrders,
      totalItemsSold,
      totalProducts: products.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching farmer stats", err });
  }
});

// ⭐ GET FARMER ORDERS (INLINE LOGIC)
router.get("/orders", auth, isFarmer, async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Get farmer products
    const products = await Product.find({ farmerId }).select("_id");
    const productIds = products.map((p) => p._id.toString());

    // Get orders containing these products
    const orders = await Order.find({
      "items.productId": { $in: productIds }
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching farmer orders", err });
  }
});

// ⭐ UPDATE ORDER STATUS (FARMER SIDE)
router.put("/orders/:orderId/status", auth, isFarmer, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Error updating order status", err });
  }
});


module.exports = router;
