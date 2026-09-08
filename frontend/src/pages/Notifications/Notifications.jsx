import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Share2,
  Filter,
  CheckCircle,
  Sparkles,
  ExternalLink
} from "lucide-react";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../services/notificationService";
import { useSocket } from "../../context/SocketContext";
import Loader from "../../components/common/Loader";

import "./Notifications.css";

const FILTER_TABS = [
  { id: "all", label: "All Updates" },
  { id: "unread", label: "Unread" },
  { id: "network", label: "Network & Requests" },
  { id: "jobs", label: "Jobs & Applications" },
  { id: "social", label: "Feed & Social" }
];

const Notifications = () => {
  const navigate = useNavigate();
  const { onNotification } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [processingId, setProcessingId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getNotifications();
      const notificationList =
        response?.data?.notifications ||
        response?.notifications ||
        response?.data ||
        [];

      setNotifications(Array.isArray(notificationList) ? notificationList : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Real-time socket notification listener
  useEffect(() => {
    if (!onNotification) return;

    const unsub = onNotification((newNotif) => {
      if (!newNotif) return;
      showToast(`New Notification: ${newNotif.message || "You have a new update"}`);

      setNotifications((prev) => {
        const notifId = newNotif._id || newNotif.id;
        const exists = prev.some((n) => (n._id || n.id) === notifId);
        if (exists) return prev;
        return [{ ...newNotif, isRead: false }, ...prev];
      });
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [onNotification]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setProcessingId(id);
      await markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          (n._id === id || n.id === id)
            ? { ...n, isRead: true, read: true }
            : n
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update notification");
    } finally {
      setProcessingId("");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setError("");
      await markAllAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          read: true
        }))
      );
      showToast("All notifications marked as read");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update notifications");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setProcessingId(id);
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((n) => n._id !== id && n.id !== id)
      );
      showToast("Notification deleted");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete notification");
    } finally {
      setProcessingId("");
    }
  };

  const handleNotificationClick = async (notification) => {
    const isRead = Boolean(notification.isRead ?? notification.read);
    const notifId = notification._id || notification.id;

    if (!isRead && notifId) {
      handleMarkAsRead(notifId);
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
      type.includes("post") ||
      type.includes("comment") ||
      type.includes("mention")
    ) {
      navigate("/feed");
    } else if (type === "message") {
      navigate("/messages");
    } else if (type.includes("application") || type.includes("job")) {
      navigate("/applications");
    } else if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = (type) => {
    const t = String(type || "").toLowerCase();

    if (t === "message") return <MessageCircle size={18} />;
    if (t.includes("connection_request")) return <UserPlus size={18} />;
    if (t.includes("connection_accepted") || t.includes("new_follower")) return <UserCheck size={18} />;
    if (t.includes("like")) return <Heart size={18} />;
    if (t.includes("comment")) return <MessageCircle size={18} />;
    if (t.includes("share") || t.includes("repost")) return <Repeat size={18} />;
    if (t.includes("mention")) return <AtSign size={18} />;
    if (t.includes("job") || t.includes("application")) return <Briefcase size={18} />;

    return <Bell size={18} />;
  };

  const formatTime = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString();
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isUnread = !Boolean(n.isRead ?? n.read);
      const t = String(n.type || "").toLowerCase();

      if (activeTab === "unread") return isUnread;
      if (activeTab === "network") return t.includes("connection") || t.includes("follower");
      if (activeTab === "jobs") return t.includes("job") || t.includes("application");
      if (activeTab === "social") return t.includes("post") || t.includes("comment") || t.includes("like") || t.includes("share");
      return true;
    });
  }, [notifications, activeTab]);

  const totalUnreadCount = useMemo(() => {
    return notifications.filter((n) => !Boolean(n.isRead ?? n.read)).length;
  }, [notifications]);

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        {/* TOAST POPUP */}
        {toastMessage && (
          <div className="notif-live-toast">
            <Sparkles size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HEADER BAR */}
        <div className="notifications-header">
          <div className="header-text-block">
            <div className="eyebrow-chip">
              <span className="live-pulse-dot" />
              ACTIVITY CENTER
            </div>
            <h1>
              <Bell size={28} />
              Notifications
            </h1>
            <p>
              {totalUnreadCount > 0
                ? `You have ${totalUnreadCount} unread update${totalUnreadCount > 1 ? "s" : ""}`
                : "You're all caught up with your latest professional updates"}
            </p>
          </div>

          <div className="header-actions">
            {totalUnreadCount > 0 && (
              <button
                type="button"
                className="mark-all-button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
              >
                <CheckCheck size={16} />
                <span>{markingAll ? "Marking..." : "Mark all as read"}</span>
              </button>
            )}
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="notif-filter-tabs">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.id === "unread"
                ? totalUnreadCount
                : tab.id === "all"
                ? notifications.length
                : notifications.filter((n) => {
                    const t = String(n.type || "").toLowerCase();
                    if (tab.id === "network") return t.includes("connection") || t.includes("follower");
                    if (tab.id === "jobs") return t.includes("job") || t.includes("application");
                    if (tab.id === "social") return t.includes("post") || t.includes("comment") || t.includes("like");
                    return true;
                  }).length;

            return (
              <button
                key={tab.id}
                type="button"
                className={`notif-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                {count > 0 && <span className="tab-badge">{count}</span>}
              </button>
            );
          })}
        </div>

        {error && <div className="notifications-error">{error}</div>}

        {/* LIST OR EMPTY STATE */}
        {loading ? (
          <div className="notifications-loading">
            <Loader text="Syncing your notifications..." />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={42} />
            <h2>No notifications in this view</h2>
            <p>
              {activeTab === "unread"
                ? "All notifications have been read!"
                : "New notifications regarding your connections, jobs, and posts will appear here."}
            </p>
            {activeTab !== "all" && (
              <button
                type="button"
                className="btn-view-all"
                onClick={() => setActiveTab("all")}
              >
                View All Notifications
              </button>
            )}
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => {
              const notifId = notification._id || notification.id;
              const isRead = Boolean(notification.isRead ?? notification.read);
              const sender = notification.sender;

              return (
                <div
                  key={notifId}
                  className={`notification-item ${isRead ? "notification-read" : "notification-unread"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* SENDER AVATAR / ICON */}
                  <div className="notification-avatar-col">
                    {sender?.profilePicture ? (
                      <img
                        src={sender.profilePicture}
                        alt={sender.name || "Sender"}
                        className="notif-sender-img"
                      />
                    ) : (
                      <div className="notification-icon">
                        {getIcon(notification.type)}
                      </div>
                    )}
                    <span className="notif-mini-type-badge">
                      {getIcon(notification.type)}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="notification-content">
                    <p className="notif-message-text">
                      {notification.message}
                    </p>
                    <div className="notif-meta-row">
                      <span className="notif-timestamp">
                        {formatTime(notification.createdAt)}
                      </span>
                      {sender?.name && (
                        <>
                          <span className="meta-dot">•</span>
                          <span className="notif-sender-name">{sender.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="notification-actions">
                    {!isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(notifId, e)}
                        disabled={processingId === notifId}
                        className="btn-action-icon"
                        title="Mark as read"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDelete(notifId, e)}
                      disabled={processingId === notifId}
                      className="btn-action-icon delete"
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;