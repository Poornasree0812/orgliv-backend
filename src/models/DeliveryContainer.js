const mongoose = require("mongoose");

const containerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g., CON-20251212-001
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin/ops user id
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner" }, // delivery partner assigned
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }], // orders grouped inside
  status: {
    type: String,
    enum: ["created", "picked_up", "enroute", "delivered", "cancelled"],
    default: "created"
  },
  routeInfo: { type: Object }, // optional: route metadata, ETA, stops
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("DeliveryContainer", containerSchema);
