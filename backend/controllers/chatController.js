// backend/constrollers/chatController.js

const asyncHandler = require("express-async-handler");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");

// POST /chat/create (protected)
const createPrivate = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const user1Id = req.user._id;

  console.log("createPrivate Called:", user1Id, "->", recipientId);

  if (!recipientId) {
    return res.status(400).json({ message: "Recipient ID required" });
  }

  if (recipientId === user1Id.toString()) {
    return res.status(400).json({ message: "Cannot chat with yourself" });
  }

  try {
    // Use the static method from Chat model
    // const chat = await Chat.findPrivateChat(user1Id.toString(), recipientId);
    const chat = await Chat.findPrivateChat(user1Id, recipientId);

    if (!chat) {
      return res.status(500).json({ message: "Failed to create chat" });
    }

    await chat.populate("participants", "username");

    res.status(chat.isNew ? 201 : 200).json(chat);
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET  /chat/ protected (lists of users chats)
const listsUsersChats = asyncHandler(async (req, res) => {
  const user1Id = req.user._id;

  const chats = await Chat.find({ participants: user1Id })
    .populate("participants", "username")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "username",
      },
    })
    .sort({ updatedAt: -1 });

  res.json(chats);
});

//GET /chat/:id/messages (protected)
const getMessages = asyncHandler(async (req, res) => {
  const chatId = res.params.id;
  const messages = await Message.find({ chat: chatId })
    .populate("sender", "username")
    .sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = { createPrivate, listsUsersChats, getMessages };
