const Report = require("../models/Report");
const { isValidObjectId } = require("../middleware/validateObjectId");

// Submit a report
const submitReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: "targetType, targetId, and reason are required"
      });
    }

    if (!["user", "post", "comment", "message"].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid targetType"
      });
    }

    if (!isValidObjectId(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target ID"
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason: reason.trim(),
      details: (details || "").trim()
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully. Our team will review it.",
      data: {
        report
      }
    });
  } catch (error) {
    console.error("Submit Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting report"
    });
  }
};

module.exports = {
  submitReport
};
