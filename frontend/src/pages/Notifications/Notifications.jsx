import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Briefcase,
  MessageCircle,
  UserPlus,
  UserCheck,
  Heart,
  Repeat,
  AtSign,
  Share2
} from "lucide-react";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../services/notificationService";

import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getNotifications();

        const notificationList =
          response?.data?.notifications ||
          response?.notifications ||
          [];

        setNotifications(
          Array.isArray(notificationList)
            ? notificationList
            : []
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load notifications"
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      setProcessingId(id);

      await markAsRead(id);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update notification"
      );
    } finally {
      setProcessingId("");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    const type = String(notification.type || "").toLowerCase();
    const sender = notification.sender;

    if (type === "connection_request") {
      navigate("/network?tab=requests");
    } else if (type === "connection_accepted" || type === "new_follower") {
      if (sender?.username) {
        navigate(`/profile/${sender.username}`);
      } else if (sender?._id) {
        navigate(`/profile/${sender._id}`);
      } else {
        navigate("/network");
      }
    } else if (
      type === "post_like" ||
      type === "post_comment" ||
      type === "comment_reply" ||
      type === "comment_like" ||
      type === "mention" ||
      type === "post_share"
    ) {
      navigate("/feed");
    } else if (type === "message") {
      navigate("/messages");
    } else if (type === "job_application" || type === "application_status") {
      navigate("/applications");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setError("");

      await markAllAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update notifications"
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setProcessingId(id);

      await deleteNotification(id);

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification._id !== id
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete notification"
      );
    } finally {
      setProcessingId("");
    }
  };

  const getIcon = (type) => {
    const notificationType = String(type || "").toLowerCase();

    if (notificationType === "message") {
      return <MessageCircle size={20} />;
    }
    if (notificationType === "connection_request" || notificationType === "connection") {
      return <UserPlus size={20} color="#818cf8" />;
    }
    if (notificationType === "connection_accepted" || notificationType === "new_follower") {
      return <UserCheck size={20} color="#34d399" />;
    }
    if (notificationType === "post_like" || notificationType === "comment_like") {
      return <Heart size={20} color="#f43f5e" fill="#f43f5e" />;
    }
    if (notificationType === "post_comment" || notificationType === "comment_reply") {
      return <MessageCircle size={20} color="#60a5fa" />;
    }
    if (notificationType === "mention") {
      return <AtSign size={20} color="#38bdf8" />;
    }
    if (notificationType === "post_share") {
      return <Repeat size={20} color="#a855f7" />;
    }
    if (notificationType === "job" || notificationType === "application" || notificationType === "job_application") {
      return <Briefcase size={20} color="#fbbf24" />;
    }

    return <Bell size={20} />;
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const difference =
      Date.now() - new Date(date).getTime();

    const minutes =
      Math.floor(difference / 60000);

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours =
      Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days =
      Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return new Date(date).toLocaleDateString();
  };

  const unreadCount =
    notifications.filter(
      (notification) => !notification.isRead
    ).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <h1>
              <Bell size={28} />
              Notifications
            </h1>

            <p>
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "You're all caught up"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="mark-all-button"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
            >
              <CheckCheck size={18} />

              {markingAll
                ? "Updating..."
                : "Mark all as read"}
            </button>
          )}
        </div>

        {error && (
          <div className="notifications-error">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={40} />

            <h2>No notifications yet</h2>

            <p>
              Your updates and activity will
              appear here.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(
              (notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${
                    notification.isRead
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                >
                  <div className="notification-icon">
                    {getIcon(notification.type)}
                  </div>

                  <div
                    className="notification-content clickable"
                    onClick={() => handleNotificationClick(notification)}
                    style={{ cursor: "pointer" }}
                  >
                    <p>
                      {notification.message}
                    </p>

                    <span>
                      {formatTime(
                        notification.createdAt
                      )}
                    </span>
                  </div>

                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsRead(
                            notification._id
                          )
                        }
                        disabled={
                          processingId ===
                          notification._id
                        }
                        title="Mark as read"
                      >
                        <CheckCheck size={18} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          notification._id
                        )
                      }
                      disabled={
                        processingId ===
                        notification._id
                      }
                      title="Delete notification"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;