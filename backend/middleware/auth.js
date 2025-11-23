// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

/**
 * Protect routes using ACCESS TOKEN (short-lived)
 * Token must be sent in: Authorization: Bearer <access_token>
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2. If no token, reject
  if (!token) {
    return res.status(401).json({
      message: "Not authorized, Access denied",
    });
  }

  try {
    // 3. Verify access token (7 min expiry)
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 4. Attach user to request
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    // 5. Handle expired or invalid token
    //req.originalHandler = next;
    res.status(401).json({ message: "Not authorized, token failed" });
  }
});

/**
 * Admin-only access
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

module.exports = { protect, admin };
