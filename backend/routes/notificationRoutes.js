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
  "/mark-all-read",
  protect,
  markAllAsRead
);

router.patch(
  "/read-all",
  protect,
  markAllAsRead
);

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

router.put(
  "/:id",
  protect,
  markNotificationAsRead
);

router.patch(
  "/:id",
  protect,
  markNotificationAsRead
);

router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;