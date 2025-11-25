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

  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        readBy: { $not: { $elemMatch: { user: user1Id } } },
      });

      return {
        ...chat.toObject(),
        unreadCount,
      };
    })
  );

  res.json(chatsWithUnread);
});

//GET /chat/:id/messages (protected)
const getMessages = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const isParticipant = chat.participants.some(
    (p) => p.toString() === userId.toString()
  );

  if (!isParticipant) {
    return res.status(403).json({ message: "Not authorized to view this chat" });
  }

  await Message.updateMany(
    {
      chat: chatId,
      readBy: { $not: { $elemMatch: { user: userId } } },
    },
    {
      $push: { readBy: { user: userId, readAt: new Date() } },
    }
  );

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "username")
    .sort({ createdAt: 1 });

  res.json(messages);
});

// POST /chat/:id/read (protected)
const markChatRead = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const isParticipant = chat.participants.some(
    (p) => p.toString() === userId.toString()
  );

  if (!isParticipant) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await Message.updateMany(
    {
      chat: chatId,
      readBy: { $not: { $elemMatch: { user: userId } } },
    },
    {
      $push: { readBy: { user: userId, readAt: new Date() } },
    }
  );

  res.json({ success: true });
});

// POST /chat/create-group (protected) - Create group chat
const createGroup = asyncHandler(async (req, res) => {
  const { name, participantIds } = req.body;
  const adminId = req.user._id;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Group name is required" });
  }

  if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 1) {
    return res.status(400).json({ message: "At least one participant is required" });
  }

  // Ensure admin is included in participants
  const allParticipants = [adminId, ...participantIds];
  const uniqueParticipants = [...new Set(allParticipants.map(id => id.toString()))];

  // Verify all participant IDs are valid users
  const users = await User.find({ _id: { $in: uniqueParticipants } });
  if (users.length !== uniqueParticipants.length) {
    return res.status(400).json({ message: "One or more participant IDs are invalid" });
  }

  try {
    const chat = await Chat.create({
      isGroupChat: true,
      name: name.trim(),
      groupAdmin: adminId,
      participants: uniqueParticipants,
    });

    await chat.populate("participants", "username");
    await chat.populate("groupAdmin", "username");

    res.status(201).json(chat);
  } catch (error) {
    console.error("Create group chat error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /chat/:id/add-participants (protected) - Add participants to group chat
const addParticipants = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const { participantIds } = req.body;
  const userId = req.user._id;

  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json({ message: "At least one participant ID is required" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  if (!chat.isGroupChat) {
    return res.status(400).json({ message: "Can only add participants to group chats" });
  }

  // Verify user is the admin
  if (chat.groupAdmin.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Only group admin can add participants" });
  }

  // Verify participant IDs are valid users
  const users = await User.find({ _id: { $in: participantIds } });
  if (users.length !== participantIds.length) {
    return res.status(400).json({ message: "One or more participant IDs are invalid" });
  }

  // Add new participants (avoid duplicates)
  const existingParticipantIds = chat.participants.map(p => p.toString());
  const newParticipants = participantIds.filter(
    id => !existingParticipantIds.includes(id.toString())
  );

  if (newParticipants.length === 0) {
    return res.status(400).json({ message: "All participants are already in the group" });
  }

  chat.participants.push(...newParticipants);
  await chat.save();

  await chat.populate("participants", "username");
  await chat.populate("groupAdmin", "username");

  res.json(chat);
});

// PUT /chat/:id/remove-participant (protected) - Remove participant from group chat
const removeParticipant = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const { participantId } = req.body;
  const userId = req.user._id;

  if (!participantId) {
    return res.status(400).json({ message: "Participant ID is required" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  if (!chat.isGroupChat) {
    return res.status(400).json({ message: "Can only remove participants from group chats" });
  }

  // Verify user is the admin or removing themselves
  const isAdmin = chat.groupAdmin.toString() === userId.toString();
  const isRemovingSelf = participantId.toString() === userId.toString();

  if (!isAdmin && !isRemovingSelf) {
    return res.status(403).json({ message: "Not authorized to remove this participant" });
  }

  // Cannot remove the admin
  if (chat.groupAdmin.toString() === participantId.toString()) {
    return res.status(400).json({ message: "Cannot remove group admin" });
  }

  chat.participants = chat.participants.filter(
    p => p.toString() !== participantId.toString()
  );

  await chat.save();

  await chat.populate("participants", "username");
  await chat.populate("groupAdmin", "username");

  res.json(chat);
});

module.exports = { 
  createPrivate, 
  listsUsersChats, 
  getMessages,
  markChatRead,
  createGroup,
  addParticipants,
  removeParticipant
};
