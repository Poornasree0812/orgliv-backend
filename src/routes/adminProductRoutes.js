const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/auth");


const adminProductController = require("../controllers/adminProductController");

// Admin can manage products
router.get("/pending", auth, admin, adminProductController.getPendingProducts);
router.put("/approve/:productId", auth, admin, adminProductController.approveProduct);
router.put("/reject/:productId", auth, admin, adminProductController.rejectProduct);
router.get("/all", auth, admin, adminProductController.getAllProducts);

module.exports = router;
