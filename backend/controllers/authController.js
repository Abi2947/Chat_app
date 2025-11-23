// backend/controllers/authController.js
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => e.msg),
    });
  }

  const { firstName, lastName, username, email, password, phone, address } =
    req.body;

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
    phone,
    address,
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    accessToken,
    user: {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    },
  });
});

module.exports = { register, login };

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.json({ message: "Visit again" });
});

module.exports = { register, login, logout };
