const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["farmer", "customer", "admin"],
      default: "customer",
    },

    // ⭐ New: Farmers must be approved by admin before uploading products
    isVerified: {
      type: Boolean,
      default: function () {
        return this.role === "farmer" ? false : true;
      },
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
