const express = require("express");
const router = express.Router();

const containerController = require("../controllers/containerController");
const { auth, isAdmin } = require("../middleware/auth");

// 🔹 PUBLIC: Find nearest container (MUST be first)
router.get(
  "/nearest",
  containerController.getNearestContainerForCoords
);

// 🔹 ADMIN: Create container
router.post(
  "/",
  auth,
  isAdmin,
  containerController.createContainer
);

// 🔹 ADMIN: List containers
router.get(
  "/",
  auth,
  isAdmin,
  containerController.listContainers
);

// 🔹 ADMIN: Container dashboard
router.get(
  "/:containerId/dashboard",
  auth,
  isAdmin,
  containerController.getContainerDashboard
);

module.exports = router;
