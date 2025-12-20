const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [itemSchema],

  amount: { type: Number, required: true },

  address: { type: String },
  shippingLat: Number,
  shippingLng: Number,

  status: {
    type: String,
    enum: ["pending", "accepted", "packed", "out_for_delivery", "delivered", "cancelled"],
    default: "pending"
  },

  assignedContainer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "DeliveryContainer", 
    default: null 
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
