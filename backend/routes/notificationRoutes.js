const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getNotifications
);

router.put(
  "/read-all",
  protect,
  markAllAsRead
);

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;