const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const { isValidObjectId } = require("../middleware/validateObjectId");

// =========================================================
// GET OR CREATE CONVERSATION
// =========================================================

const getOrCreateConversation = async (userId, otherUserId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const otherObjectId = new mongoose.Types.ObjectId(otherUserId);

  let conversation = await Conversation.findOne({
    participants: {
      $all: [userObjectId, otherObjectId],
    },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userObjectId, otherObjectId],
    });
  }

  return conversation;
};

// =========================================================
// SEND MESSAGE
// =========================================================

const sendMessage = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const senderId = req.user._id;

    let receiverId = req.body?.receiverId;
    let text = req.body?.text;

    if (typeof receiverId === "string") {
      receiverId = receiverId.trim();
    }

    if (typeof text !== "string") {
      text = "";
    }

    text = text.trim();

    let image = "";

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    if (!isValidObjectId(String(receiverId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID",
      });
    }

    // -----------------------------------------------------
    // MESSAGE VALIDATION
    // -----------------------------------------------------

    if (!text && !image) {
      console.log("ERROR: Empty message");

      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // -----------------------------------------------------
    // SELF MESSAGE
    // -----------------------------------------------------

    if (
      senderId.toString() ===
      receiverId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    // -----------------------------------------------------
    // CHECK RECEIVER
    // -----------------------------------------------------

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // -----------------------------------------------------
    // CONVERSATION
    // -----------------------------------------------------

    const conversation =
      await getOrCreateConversation(
        senderId,
        receiverId
      );

    if (!conversation) {
      return res.status(500).json({
        success: false,
        message: "Unable to create conversation",
      });
    }

    // -----------------------------------------------------
    // CREATE MESSAGE
    // -----------------------------------------------------

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      text: text || " ",
      image: image || "",
      isRead: false,
    });

    // -----------------------------------------------------
    // UPDATE LAST MESSAGE
    // -----------------------------------------------------

    conversation.lastMessage = message._id;

    await conversation.save();

    // -----------------------------------------------------
    // POPULATE
    // -----------------------------------------------------

    const populatedMessage =
      await Message.findById(message._id)
        .populate(
          "sender",
          "name username profilePicture headline"
        )
        .populate(
          "receiver",
          "name username profilePicture headline"
        )
        .populate("conversation");

    // -----------------------------------------------------
    // SOCKET.IO
    // -----------------------------------------------------

    const io = global.io;

    if (io) {
      const receiverRoom =
        `user:${receiverId.toString()}`;

      const senderRoom =
        `user:${senderId.toString()}`;

      const conversationRoom =
        `conversation:${conversation._id.toString()}`;

      io.to(receiverRoom).emit(
        "new-message",
        populatedMessage
      );

      io.to(senderRoom).emit(
        "new-message",
        populatedMessage
      );

      io.to(conversationRoom).emit(
        "conversation-message",
        populatedMessage
      );
    }

    await createNotification({
      recipient: receiverId,
      sender: senderId,
      type: "message",
      message: `${req.user.name} sent you a message`,
      relatedId: conversation._id,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",

      data: {
        message: populatedMessage,
      },
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while sending message",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =========================================================
// GET CONVERSATIONS
// =========================================================

const getConversations = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversations =
      await Conversation.find({
        participants: req.user._id,
      })
        .populate(
          "participants",
          "name username profilePicture headline"
        )
        .populate(
          "lastMessage",
          "sender receiver text image isRead createdAt"
        )
        .sort({
          updatedAt: -1,
        });

    const result = await Promise.all(
      conversations.map(
        async (conversation) => {
          const unreadCount =
            await Message.countDocuments({
              conversation:
                conversation._id,

              receiver:
                req.user._id,

              isRead: false,
            });

          const otherParticipant =
            conversation.participants.find(
              (participant) =>
                participant &&
                participant._id.toString() !==
                  req.user._id.toString()
            );

          return {
            _id: conversation._id,

            participant:
              otherParticipant || null,

            lastMessage:
              conversation.lastMessage || null,

            unreadCount,

            updatedAt:
              conversation.updatedAt,
          };
        }
      )
    );

    return res.status(200).json({
      success: true,

      data: {
        conversations: result,
      },
    });
  } catch (error) {
    console.error(
      "GET CONVERSATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching conversations",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =========================================================
// GET MESSAGES
// =========================================================

const getMessages = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { conversationId } =
      req.params;

    // -----------------------------------------------------
    // VALIDATE ID
    // -----------------------------------------------------

    if (
      !conversationId ||
      !mongoose.Types.ObjectId.isValid(
        conversationId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // -----------------------------------------------------
    // FIND CONVERSATION
    // -----------------------------------------------------

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // -----------------------------------------------------
    // PARTICIPANT CHECK
    // -----------------------------------------------------

    const isParticipant =
      conversation.participants.some(
        (id) =>
          id.toString() ===
          req.user._id.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this conversation",
      });
    }

    // -----------------------------------------------------
    // PAGINATION
    // -----------------------------------------------------

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 50,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    // -----------------------------------------------------
    // FETCH
    // -----------------------------------------------------

    const [
      messages,
      totalMessages,
    ] = await Promise.all([
      Message.find({
        conversation:
          conversation._id,
      })
        .populate(
          "sender",
          "name username profilePicture headline"
        )
        .populate(
          "receiver",
          "name username profilePicture headline"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Message.countDocuments({
        conversation:
          conversation._id,
      }),
    ]);

    // -----------------------------------------------------
    // MARK AS READ
    // -----------------------------------------------------

    await Message.updateMany(
      {
        conversation:
          conversation._id,

        receiver:
          req.user._id,

        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    // -----------------------------------------------------
    // OLDEST -> NEWEST
    // -----------------------------------------------------

    messages.reverse();

    return res.status(200).json({
      success: true,

      data: {
        messages,

        pagination: {
          currentPage: page,

          totalPages:
            Math.ceil(
              totalMessages / limit
            ),

          totalMessages,

          limit,
        },
      },
    });
  } catch (error) {
    console.error(
      "GET MESSAGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching messages",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =========================================================
// MARK MESSAGES AS READ
// =========================================================

const markMessagesAsRead = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { conversationId } =
      req.params;

    if (
      !conversationId ||
      !mongoose.Types.ObjectId.isValid(
        conversationId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.participants.some(
        (id) =>
          id.toString() ===
          req.user._id.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this conversation",
      });
    }

    const result =
      await Message.updateMany(
        {
          conversation:
            conversation._id,

          receiver:
            req.user._id,

          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

    return res.status(200).json({
      success: true,

      message:
        "Messages marked as read",

      data: {
        modifiedCount:
          result.modifiedCount || 0,
      },
    });
  } catch (error) {
    console.error(
      "MARK MESSAGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while marking messages",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =========================================================
// GET UNREAD MESSAGE COUNT
// =========================================================

const getUnreadMessageCount = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const count =
      await Message.countDocuments({
        receiver: req.user._id,
        isRead: false,
      });

    return res.status(200).json({
      success: true,

      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    console.error(
      "UNREAD MESSAGE COUNT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching unread count",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
};