const express = require("express");

const {
  sendMessage,
  getConversations,
  getMessages,
  markMessagesAsRead,
  getUnreadMessageCount
} = require("../controllers/messageController");

const {
  protect
} = require("../middleware/authMiddleware");

const { validateObjectId } = require("../middleware/validateObjectId");

const upload =
  require("../utils/upload");

const router =
  express.Router();


// SEND MESSAGE

router.post(
  "/",
  protect,
  upload.single("image"),
  sendMessage
);


// CONVERSATIONS

router.get(
  "/conversations",
  protect,
  getConversations
);


// UNREAD COUNT

router.get(
  "/unread-count",
  protect,
  getUnreadMessageCount
);


// MESSAGES

router.get(
  "/:conversationId",
  protect,
  validateObjectId("conversationId"),
  getMessages
);


// MARK READ

router.put(
  "/:conversationId/read",
  protect,
  validateObjectId("conversationId"),
  markMessagesAsRead
);


module.exports = router;