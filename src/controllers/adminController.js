// backend/src/controllers/adminController.js
const Product = require("../models/Product");
const { deleteImage } = require("../config/cloudinary"); // optional

// ---------------------------------
// LIST PENDING PRODUCTS
// ---------------------------------
exports.listPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "pending" })
      .populate("farmerId", "name email");

    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------------
// APPROVE PRODUCT
// ---------------------------------
exports.approveProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    product.status = "approved";
    product.isApproved = true;        // ⭐ IMPORTANT
    product.rejectionReason = "";

    await product.save();

    res.json({ message: "Product approved", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------------
// REJECT PRODUCT
// ---------------------------------
exports.rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    product.status = "rejected";
    product.isApproved = false;       // ⭐ IMPORTANT
    product.rejectionReason = reason || "Rejected by admin";

    await product.save();

    res.json({ message: "Product rejected", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------------
// DELETE PRODUCT (ADMIN HARD DELETE)
// ---------------------------------
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // Optional: delete images from Cloudinary
    if (product.images && product.images.length) {
      for (const img of product.images) {
        if (img.public_id) {
          try {
            await deleteImage(img.public_id);
          } catch (e) {
            // ignore cloudinary failure
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
