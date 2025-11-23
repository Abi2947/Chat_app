// backend/models/Chat.js

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      trim: true,
      // Required only for group chats
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Only for group chats
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,

  }
);
/* This code snippet is defining a virtual property called `lastMessagePreview` on the `chatSchema`
schema in Mongoose. This virtual property is a getter function that calculates and returns a preview
of the last message in the chat. */
chatSchema.virtual("lastMessagePreview").get(function () {
  if (!this.latestMessage) return null;
  const msg = this.messages[this.messages.length - 1];
  if (!msg) return null;

  if (msg.messageType === "text") return msg.content;
  if (msg.messageType === "image") return "Photo";
  if (msg.messageType === "file") return msg.fileName || "File";
  return "System message";
});

/* This method `getUnreadCount` defined on the `chatSchema` in Mongoose is used to calculate the number
of unread messages in a chat for a specific user.  */
chatSchema.methods.getUnreadCount = function (userId) {
  if (!this.latestMessage) return 0;
  const lastMsg = this.messages[this.messages.length - 1];
  if (!lastMsg) return 0;

  const readEntry = lastMsg.readBy.find(
    (r) => r.user.toString() === userId.toString()
  );
  return readEntry ? 0 : 1; // Simplified: only counts if latest message is unread
};

/* This `chatSchema.pre("save", function (next) { ... })` middleware function in the Mongoose schema is
a pre-save hook that runs before saving a `Chat` document to the database. */
chatSchema.pre("save", function (next) {
  if (this.isGroupChat) {
    if (!this.name || this.name.trim() === "") {
      return next(new Error("Group chat must have a name"));
    }
    if (!this.groupAdmin) {
      return next(new Error("Group chat must have an admin"));
    }
  } else {
    // For 1-on-1: ensure exactly 2 participants
    if (this.participants.length !== 2) {
      return next(new Error("Private chat must have exactly 2 participants"));
    }
    this.name = null;
    this.groupAdmin = null;
  }
  next();
});

/* This `chatSchema.statics.findPrivateChat` method is a static method defined on the Mongoose schema
`chatSchema`. It is used to find or create a private chat between two users based on their user IDs
(`user1Id` and `user2Id`). */
chatSchema.statics.findPrivateChat = async function (user1Id, user2Id) {
  // const participants = [user1Id, user2Id].map((id) => id.toString()).sort();
  let chat = await this.findOne({
    isGroupChat: false,
    // participants: { $all: participants, $size: participants.length },
    participants:{$all: [user1Id,user2Id], $size:2},
  });

  if (!chat) {
    chat = await this.create({
      participants: [user1Id, user2Id],
      isGroupChat: false,
    });
    chat.isNew = true;
  } else {
    chat.isNew = false;
  }

  return chat;
};

/* This `chatSchema.methods.addMessage` method is a custom instance method defined on the Mongoose
schema `chatSchema`. It is used to add a new message to the chat instance. */
chatSchema.methods.addMessage = async function (messageData) {
  const message = {
    ...messageData,
    readBy: [{ user: messageData.sender, readAt: new Date() }], // sender has read
  };

  this.messages.push(message);
  this.latestMessage = this.messages[this.messages.length - 1]._id;
  await this.save();

  return message;
};

module.exports = mongoose.model("Chat", chatSchema);
