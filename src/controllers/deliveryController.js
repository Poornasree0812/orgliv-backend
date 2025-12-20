const DeliveryPartner = require("../models/DeliveryPartner");
const DeliveryContainer = require("../models/DeliveryContainer");
const User = require("../models/User");
const Order = require("../models/Order");

// Register delivery partner (wraps existing user)
exports.registerPartner = async (req, res) => {
  try {
    const { userId, vehicle, phone } = req.body;
    // userId should refer to existing User with role 'delivery' or create user separately
    const partner = await DeliveryPartner.create({ user: userId, vehicle, phone });
    res.status(201).json({ partner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get containers assigned to partner
exports.myContainers = async (req, res) => {
  try {
    // req.user.id is the User id (JWT). find partner by user
    const partner = await DeliveryPartner.findOne({ user: req.user.id });
    if (!partner) return res.status(404).json({ message: "Partner not found" });

    const containers = await DeliveryContainer.find({ assignedTo: partner._id })
      .populate({ path: "orders", populate: { path: "items.product customer" } });

    res.json({ containers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Partner updates container status
exports.updateContainerStatus = async (req, res) => {
  try {
    const { containerId } = req.params;
    const { status } = req.body;

    const partner = await DeliveryPartner.findOne({ user: req.user.id });
    if (!partner) return res.status(404).json({ message: "Partner not found" });

    const container = await DeliveryContainer.findById(containerId).populate("orders");
    if (!container) return res.status(404).json({ message: "Container not found" });
    if (String(container.assignedTo) !== String(partner._id)) {
      return res.status(403).json({ message: "Not assigned to you" });
    }

    container.status = status;
    await container.save();

    // propagate order status updates in bulk:
    // when container moves to 'picked_up' -> set orders status to 'out_for_delivery'
    // when container moves to 'delivered' -> set orders status to 'delivered'
    const orderStatusMap = {
      picked_up: "out_for_delivery",
      enroute: "out_for_delivery",
      delivered: "delivered"
    };

    if (orderStatusMap[status]) {
      const newStatus = orderStatusMap[status];
      await Order.updateMany(
        { _id: { $in: container.orders.map(o => o._id) } },
        { $set: { status: newStatus } }
      );
    }

    res.json({ message: "Container status updated", container });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
