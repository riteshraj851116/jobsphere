export const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

export const isValidObjectId = (value) => {
  if (!value) {
    return false;
  }

  return OBJECT_ID_REGEX.test(String(value));
};

export const getEntityId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return String(value._id || value.id || value.userId || "");
  }

  return String(value);
};
