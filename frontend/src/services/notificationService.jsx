import api from "./api";
import { MOCK_NOTIFICATIONS } from "../utils/mockData";

const STORAGE_NOTIF_KEY = "jobsphere_local_notifications";

const getLocalNotifs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIF_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return MOCK_NOTIFICATIONS;
};

const saveLocalNotifs = (list) => {
  try {
    localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return response.data;
  } catch (error) {
    const notifs = getLocalNotifs();
    return { success: true, data: { notifications: notifs }, notifications: notifs };
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    const notifs = getLocalNotifs();
    const target = notifs.find((n) => n._id === notificationId || n.id === notificationId);
    if (target) target.read = true;
    saveLocalNotifs(notifs);
    return { success: true, data: target };
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api.put("/notifications/read-all");
    return response.data;
  } catch (error) {
    const notifs = getLocalNotifs();
    notifs.forEach((n) => (n.read = true));
    saveLocalNotifs(notifs);
    return { success: true, message: "All marked as read" };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    const notifs = getLocalNotifs().filter(
      (n) => n._id !== notificationId && n.id !== notificationId
    );
    saveLocalNotifs(notifs);
    return { success: true, message: "Notification deleted" };
  }
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

export default notificationService;