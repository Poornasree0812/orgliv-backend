const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");

// Create Razorpay order
router.post("/create-order", auth, createOrder);

// Verify payment
router.post("/verify", auth, verifyPayment);

module.exports = router;
