//backend/routes/chatRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createPrivate,
  listsUsersChats,
  getMessages,
  createGroup,
  addParticipants,
  removeParticipant,
  markChatRead,
} = require("../controllers/chatController");

router.use(protect);

// Private chat routes
router.post("/create", createPrivate);

// Group chat routes
router.post("/create-group", createGroup);
router.put("/:id/add-participants", addParticipants);
router.put("/:id/remove-participant", removeParticipant);

// General chat routes
router.get("/", listsUsersChats);
router.post("/:id/read", markChatRead);
router.get("/:id/messages", getMessages);

module.exports = router;
