const mongoose = require("mongoose");

const isValidObjectId = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  return (
    mongoose.Types.ObjectId.isValid(value) &&
    String(new mongoose.Types.ObjectId(value)) === value
  );
};

const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!isValidObjectId(String(value))) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`,
      });
    }

    next();
  };
};

module.exports = {
  isValidObjectId,
  validateObjectId,
};
