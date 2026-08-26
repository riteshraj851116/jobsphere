const express = require("express");

const {
  sendConnectionRequest,
  getPendingRequests,
  respondToRequest,
  getMyConnections,
  removeConnection
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