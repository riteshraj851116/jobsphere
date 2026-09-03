const Connection = require("../models/Connection");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const { isValidObjectId } = require("../middleware/validateObjectId");


// ==========================================
// SEND CONNECTION REQUEST
// ==========================================

const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.body.userId || req.body.receiverId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!isValidObjectId(String(userId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const existingConnection =
      await Connection.findOne({
        $or: [
          {
            sender: req.user._id,
            receiver: userId
          },
          {
            sender: userId,
            receiver: req.user._id
          }
        ]
      });

    if (existingConnection) {
      return res.status(409).json({
        success: false,
        message: `Connection already exists with status: ${existingConnection.status}`
      });
    }

    const connection = await Connection.create({
      sender: req.user._id,
      receiver: userId,
      status: "pending"
    });

    // Create notification
    await createNotification({
      recipient: userId,
      sender: req.user._id,
      type: "connection_request",
      message: `${req.user.name} sent you a connection request`,
      relatedId: connection._id
    });

    const populatedConnection =
      await Connection.findById(connection._id)
        .populate(
          "sender",
          "name username profilePicture headline"
        )
        .populate(
          "receiver",
          "name username profilePicture headline"
        );

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      data: {
        connection: populatedConnection
      }
    });

  } catch (error) {
    console.error(
      "Send Connection Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Connection request already exists"
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Server error while sending connection request"
    });
  }
};


// ==========================================
// GET PENDING REQUESTS
// ==========================================

const getPendingRequests = async (req, res) => {
  try {
    const requests =
      await Connection.find({
        receiver: req.user._id,
        status: "pending"
      })
        .populate(
          "sender",
          "name username email profilePicture headline location skills"
        )
        .sort({
          createdAt: -1
        });

    res.status(200).json({
      success: true,
      data: {
        requests
      }
    });

  } catch (error) {
    console.error(
      "Get Requests Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching connection requests"
    });
  }
};


// ==========================================
// ACCEPT / REJECT REQUEST
// ==========================================

const respondToRequest = async (req, res) => {
  try {
    const rawAction = req.body.status || req.body.action;
    const status =
      rawAction === "accept"
        ? "accepted"
        : rawAction === "reject"
          ? "rejected"
          : rawAction;

    if (
      !["accepted", "rejected"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be accepted or rejected"
      });
    }

    const connection =
      await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found"
      });
    }

    if (
      connection.receiver.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only respond to requests sent to you"
      });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This connection request has already been processed"
      });
    }

    connection.status = status;

    await connection.save();

    // Notification only when accepted
    if (status === "accepted") {
      await createNotification({
        recipient: connection.sender,
        sender: req.user._id,
        type: "connection_accepted",
        message: `${req.user.name} accepted your connection request`,
        relatedId: connection._id
      });
    }

    const populatedConnection =
      await Connection.findById(connection._id)
        .populate(
          "sender",
          "name username profilePicture headline"
        )
        .populate(
          "receiver",
          "name username profilePicture headline"
        );

    res.status(200).json({
      success: true,
      message:
        status === "accepted"
          ? "Connection request accepted"
          : "Connection request rejected",
      data: {
        connection: populatedConnection
      }
    });

  } catch (error) {
    console.error(
      "Respond Connection Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while responding to request"
    });
  }
};


// ==========================================
// GET MY CONNECTIONS
// ==========================================

const getMyConnections = async (req, res) => {
  try {
    const connections =
      await Connection.find({
        $or: [
          {
            sender: req.user._id,
            status: "accepted"
          },
          {
            receiver: req.user._id,
            status: "accepted"
          }
        ]
      })
        .populate(
          "sender",
          "name username profilePicture headline location"
        )
        .populate(
          "receiver",
          "name username profilePicture headline location"
        )
        .sort({
          updatedAt: -1
        });

    const users = connections.map(
      (connection) => {
        if (
          connection.sender._id.toString() ===
          req.user._id.toString()
        ) {
          return connection.receiver;
        }

        return connection.sender;
      }
    );

    res.status(200).json({
      success: true,
      data: {
        connections: users,
        total: users.length
      }
    });

  } catch (error) {
    console.error(
      "Get Connections Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching connections"
    });
  }
};


// ==========================================
// REMOVE CONNECTION
// ==========================================

const removeConnection = async (req, res) => {
  try {
    const connection =
      await Connection.findOne({
        $or: [
          {
            sender: req.user._id,
            receiver: req.params.userId
          },
          {
            sender: req.params.userId,
            receiver: req.user._id
          }
        ],
        status: "accepted"
      });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found"
      });
    }

    await connection.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Connection removed successfully"
    });

  } catch (error) {
    console.error(
      "Remove Connection Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while removing connection"
    });
  }
};


// ==========================================
// GET CONNECTION SUGGESTIONS
// ==========================================

const getConnectionSuggestions = async (req, res) => {
  try {
    const existingConnections = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    });

    const connectedUserIds = [
      req.user._id,
      ...existingConnections.map((c) =>
        c.sender.toString() === req.user._id.toString() ? c.receiver : c.sender
      )
    ];

    const suggestions = await User.find({
      _id: { $nin: connectedUserIds }
    })
      .select("name username profilePicture headline location skills role")
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        total: suggestions.length
      }
    });
  } catch (error) {
    console.error("Get Suggestions Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching connection suggestions"
    });
  }
};

module.exports = {
  sendConnectionRequest,
  getPendingRequests,
  respondToRequest,
  getMyConnections,
  removeConnection,
  getConnectionSuggestions
};