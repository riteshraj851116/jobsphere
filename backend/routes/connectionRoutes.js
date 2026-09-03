const express = require("express");

const {
  sendConnectionRequest,
  getPendingRequests,
  respondToRequest,
  getMyConnections,
  removeConnection,
  getConnectionSuggestions
} = require("../controllers/connectionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Send connection request
router.post(
  "/request",
  protect,
  sendConnectionRequest
);

// Pending requests
router.get(
  "/requests",
  protect,
  getPendingRequests
);

// Suggestions
router.get(
  "/suggestions",
  protect,
  getConnectionSuggestions
);

// Accept / reject request
router.put(
  "/request/:id",
  protect,
  respondToRequest
);

// My connections
router.get(
  "/",
  protect,
  getMyConnections
);

// Remove connection
router.delete(
  "/:userId",
  protect,
  removeConnection
);

module.exports = router;