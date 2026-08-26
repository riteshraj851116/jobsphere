const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = "false"
    } = req.query;

    const currentPage = Math.max(
      Number(page),
      1
    );

    const itemsPerPage = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const skip =
      (currentPage - 1) *
      itemsPerPage;

    const filter = {
      recipient: req.user._id
    };

    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const [
      notifications,
      totalNotifications,
      unreadCount
    ] = await Promise.all([
      Notification.find(filter)
        .populate(
          "sender",
          "name username profilePicture"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage,
          totalPages: Math.ceil(
            totalNotifications /
              itemsPerPage
          ),
          totalNotifications,
          hasNextPage:
            currentPage * itemsPerPage <
            totalNotifications
        }
      }
    });
  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching notifications"
    });
  }
};

const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: {
        notification
      }
    });
  } catch (error) {
    console.error(
      "Mark Notification Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating notification"
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true
        }
      }
    );

    res.status(200).json({
      success: true,
      message:
        "All notifications marked as read"
    });
  } catch (error) {
    console.error(
      "Mark All Notifications Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating notifications"
    });
  }
};

const deleteNotification = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Notification deleted successfully"
    });
  } catch (error) {
    console.error(
      "Delete Notification Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting notification"
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification
};