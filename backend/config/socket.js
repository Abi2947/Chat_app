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
      const { chatId, content, sender } = msg;

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

        // Add the message
        const message = await Message.create({
          sender: sender || socket.user._id,
          chat: chatId,
          content,
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
        };

        // Send to all participants - ensure consistent string conversion
        let sentCount = 0;
        chat.participants.forEach((participantId) => {
          const participantIdStr = participantId.toString();
          console.log(` Broadcasting to participant room: ${participantIdStr}`);
          
          // Check if anyone is in this room
          const room = io.sockets.adapter.rooms.get(participantIdStr);
          const roomSize = room ? room.size : 0;
          console.log(`   Room ${participantIdStr} has ${roomSize} socket(s)`);
          
          io.to(participantIdStr).emit("receive-message", messagePayload);
          sentCount++;
        });
        
        console.log(` Message broadcasted to ${sentCount} participant(s) in chat ${chatId}`);
        
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
