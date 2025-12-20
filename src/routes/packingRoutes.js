const express = require("express");
const router = express.Router();

const packingController = require("../controllers/packingController");
const { auth, isAdmin } = require("../middleware/auth"); // ✅ FIXED

// Container staff / admin accesses packing screen
router.get(
  "/:containerId/orders",
  auth,
  isAdmin,
  packingController.getPackingOrders
);

// Update packing status
router.put(
  "/order/:orderId/status",
  auth,
  isAdmin,
  packingController.updatePackingStatus
);

module.exports = router;
