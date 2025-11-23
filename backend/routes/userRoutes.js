//backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const User = require("../models/User");
const {
  getDashboard,
  getAll,
  getOne,
  updateOne,
  deleteOne,
} = require("../controllers/userController");

router.use(protect);
router.get("/dashboard", getDashboard);
router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id", updateOne);
router.delete("/:id", admin, deleteOne);

// GET ALL USERS (for online list)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find().select("username _id firstName lastName");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
