const Product = require("../models/Product");

// GET ALL PENDING PRODUCTS
exports.getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isApproved: false });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// APPROVE PRODUCT
exports.approveProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const updated = await Product.findByIdAndUpdate(
      productId,
      { isApproved: true, status: "approved", rejectionReason: "" },
      { new: true }
    );

    res.json({ message: "Product approved", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REJECT PRODUCT
exports.rejectProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { reason } = req.body;

    const updated = await Product.findByIdAndUpdate(
      productId,
      { isApproved: false, status: "rejected", rejectionReason: reason },
      { new: true }
    );

    res.json({ message: "Product rejected", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("farmerId", "name email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
