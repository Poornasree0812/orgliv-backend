// backend/src/scripts/migrateProductsStatus.js
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const res = await Product.updateMany({ status: { $exists: false }}, { $set: { status: "approved" }});
  console.log("Updated:", res.nModified || res.modifiedCount);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
