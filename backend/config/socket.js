// backend/config/socket.js

const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

module.exports = (io) => {
  // AUTHENTICATE SOCKET
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return next(new Error("Auth missing"));

    try {
      const user = await User.findById(userId).select("-password");
      if (!user) return next(new Error("Invalid User"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Auth failed"));
    }
  });

  // HELPER: Send updated online users list to ALL clients
  const updateOnlineUsers = () => {
    const onlineUserIds = Array.from(io.sockets.sockets.values())
      .map((s) => s.user?._id?.toString())
      .filter(Boolean);

    io.emit("online-users", onlineUserIds); // Send to everyone
  };

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    console.log(`${socket.user.username} connected (socket ID: ${socket.id}, userId: ${userId})`);
    
    // Automatically join user to their personal room on connection
    // This ensures they can receive messages immediately
    socket.join(userId);
    console.log(`User ${socket.user.username} joined room: ${userId}`);
    
    // Also join to a room with the socket ID for debugging
    socket.join(socket.id);

    // JOIN CHAT ROOM - User joins a specific chat room
    socket.on("join-chat", async (chatId, callback) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          if (callback) callback("Chat not found");
          return;
        }

        // Verify user is a participant
        const isParticipant = chat.participants.some(
          (p) => p.toString() === userId
        );

        if (!isParticipant) {
          if (callback) callback("Not authorized to join this chat");
          return;
        }

        // Join the chat room
        socket.join(chatId.toString());
        console.log(`User ${socket.user.username} joined chat room: ${chatId}`);
        
        if (callback) callback(null);
      } catch (err) {
        console.error("Join chat error:", err);
        if (callback) callback(err.message || "Failed to join chat");
      }
    });

    // LEAVE CHAT ROOM
    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId.toString());
      console.log(`User ${socket.user.username} left chat room: ${chatId}`);
    });

    // USER GOES ONLINE
    socket.on("user-online", (userIdParam) => {
      const userIdStr = userIdParam?.toString() || userId;
      socket.join(userIdStr); // Join personal room (ensure string)
      console.log(`User ${socket.user.username} confirmed online in room: ${userIdStr}`);
      updateOnlineUsers(); // Broadcast updated list
    });

    // USER GOES OFFLINE
    socket.on("user-offline", (userId) => {
      socket.leave(userId.toString());
      updateOnlineUsers();
    });

    // SEND MESSAGE
    socket.on("send-message", async (msg, callback) => {
      const {
        chatId,
        content,
        sender,
        messageType = "text",
        fileUrl,
        fileName,
      } = msg;

      console.log(`Message received from ${socket.user.username}:`, {
        chatId,
        content: content?.substring(0, 50),
        sender: sender || socket.user._id,
      });

      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.error("Chat not found:", chatId);
          if (callback) callback("Chat not found");
          return;
        }

        // Verify sender is a participant
        const senderId = (sender || socket.user._id).toString();
        const isParticipant = chat.participants.some(
          (p) => p.toString() === senderId
        );
        
        if (!isParticipant) {
          console.error(" User is not a participant in this chat");
          if (callback) callback("Not authorized");
          return;
        }

        if (messageType !== "text" && !fileUrl) {
          if (callback) callback("Attachment missing");
          return;
        }

        if (!content && messageType === "text") {
          if (callback) callback("Message content required");
          return;
        }

        // Add the message
        // const senderId = sender || socket.user._id;

        const message = await Message.create({
          sender: senderId,
          chat: chatId,
          content: content || "",
          messageType,
          fileUrl,
          fileName,
          readBy: [
            {
              user: senderId,
              readAt: new Date(),
            },
          ],
        });

        // Populate sender for sending to clients
        await message.populate("sender", "username");

        //Update chat's latestMessage
        chat.latestMessage = message._id;
        await chat.save();

        // Clean payload for frontend
        const messagePayload = {
          _id: message._id,
          content: message.content,
          sender: {
            _id: message.sender._id,
            username: message.sender.username,
          },
          chatId,
          createdAt: message.createdAt,
          messageType: message.messageType,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
        };

        // Send to chat room (all participants in the chat room will receive it)
        // Also send to individual user rooms as fallback
        const chatIdStr = chatId.toString();
        
        // Emit to chat room (most efficient for group chats)
        io.to(chatIdStr).emit("receive-message", messagePayload);
        
        // Also emit to individual participant rooms as fallback
        chat.participants.forEach((participantId) => {
          const participantIdStr = participantId.toString();
          io.to(participantIdStr).emit("receive-message", messagePayload);
        });
        
        console.log(` Message broadcasted to chat room ${chatIdStr} and ${chat.participants.length} participant(s)`);
        
        // Acknowledge to sender - Socket.io callbacks: first arg is error (null for success)
        if (callback) callback(null);
      } catch (err) {
        console.error(" Message error:", err);
        // Socket.io callbacks: pass error message as first argument
        if (callback) callback(err.message || "Failed to send message");
      }
    });

    // SOCKET DISCONNECT
    socket.on("disconnect", () => {
      console.log(`${socket.user.username} disconnected`);
      updateOnlineUsers(); // Update list when someone leaves
    });

    // Send initial online list when user connects
    updateOnlineUsers();
  });
};
