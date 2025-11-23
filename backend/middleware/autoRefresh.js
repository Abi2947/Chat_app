// backend/middleware/autoRefresh.js
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/generateToken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  if (res.headersSent) return next();

  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return next();

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error();

    const newAccess = generateAccessToken(user._id);
    res.cookie("accessToken", newAccess, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });
    req.user = user;
  } catch (err) {
    // ignore – just continue without refreshed token
  }
  next();
};
