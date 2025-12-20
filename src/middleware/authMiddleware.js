const jwt = require("jsonwebtoken");

/**
 * AUTH MIDDLEWARE
 * Checks if user is authenticated
 */
exports.auth = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * ADMIN MIDDLEWARE
 */
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access denied",
    });
  }
  next();
};

/**
 * FARMER MIDDLEWARE
 */
exports.isFarmer = (req, res, next) => {
  if (req.user.role !== "farmer") {
    return res.status(403).json({
      success: false,
      message: "Farmer access denied",
    });
  }
  next();
};
