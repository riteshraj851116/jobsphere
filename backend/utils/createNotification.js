const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  sender = null,
  type,
  message,
  relatedId = null
}) => {
  try {
    if (!recipient) return null;

    // User ko khud ki activity ki notification nahi deni
    if (
      sender &&
      recipient.toString() === sender.toString()
    ) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      relatedId,
      isRead: false
    });

    const populatedNotification = await Notification.findById(notification._id).populate(
      "sender",
      "name username profilePicture headline"
    );

    // Real-time notification & badge event
    const io = global.io;
    if (io) {
      const recId = recipient.toString();
      const payload = populatedNotification ? populatedNotification.toObject() : notification.toObject();

      io.to(recId).emit("new-notification", payload);
      io.to(`user:${recId}`).emit("new-notification", payload);
      io.to(recId).emit("notification-received", payload);
      io.to(`user:${recId}`).emit("notification-received", payload);

      // Unread count update
      try {
        const unreadCount = await Notification.countDocuments({
          recipient,
          isRead: false
        });
        io.to(recId).emit("unread-notification-count", { unreadCount });
        io.to(`user:${recId}`).emit("unread-notification-count", { unreadCount });
      } catch (_cntErr) {}
    }

    return populatedNotification || notification;
  } catch (error) {
    console.error("Create Notification Error:", error);
    return null;
  }
};

module.exports = createNotification;