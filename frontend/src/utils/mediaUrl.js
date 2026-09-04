export const getApiOrigin = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl && /^https:\/\//i.test(envUrl) && !envUrl.includes("localhost")) {
        return envUrl.replace(/\/api\/?$/, "");
      }
      return window.location.origin;
    }
  }
  const raw = import.meta.env.VITE_API_URL || "http://localhost:5005/api";
  return String(raw).replace(/\/api\/?$/, "");
};


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
