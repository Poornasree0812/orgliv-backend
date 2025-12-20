const DeliveryContainer = require("../models/DeliveryContainer");
const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Admin creates container and assigns orders (and optionally a delivery partner)
exports.createContainer = async (req, res) => {
  try {
    const { code, orderIds = [], assignedToPartnerId, notes, routeInfo } = req.body;

    // basic validation: check orders exist
    const orders = await Order.find({ _id: { $in: orderIds }});
    if (orders.length !== orderIds.length) {
      return res.status(400).json({ message: "Some orders not found" });
    }

    // create container
    const container = await DeliveryContainer.create({
      code,
      createdBy: req.user.id,
      assignedTo: assignedToPartnerId || null,
      orders: orderIds,
      notes,
      routeInfo
    });

    // mark orders status as 'picked_up' or 'out_for_delivery' only when picked by partner.
    // but we can set them to 'prepared_for_pickup' optionally. For now set to 'accepted' or keep current.

    res.status(201).json({ container });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List containers (admin)
exports.listContainers = async (req, res) => {
  try {
    const containers = await DeliveryContainer.find()
      .populate("assignedTo")
      .populate({ path: "orders", populate: "customer items.product" })
      .sort({ createdAt: -1 });

    res.json({ containers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add order to existing container
exports.addOrderToContainer = async (req, res) => {
  try {
    const { containerId } = req.params;
    const { orderId } = req.body;

    const container = await DeliveryContainer.findById(containerId);
    if (!container) return res.status(404).json({ message: "Container not found" });

    if (container.orders.includes(orderId)) return res.status(400).json({ message: "Order already in container" });

    container.orders.push(orderId);
    await container.save();

    res.json({ message: "Order added", container });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove order from container
exports.removeOrderFromContainer = async (req, res) => {
  try {
    const { containerId, orderId } = req.params;
    const container = await DeliveryContainer.findById(containerId);
    if (!container) return res.status(404).json({ message: "Container not found" });

    container.orders = container.orders.filter(id => String(id) !== String(orderId));
    await container.save();

    res.json({ message: "Order removed", container });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign partner to container
exports.assignPartner = async (req, res) => {
  try {
    const { containerId } = req.params;
    const { partnerId } = req.body;

    const container = await DeliveryContainer.findById(containerId);
    if (!container) return res.status(404).json({ message: "Container not found" });

    container.assignedTo = partnerId;
    await container.save();

    res.json({ message: "Partner assigned", container });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
