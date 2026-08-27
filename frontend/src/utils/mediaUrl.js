const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export const getApiOrigin = () =>
  String(API_BASE).replace(/\/api\/?$/, "");

export const resolveMediaUrl = (path) => {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const origin = getApiOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
};
