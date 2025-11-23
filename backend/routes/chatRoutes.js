//backend/routes/chatRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createPrivate,
  listsUsersChats,
  getMessages,
} = require("../controllers/chatController");

router.use(protect);

router.post("/create", createPrivate);
router.get("/", listsUsersChats);
router.get("/:id/messages", getMessages);

module.exports = router;
