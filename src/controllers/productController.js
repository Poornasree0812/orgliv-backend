// backend/src/controllers/productController.js
const Product = require("../models/Product");
const sampleImages = require("../utils/sampleImages");
const { upload } = require("../config/cloudinary");
const { findNearestContainer } = require("../utils/geo");

// ------------------------------
// ADD PRODUCT (Farmer)
// ------------------------------
exports.addProduct = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      pricePerUnit, 
      unit, 
      stockQuantity, 
      description,
      pickupLat,      // farmer's field location
      pickupLng 
    } = req.body;

    const key = category ? category.toLowerCase() : "";
    const imageUrl = sampleImages[key] || sampleImages.default;

    const product = await Product.create({
      farmerId: req.user.id,
      name,
      category,
      pricePerUnit,
      unit,
      stockQuantity,
      description,
      imageUrl,
      isApproved: false,   // waiting for admin approval
      container: null      // assigned later below
    });

    // ------------------------------
    // AUTO-ASSIGN NEAREST CONTAINER
    // ------------------------------
    if (pickupLat && pickupLng) {
      const nearest = await findNearestContainer(Number(pickupLat), Number(pickupLng));

      if (nearest && nearest.container) {
        product.container = nearest.container._id;
        await product.save();
      }
    }

    res.json({ message: "Product added", product });
  } catch (err) {
    res.status(500).json({ message: "Error adding product", error: err });
  }
};

// ------------------------------
// GET ALL APPROVED PRODUCTS
// ------------------------------
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isApproved: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error loading products", err });
  }
};

// ------------------------------
// GET PRODUCT BY ID
// ------------------------------
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error loading product", err });
  }
};

// ------------------------------
// GET FARMER'S OWN PRODUCTS
// ------------------------------
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error loading farmer products", err });
  }
};

// ------------------------------
// UPDATE PRODUCT
// ------------------------------
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Not found or unauthorized" });

    res.json({ message: "Product updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating product", err });
  }
};

// ------------------------------
// DELETE PRODUCT
// ------------------------------
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      _id: req.params.id,
      farmerId: req.user.id
    });

    if (!deleted)
      return res.status(404).json({ message: "Not found or unauthorized" });

    res.json({ message: "Product deleted", deleted });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", err });
  }
};

// ------------------------------
// UPDATE STOCK
// ------------------------------
exports.updateStock = async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id },
      { stockQuantity: req.body.stockQuantity },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Not found or unauthorized" });

    res.json({ message: "Stock updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating stock", err });
  }
};

// ------------------------------
// CUSTOMER – PRODUCT SEARCH + FILTER SYSTEM
// ------------------------------
exports.listProducts = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = {
      isApproved: true,
      stockQuantity: { $gt: 0 }
    };

    if (category) filter.category = category;

    if (search) filter.name = { $regex: search, $options: "i" };

    if (minPrice) filter.pricePerUnit = { ...(filter.pricePerUnit || {}), $gte: Number(minPrice) };
    if (maxPrice) filter.pricePerUnit = { ...(filter.pricePerUnit || {}), $lte: Number(maxPrice) };

    let sortOption = {};
    if (sort === "price_low") sortOption.pricePerUnit = 1;
    if (sort === "price_high") sortOption.pricePerUnit = -1;
    if (sort === "newest") sortOption.createdAt = -1;

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("farmerId", "name");

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
