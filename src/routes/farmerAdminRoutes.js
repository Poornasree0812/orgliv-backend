const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { auth, isAdmin } = require("../middleware/auth");


// Get all farmers
router.get("/farmers", auth, isAdmin, async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" }).select("-password");
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching farmers", err });
  }
});

// Approve farmer
router.put("/approve/:id", auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isVerified: true });
    res.json({ message: "Farmer Approved" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed", err });
  }
});

// Reject farmer (unverify)
router.put("/reject/:id", auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isVerified: false });
    res.json({ message: "Farmer Rejected" });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed", err });
  }
});

module.exports = router;
