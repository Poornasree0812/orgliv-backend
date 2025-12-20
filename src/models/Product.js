const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },       // updated
  description: { type: String, default: "" },

  pricePerUnit: { type: Number, required: true },           // updated
  unit: { type: String, default: "kg" },

  stockQuantity: { type: Number, default: 0 },              // updated field name

  category: { type: String, default: "general" },
  organic: { type: Boolean, default: true },

  imageUrl: { type: String },                               // from sampleImages

  images: [
    {
      url: String,
      public_id: String
    }
  ],

  farmerId: {                                               // updated
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  active: { type: Boolean, default: true },

  // nearest container assignment
  container: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryContainer", default: null },

  // admin approval fields
  isApproved: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  rejectionReason: { type: String, default: "" },

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
