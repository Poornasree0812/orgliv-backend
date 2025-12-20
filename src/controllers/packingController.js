const DeliveryContainer = require("../models/DeliveryContainer");
const Order = require("../models/Order");

// ----------------------------------------------------
// LIST ORDERS WAITING FOR PACKING IN THIS CONTAINER
// ----------------------------------------------------
exports.getPackingOrders = async (req, res) => {
  try {
    const containerId = req.params.containerId;

    const orders = await Order.find({
      assignedContainer: containerId,
      status: { $in: ["pending", "accepted", "packing", "packed"] }
    })
      .populate("items.product")
      .populate("customer");

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------
// UPDATE PACKING STATUS
// ----------------------------------------------------
exports.updatePackingStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; 
    // allowed: "packing" | "packed" | "ready_for_delivery"

    const allowed = ["packing", "packed", "ready_for_delivery"];

    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(orderId);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // update packing status
    if (status === "ready_for_delivery") {
      order.status = "packed";   // internal final state before delivery
    } else {
      order.status = status;
    }

    await order.save();

    res.json({ message: "Packing status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
