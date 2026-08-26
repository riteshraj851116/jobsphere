const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");


// ==========================================
// GET OR CREATE CONVERSATION
// ==========================================

const getOrCreateConversation = async (
  userId,
  otherUserId
) => {

  let conversation =
    await Conversation.findOne({
      participants: {
        $all: [
          userId,
          otherUserId
        ]
      }
    });


  if (!conversation) {

    conversation =
      await Conversation.create({
        participants: [
          userId,
          otherUserId
        ]
      });

  }


  return conversation;
};


// ==========================================
// SEND MESSAGE
// ==========================================

const sendMessage = async (
  req,
  res
) => {

  try {

    const {
      receiverId,
      text
    } = req.body;


    let image = "";


    // ----------------------------------------
    // IMAGE
    // ----------------------------------------

    if (req.file) {

      image =
        `/uploads/${req.file.filename}`;

    }


    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (
      !receiverId ||
      (
        !text?.trim() &&
        !image
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Receiver ID and message text or image are required"

      });

    }


    // ----------------------------------------
    // SELF MESSAGE
    // ----------------------------------------

    if (
      receiverId.toString() ===
      req.user._id.toString()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "You cannot send a message to yourself"

      });

    }


    // ----------------------------------------
    // RECEIVER
    // ----------------------------------------

    const receiver =
      await User.findById(
        receiverId
      );


    if (!receiver) {

      return res.status(404).json({

        success: false,

        message:
          "Receiver not found"

      });

    }


    // ----------------------------------------
    // CONVERSATION
    // ----------------------------------------

    const conversation =
      await getOrCreateConversation(
        req.user._id,
        receiverId
      );


    // ----------------------------------------
    // MESSAGE
    // ----------------------------------------

    const message =
      await Message.create({

        conversation:
          conversation._id,

        sender:
          req.user._id,

        receiver:
          receiverId,

        text:
          text?.trim() || "",

        image

      });


    // ----------------------------------------
    // UPDATE LAST MESSAGE
    // ----------------------------------------

    conversation.lastMessage =
      message._id;

    await conversation.save();


    // ----------------------------------------
    // POPULATE
    // ----------------------------------------

    const populatedMessage =
      await Message.findById(
        message._id
      )
        .populate(
          "sender",
          "name username profilePicture"
        )
        .populate(
          "receiver",
          "name username profilePicture"
        )
        .populate(
          "conversation"
        );


    // ----------------------------------------
    // SOCKET
    // ----------------------------------------

    const io =
      global.io;


    if (io) {

      const receiverRoom =
        `user:${receiverId.toString()}`;


      const conversationRoom =
        `conversation:${conversation._id.toString()}`;


      console.log(
        "📨 Sending socket message"
      );

      console.log(
        "Receiver room:",
        receiverRoom
      );

      console.log(
        "Conversation room:",
        conversationRoom
      );


      // Receiver

      io.to(
        receiverRoom
      ).emit(
        "new-message",
        populatedMessage
      );


      // Conversation

      io.to(
        conversationRoom
      ).emit(
        "conversation-message",
        populatedMessage
      );

    }


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(201).json({

      success: true,

      message:
        "Message sent successfully",

      data: {

        message:
          populatedMessage

      }

    });

  }
  catch (error) {

    console.error(
      "Send Message Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error while sending message",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined

    });

  }

};


// ==========================================
// GET CONVERSATIONS
// ==========================================

const getConversations = async (
  req,
  res
) => {

  try {

    const conversations =
      await Conversation.find({

        participants:
          req.user._id

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
          updatedAt: -1
        });


    const result =
      await Promise.all(

        conversations.map(
          async (
            conversation
          ) => {

            const unreadCount =
              await Message.countDocuments({

                conversation:
                  conversation._id,

                receiver:
                  req.user._id,

                isRead:
                  false

              });


            const otherParticipant =
              conversation.participants.find(
                (participant) =>
                  participant._id.toString() !==
                  req.user._id.toString()
              );


            return {

              _id:
                conversation._id,

              participant:
                otherParticipant,

              lastMessage:
                conversation.lastMessage,

              unreadCount,

              updatedAt:
                conversation.updatedAt

            };

          }
        )

      );


    return res.status(200).json({

      success: true,

      data: {

        conversations:
          result

      }

    });

  }
  catch (error) {

    console.error(
      "Get Conversations Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error while fetching conversations"

    });

  }

};


// ==========================================
// GET MESSAGES
// ==========================================

const getMessages = async (
  req,
  res
) => {

  try {

    const conversation =
      await Conversation.findById(
        req.params.conversationId
      );


    if (!conversation) {

      return res.status(404).json({

        success: false,

        message:
          "Conversation not found"

      });

    }


    // ----------------------------------------
    // PARTICIPANT CHECK
    // ----------------------------------------

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
          "You are not part of this conversation"

      });

    }


    const page =
      Math.max(
        Number(req.query.page) || 1,
        1
      );


    const limit =
      Math.min(
        Math.max(
          Number(req.query.limit) || 50,
          1
        ),
        100
      );


    const skip =
      (page - 1) *
      limit;


    const [
      messages,
      totalMessages
    ] = await Promise.all([

      Message.find({

        conversation:
          conversation._id

      })
        .populate(
          "sender",
          "name username profilePicture"
        )
        .populate(
          "receiver",
          "name username profilePicture"
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit),


      Message.countDocuments({

        conversation:
          conversation._id

      })

    ]);


    // ----------------------------------------
    // MARK READ
    // ----------------------------------------

    await Message.updateMany(

      {

        conversation:
          conversation._id,

        receiver:
          req.user._id,

        isRead:
          false

      },

      {

        $set: {

          isRead:
            true

        }

      }

    );


    return res.status(200).json({

      success: true,

      data: {

        messages:
          messages.reverse(),

        pagination: {

          currentPage:
            page,

          totalPages:
            Math.ceil(
              totalMessages /
              limit
            ),

          totalMessages

        }

      }

    });

  }
  catch (error) {

    console.error(
      "Get Messages Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error while fetching messages"

    });

  }

};


// ==========================================
// MARK AS READ
// ==========================================

const markMessagesAsRead = async (
  req,
  res
) => {

  try {

    const conversation =
      await Conversation.findById(
        req.params.conversationId
      );


    if (!conversation) {

      return res.status(404).json({

        success: false,

        message:
          "Conversation not found"

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
          "You are not part of this conversation"

      });

    }


    await Message.updateMany(

      {

        conversation:
          conversation._id,

        receiver:
          req.user._id,

        isRead:
          false

      },

      {

        $set: {

          isRead:
            true

        }

      }

    );


    return res.status(200).json({

      success: true,

      message:
        "Messages marked as read"

    });

  }
  catch (error) {

    console.error(
      "Mark Messages Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error while marking messages"

    });

  }

};


// ==========================================
// UNREAD COUNT
// ==========================================

const getUnreadMessageCount = async (
  req,
  res
) => {

  try {

    const count =
      await Message.countDocuments({

        receiver:
          req.user._id,

        isRead:
          false

      });


    return res.status(200).json({

      success: true,

      data: {

        unreadCount:
          count

      }

    });

  }
  catch (error) {

    console.error(
      "Unread Message Count Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error while fetching unread count"

    });

  }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

  sendMessage,

  getConversations,

  getMessages,

  markMessagesAsRead,

  getUnreadMessageCount

};