const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { auth, isAdmin } = require("../middleware/auth");

router.get("/products/pending", auth, isAdmin, adminController.listPendingProducts);
router.put("/products/:id/approve", auth, isAdmin, adminController.approveProduct);
router.put("/products/:id/reject", auth, isAdmin, adminController.rejectProduct);
router.delete("/products/:id", auth, isAdmin, adminController.deleteProduct);

module.exports = router;
