
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { auth, isFarmer, isVerifiedFarmer } = require("../middleware/auth");

router.post("/", auth, isFarmer, isVerifiedFarmer, productController.addProduct);
router.get("/", productController.getProducts);

module.exports = router;
