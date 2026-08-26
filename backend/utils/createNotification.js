const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  sender = null,
  type,
  message,
  relatedId = null
}) => {
  try {
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
      relatedId
    });

    // Real-time notification
    const io = global.io;

    if (io) {
      io.to(`user:${recipient.toString()}`).emit(
        "new-notification",
        notification
      );
    }

    return notification;
  } catch (error) {
    console.error(
      "Create Notification Error:",
      error
    );

    return null;
  }
};

module.exports = createNotification;