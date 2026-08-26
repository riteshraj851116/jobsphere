// src/utils/date.js

const isValidDate = (date) => {
  if (!date) return false;

  const parsedDate = new Date(date);

  return !Number.isNaN(parsedDate.getTime());
};

export const formatDate = (dateStr) => {
  if (!isValidDate(dateStr)) {
    return "";
  }

  const date = new Date(dateStr);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateShort = (dateStr) => {
  if (!isValidDate(dateStr)) {
    return "";
  }

  const date = new Date(dateStr);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

export const timeAgo = (dateStr) => {
  if (!isValidDate(dateStr)) {
    return "";
  }

  const now = new Date();
  const date = new Date(dateStr);

  const differenceInSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  // Future date
  if (differenceInSeconds < 0) {
    return "just now";
  }

  // Less than one minute
  if (differenceInSeconds < 60) {
    return "just now";
  }

  // Less than one hour
  if (differenceInSeconds < 3600) {
    const minutes = Math.floor(
      differenceInSeconds / 60
    );

    return `${minutes}m ago`;
  }

  // Less than one day
  if (differenceInSeconds < 86400) {
    const hours = Math.floor(
      differenceInSeconds / 3600
    );

    return `${hours}h ago`;
  }

  // Less than one week
  if (differenceInSeconds < 604800) {
    const days = Math.floor(
      differenceInSeconds / 86400
    );

    return `${days}d ago`;
  }

  return formatDate(dateStr);
};

export default {
  formatDate,
  formatDateShort,
  timeAgo,
};