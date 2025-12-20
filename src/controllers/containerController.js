// backend/src/controllers/containerController.js

const DeliveryContainer = require("../models/DeliveryContainer");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { findNearestContainer } = require("../utils/geo");

// ---------------- CREATE CONTAINER ----------------
const createContainer = async (req, res) => {
  try {
    const { code, name, lat, lng, radiusKm, notes } = req.body;

    const existing = await DeliveryContainer.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Container code already exists" });
    }

    const container = await DeliveryContainer.create({
      code,
      name,
      lat,
      lng,
      radiusKm: radiusKm || 25,
      notes,
      createdBy: req.user.id,
    });

    res.status(201).json({ container });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- LIST CONTAINERS ----------------
const listContainers = async (req, res) => {
  try {
    const containers = await DeliveryContainer.find().sort({ createdAt: -1 });
    res.json({ containers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- CONTAINER DASHBOARD ----------------
const getContainerDashboard = async (req, res) => {
  try {
    const { containerId } = req.params;

    const container = await DeliveryContainer.findById(containerId);
    if (!container) {
      return res.status(404).json({ message: "Container not found" });
    }

    const inventory = await Product.find({ container: containerId }).populate(
      "farmer",
      "name"
    );

    const orders = await Order.find({ assignedContainer: containerId });

    res.json({ container, inventory, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- NEAREST CONTAINER ----------------
const getNearestContainerForCoords = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng required" });
    }

    const result = await findNearestContainer(Number(lat), Number(lng));

    if (!result) {
      return res.json({ container: null });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- EXPORTS (THIS IS THE KEY) ----------------
module.exports = {
  createContainer,
  listContainers,
  getContainerDashboard,
  getNearestContainerForCoords, // ⭐ THIS WAS MISSING / BROKEN
};
