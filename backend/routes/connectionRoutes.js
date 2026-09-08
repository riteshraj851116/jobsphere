const express = require("express");

const {
  sendConnectionRequest,
  getPendingRequests,
  getSentRequests,
  cancelPendingRequest,
  respondToRequest,
  getMyConnections,
  removeConnection,
  getMutualConnections,
  getConnectionStatus,
  getConnectionSuggestions
} = require("../controllers/connectionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Send connection request
router.post("/request", protect, sendConnectionRequest);
router.post("/request/:id", protect, sendConnectionRequest);

// Pending requests (received)
router.get("/requests", protect, getPendingRequests);
router.get("/pending", protect, getPendingRequests);

// Sent requests (outgoing)
router.get("/sent-requests", protect, getSentRequests);

// Withdraw / cancel pending request
router.delete("/request/:id", protect, cancelPendingRequest);
router.delete("/cancel/:id", protect, cancelPendingRequest);
router.post("/cancel/:id", protect, cancelPendingRequest);

// Suggestions
router.get("/suggestions", protect, getConnectionSuggestions);

// Status & Mutual connections
router.get("/status/:userId", protect, getConnectionStatus);
router.get("/mutual/:userId", protect, getMutualConnections);

// Accept / reject request
router.put("/request/:id/accept", protect, (req, res, next) => {
  req.body = req.body || {};
  req.body.action = "accept";
  return respondToRequest(req, res, next);
});
router.post("/request/:id/accept", protect, (req, res, next) => {
  req.body = req.body || {};
  req.body.action = "accept";
  return respondToRequest(req, res, next);
});
router.put("/request/:id/reject", protect, (req, res, next) => {
  req.body = req.body || {};
  req.body.action = "reject";
  return respondToRequest(req, res, next);
});
router.post("/request/:id/reject", protect, (req, res, next) => {
  req.body = req.body || {};
  req.body.action = "reject";
  return respondToRequest(req, res, next);
});
router.put("/request/:id", protect, respondToRequest);
router.put("/respond/:id", protect, respondToRequest);

// My connections
router.get("/", protect, getMyConnections);

// Remove connection
router.delete("/:userId", protect, removeConnection);

module.exports = router;