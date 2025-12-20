const Order = require("../models/Order");
const Product = require("../models/Product");

// -------------------------------
// PLACE ORDER (CUSTOMER)
// -------------------------------
exports.placeOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { items, address, shippingLat, shippingLng } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    let orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product || !product.isApproved) {
        return res.status(400).json({ message: "Invalid product" });
      }

      if (product.stockQuantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      // reduce stock
      product.stockQuantity -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.pricePerUnit,
        farmer: product.farmerId,
      });

      totalAmount += product.pricePerUnit * item.quantity;
    }

    const order = await Order.create({
      customer: customerId,
      items: orderItems,
      amount: totalAmount,
      address,
      shippingLat,
      shippingLng,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("placeOrder error:", err);
    res.status(500).json({ message: "Order placement failed" });
  }
};

// -------------------------------
// CUSTOMER – MY ORDERS
// -------------------------------
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate("items.product", "name imageUrl")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders" });
  }
};

// -------------------------------
// FARMER – ORDERS
// -------------------------------
exports.getOrdersForFarmer = async (req, res) => {
  try {
    const orders = await Order.find({ "items.farmer": req.user.id })
      .populate("customer", "name email")
      .populate("items.product", "name imageUrl")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to load farmer orders" });
  }
};

// -------------------------------
// ADMIN – ALL ORDERS
// -------------------------------
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders" });
  }
};

// -------------------------------
// UPDATE ORDER STATUS
// -------------------------------
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "accepted",
      "packed",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Authorization
    if (
      req.user.role !== "admin" &&
      req.user.role !== "farmer" &&
      String(order.customer) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
};

// -------------------------------
// GET ORDER BY ID
// -------------------------------
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customer", "name email")
      .populate("items.product", "name imageUrl");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== "admin" &&
      String(order.customer._id) !== String(req.user.id) &&
      !order.items.some(i => String(i.farmer) === String(req.user.id))
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to load order" });
  }
};
