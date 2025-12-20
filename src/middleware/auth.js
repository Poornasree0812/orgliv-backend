const jwt = require("jsonwebtoken");

// -------------------------------
// AUTH CHECK
// -------------------------------
const auth = (req, res, next) => {
  try {
    const header = req.header("Authorization");
    if (!header) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role, isVerified }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// -------------------------------
// ROLE CHECKS
// -------------------------------
const isFarmer = (req, res, next) => {
  if (req.user.role !== "farmer") {
    return res.status(403).json({ message: "Farmer access only" });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

const isVerifiedFarmer = (req, res, next) => {
  if (req.user.role !== "farmer") {
    return res.status(403).json({ message: "Not a farmer" });
  }
  if (!req.user.isVerified) {
    return res.status(401).json({ message: "Farmer not verified" });
  }
  next();
};

module.exports = {
  auth,
  isFarmer,
  isAdmin,
  isVerifiedFarmer,
};
