const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./src/config/db");

// ROUTES (ONLY EXISTING & STABLE)
const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const farmerRoutes = require("./src/routes/FarmerRoutes");
const adminOrderRoutes = require("./src/routes/adminOrderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const farmerAdminRoutes = require("./src/routes/farmerAdminRoutes");

// NEW MODULES (CONFIRMED WORKING)
const containerRoutes = require("./src/routes/containerRoutes");
const packingRoutes = require("./src/routes/packingRoutes");

const app = express();

// -------------------- MIDDLEWARE --------------------


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://frolicking-manatee-8887d2.netlify.app" ,
      "https://orgliv.netlify.app"
    ],
    credentials: true,
  })
);

// 👇 VERY IMPORTANT (preflight support)
app.options("*", cors());

connectDB();

app.use(express.json());



// -------------------- TEST ROUTE --------------------
app.get("/", (req, res) => {
  res.send("OrgLiv API is running...");
});

// -------------------- ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/payments", paymentRoutes); // Razorpay optional (COD works)
app.use("/api/farmer-admin", farmerAdminRoutes);

// Container-based model
app.use("/api/container", containerRoutes);
app.use("/api/packing", packingRoutes);

// -------------------- FUTURE MODULES (DISABLED) --------------------
// These files DO NOT EXIST YET – keep them commented
// app.use("/api/deliverypartner", require("./src/routes/deliveryPartnerRoutes"));
// app.use("/api/admin/products", require("./src/routes/adminProductRoutes"));

// -------------------- SERVER START --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
