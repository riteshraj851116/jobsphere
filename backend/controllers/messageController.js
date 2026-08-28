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
    // -----------------------------------------------------
    // AUTH CHECK
    // -----------------------------------------------------

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const senderId = req.user._id;

    let receiverId = req.body?.receiverId;
    let text =
      typeof req.body?.text === "string"
        ? req.body.text.trim()
        : "";

    // -----------------------------------------------------
    // IMAGE
    // -----------------------------------------------------

    let image = "";

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // -----------------------------------------------------
    // RECEIVER VALIDATION
    // -----------------------------------------------------

    if (typeof receiverId === "string") {
      receiverId = receiverId.trim();
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
    // EMPTY MESSAGE CHECK
    // -----------------------------------------------------

    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // -----------------------------------------------------
    // SELF MESSAGE CHECK
    // -----------------------------------------------------

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    // -----------------------------------------------------
    // CHECK RECEIVER
    // -----------------------------------------------------

    const receiver = await User.findById(receiverId).select(
      "_id name username profilePicture headline"
    );

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // -----------------------------------------------------
    // GET OR CREATE CONVERSATION
    // -----------------------------------------------------

    const conversation =
      await getOrCreateConversation(
        senderId,
        receiverId
      );

    // -----------------------------------------------------
    // CREATE MESSAGE
    // -----------------------------------------------------

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      text,
      image,
      isRead: false,
    });

    // -----------------------------------------------------
    // UPDATE CONVERSATION
    // -----------------------------------------------------

    conversation.lastMessage = message._id;

    await conversation.save();

    // -----------------------------------------------------
    // POPULATE MESSAGE
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
        .populate({
          path: "conversation",
          populate: {
            path: "participants",
            select:
              "name username profilePicture headline",
          },
        });

    // -----------------------------------------------------
    // SOCKET.IO
    // -----------------------------------------------------

    const io = global.io;

    if (io) {
      const receiverRoom =
        `user:${String(receiverId)}`;

      const senderRoom =
        `user:${String(senderId)}`;

      const conversationRoom =
        `conversation:${conversation._id}`;

      // Receiver gets new message
      io.to(receiverRoom).emit(
        "new-message",
        populatedMessage
      );

      // Sender also gets message for multi-tab sync
      io.to(senderRoom).emit(
        "new-message",
        populatedMessage
      );

      // Users currently inside conversation
      io.to(conversationRoom).emit(
        "conversation-message",
        populatedMessage
      );

      // Update conversation list in real time
      const conversationPayload = {
        conversationId:
          conversation._id.toString(),

        lastMessage: populatedMessage,

        senderId:
          senderId.toString(),

        receiverId:
          receiverId.toString(),

        updatedAt:
          conversation.updatedAt,
      };

      io.to(receiverRoom).emit(
        "conversation-updated",
        conversationPayload
      );

      io.to(senderRoom).emit(
        "conversation-updated",
        conversationPayload
      );

      // Increase unread message count
      io.to(receiverRoom).emit(
        "unread-message-count",
        {
          increment: 1,
          conversationId:
            conversation._id.toString(),
        }
      );
    }

    // -----------------------------------------------------
    // CREATE MESSAGE NOTIFICATION
    // -----------------------------------------------------

    const senderName =
      req.user.name ||
      req.user.username ||
      "Someone";

    await createNotification({
      recipient: receiverId,
      sender: senderId,
      type: "message",
      message: `${senderName} sent you a message`,
      relatedId: conversation._id,
    });

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",

      data: {
        message: populatedMessage,
      },
    });
  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while sending message",

      error:
        process.env.NODE_ENV ===
        "development"
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
    if (!req.user?._id) {
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
      conversations.map(async (conversation) => {
        const unreadCount =
          await Message.countDocuments({
            conversation: conversation._id,
            receiver: req.user._id,
            isRead: false,
          });

        const participant =
          conversation.participants.find(
            (user) =>
              user &&
              String(user._id) !==
                String(req.user._id)
          );

        return {
          _id: conversation._id,

          participant:
            participant || null,

          lastMessage:
            conversation.lastMessage || null,

          unreadCount,

          updatedAt:
            conversation.updatedAt,
        };
      })
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
    });
  }
};

// =========================================================
// GET MESSAGES
// =========================================================

const getMessages = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { conversationId } = req.params;

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
        message:
          "Invalid conversation ID",
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
        message:
          "Conversation not found",
      });
    }

    // -----------------------------------------------------
    // PARTICIPANT CHECK
    // -----------------------------------------------------

    const isParticipant =
      conversation.participants.some(
        (participantId) =>
          String(participantId) ===
          String(req.user._id)
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
    // FETCH MESSAGES
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
    // MARK RECEIVED MESSAGES AS READ
    // -----------------------------------------------------

    const readResult =
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
    // REAL-TIME READ UPDATE
    // -----------------------------------------------------

    const io = global.io;

    if (
      io &&
      readResult.modifiedCount > 0
    ) {
      const otherParticipant =
        conversation.participants.find(
          (participantId) =>
            String(participantId) !==
            String(req.user._id)
        );

      if (otherParticipant) {
        io.to(
          `user:${String(otherParticipant)}`
        ).emit(
          "messages-read",
          {
            conversationId:
              conversation._id.toString(),

            readerId:
              req.user._id.toString(),
          }
        );
      }
    }

    // -----------------------------------------------------
    // RETURN OLDEST -> NEWEST
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
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
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
        message:
          "Invalid conversation ID",
      });
    }

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }

    const isParticipant =
      conversation.participants.some(
        (participantId) =>
          String(participantId) ===
          String(req.user._id)
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

    // -----------------------------------------------------
    // SOCKET READ EVENT
    // -----------------------------------------------------

    const io = global.io;

    if (
      io &&
      result.modifiedCount > 0
    ) {
      const otherParticipant =
        conversation.participants.find(
          (participantId) =>
            String(participantId) !==
            String(req.user._id)
        );

      if (otherParticipant) {
        io.to(
          `user:${String(otherParticipant)}`
        ).emit(
          "messages-read",
          {
            conversationId:
              conversation._id.toString(),

            readerId:
              req.user._id.toString(),
          }
        );
      }
    }

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
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const unreadCount =
      await Message.countDocuments({
        receiver: req.user._id,
        isRead: false,
      });

    return res.status(200).json({
      success: true,

      data: {
        unreadCount,
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