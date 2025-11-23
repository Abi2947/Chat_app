//backend/routes/authROutes.js

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/User");
const { register, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const registerValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("username").isLength({ min: 3 }).withMessage("Username too short"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 8 }).withMessage("Password too short"),
  body("phone").notEmpty().withMessage("Phone required"),
  body("address").notEmpty().withMessage("Address required"),
];

router.post("/register", registerValidation, register);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  login
);

router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ user });
});

router.post("/logout", logout);

module.exports = router;
