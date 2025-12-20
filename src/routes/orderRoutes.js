const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth, isFarmer } = require("../middleware/auth");

// Place order (customer)
router.post("/place", auth, orderController.placeOrder);

// Customer: get own orders
router.get("/my", auth, orderController.getMyOrders);


// Farmer: get orders that include this farmer
router.get("/farmer", auth, orderController.getOrdersForFarmer);

// Admin: get all orders
router.get("/admin", auth, orderController.getAllOrders);

// Get single order (authorized)
router.get("/:orderId", auth, orderController.getOrderById);

// Update status (admin/farmer/customer rules inside controller)
router.put("/:orderId/status", auth, orderController.updateOrderStatus);

module.exports = router;
