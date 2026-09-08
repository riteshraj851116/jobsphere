const Connection = require("../models/Connection");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const { isValidObjectId } = require("../middleware/validateObjectId");

// ==========================================
// SEND CONNECTION REQUEST
// ==========================================

const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.body?.userId || req.body?.receiverId || req.params?.userId || req.params?.id;

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

    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself"
      });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(userId),
      User.findById(req.user._id)
    ]);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check blocked status
    if (
      currentUser.blockedUsers?.some((id) => id.toString() === userId.toString()) ||
      targetUser.blockedUsers?.some((id) => id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot connect with this user"
      });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
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

    // Real-time socket event for connection update
    const io = global.io;
    if (io) {
      io.to(userId.toString()).emit("connection-request-received", {
        connectionId: connection._id,
        sender: {
          _id: req.user._id,
          name: req.user.name,
          username: req.user.username,
          profilePicture: req.user.profilePicture,
          headline: req.user.headline
        }
      });
    }

    const populatedConnection = await Connection.findById(connection._id)
      .populate("sender", "name username profilePicture headline")
      .populate("receiver", "name username profilePicture headline");

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      data: {
        connection: populatedConnection
      }
    });
  } catch (error) {
    console.error("Send Connection Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Connection request already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while sending connection request"
    });
  }
};

// ==========================================
// GET PENDING REQUESTS (RECEIVED)
// ==========================================

const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      receiver: req.user._id,
      status: "pending"
    })
      .populate(
        "sender",
        "name username email profilePicture headline location skills"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        requests,
        total: requests.length
      }
    });
  } catch (error) {
    console.error("Get Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching connection requests"
    });
  }
};

// ==========================================
// GET SENT REQUESTS (OUTGOING PENDING)
// ==========================================

const getSentRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      sender: req.user._id,
      status: "pending"
    })
      .populate(
        "receiver",
        "name username email profilePicture headline location skills"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        requests,
        total: requests.length
      }
    });
  } catch (error) {
    console.error("Get Sent Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching sent connection requests"
    });
  }
};

// ==========================================
// CANCEL / WITHDRAW PENDING REQUEST
// ==========================================

const cancelPendingRequest = async (req, res) => {
  try {
    const { id } = req.params; // Connection ID or Target User ID

    let connection;
    if (isValidObjectId(id)) {
      connection = await Connection.findOne({
        _id: id,
        sender: req.user._id,
        status: "pending"
      });

      if (!connection) {
        // Fallback: id might be the receiver's userId
        connection = await Connection.findOne({
          sender: req.user._id,
          receiver: id,
          status: "pending"
        });
      }
    }

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Pending connection request not found"
      });
    }

    await connection.deleteOne();

    res.status(200).json({
      success: true,
      message: "Connection request withdrawn successfully"
    });
  } catch (error) {
    console.error("Cancel Connection Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while withdrawing connection request"
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

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected"
      });
    }

    let connection = await Connection.findById(req.params.id);

    // Fallback: If param is sender's user ID instead of connection ID
    if (!connection && isValidObjectId(req.params.id)) {
      connection = await Connection.findOne({
        sender: req.params.id,
        receiver: req.user._id,
        status: "pending"
      });
    }

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found"
      });
    }

    if (connection.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only respond to requests sent to you"
      });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This connection request has already been processed"
      });
    }

    connection.status = status;
    await connection.save();

    // Update User models and Notification only when accepted
    if (status === "accepted") {
      await Promise.all([
        User.findByIdAndUpdate(connection.sender, {
          $addToSet: { connections: req.user._id }
        }),
        User.findByIdAndUpdate(req.user._id, {
          $addToSet: { connections: connection.sender }
        }),
        createNotification({
          recipient: connection.sender,
          sender: req.user._id,
          type: "connection_accepted",
          message: `${req.user.name} accepted your connection request`,
          relatedId: connection._id
        })
      ]);

      const io = global.io;
      if (io) {
        io.to(connection.sender.toString()).emit("connection-accepted", {
          connectionId: connection._id,
          user: {
            _id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            profilePicture: req.user.profilePicture,
            headline: req.user.headline
          }
        });
      }
    }

    const populatedConnection = await Connection.findById(connection._id)
      .populate("sender", "name username profilePicture headline")
      .populate("receiver", "name username profilePicture headline");

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
    console.error("Respond Connection Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while responding to request"
    });
  }
};

// ==========================================
// GET MY CONNECTIONS
// ==========================================

const getMyConnections = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const connections = await Connection.find({
      $or: [
        { sender: req.user._id, status: "accepted" },
        { receiver: req.user._id, status: "accepted" }
      ]
    })
      .populate(
        "sender",
        "name username profilePicture headline location skills role"
      )
      .populate(
        "receiver",
        "name username profilePicture headline location skills role"
      )
      .sort({ updatedAt: -1 });

    let users = connections.map((connection) => {
      if (connection.sender._id.toString() === req.user._id.toString()) {
        return connection.receiver;
      }
      return connection.sender;
    });

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter((u) => {
        return (
          u.name?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          u.headline?.toLowerCase().includes(q) ||
          u.skills?.some((s) => s.toLowerCase().includes(q))
        );
      });
    }

    res.status(200).json({
      success: true,
      data: {
        connections: users,
        total: users.length
      }
    });
  } catch (error) {
    console.error("Get Connections Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching connections"
    });
  }
};

// ==========================================
// REMOVE CONNECTION
// ==========================================

const removeConnection = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    const connection = await Connection.findOne({
      $or: [
        { sender: req.user._id, receiver: targetUserId },
        { sender: targetUserId, receiver: req.user._id }
      ],
      status: "accepted"
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found"
      });
    }

    await Promise.all([
      connection.deleteOne(),
      User.findByIdAndUpdate(connection.sender, {
        $pull: { connections: connection.receiver }
      }),
      User.findByIdAndUpdate(connection.receiver, {
        $pull: { connections: connection.sender }
      })
    ]);

    res.status(200).json({
      success: true,
      message: "Connection removed successfully"
    });
  } catch (error) {
    console.error("Remove Connection Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while removing connection"
    });
  }
};

// ==========================================
// GET MUTUAL CONNECTIONS
// ==========================================

const getMutualConnections = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user._id).select("connections"),
      User.findById(userId).select("connections")
    ]);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found"
      });
    }

    const myConnSet = new Set((currentUser.connections || []).map((id) => id.toString()));
    const mutualIds = (targetUser.connections || [])
      .map((id) => id.toString())
      .filter((id) => myConnSet.has(id));

    const mutualUsers = await User.find({ _id: { $in: mutualIds } })
      .select("name username profilePicture headline location skills");

    res.status(200).json({
      success: true,
      data: {
        mutualConnections: mutualUsers,
        total: mutualUsers.length
      }
    });
  } catch (error) {
    console.error("Get Mutual Connections Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating mutual connections"
    });
  }
};

// ==========================================
// GET CONNECTION & RELATIONSHIP STATUS
// ==========================================

const getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    if (userId.toString() === req.user._id.toString()) {
      return res.status(200).json({
        success: true,
        data: {
          isSelf: true,
          connectionStatus: "self",
          isFollowing: false,
          isFollower: false,
          mutualCount: 0
        }
      });
    }

    const [currentUser, targetUser, connection] = await Promise.all([
      User.findById(req.user._id).select("connections following followers blockedUsers"),
      User.findById(userId).select("connections following followers blockedUsers"),
      Connection.findOne({
        $or: [
          { sender: req.user._id, receiver: userId },
          { sender: userId, receiver: req.user._id }
        ]
      })
    ]);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let connectionStatus = "none";
    let connectionId = null;

    if (connection) {
      connectionId = connection._id;
      if (connection.status === "accepted") {
        connectionStatus = "connected";
      } else if (connection.status === "pending") {
        connectionStatus =
          connection.sender.toString() === req.user._id.toString()
            ? "pending_sent"
            : "pending_received";
      } else {
        connectionStatus = "none"; // Rejected or lapsed
      }
    }

    const isFollowing = currentUser.following?.some(
      (id) => id.toString() === userId.toString()
    ) || false;

    const isFollower = currentUser.followers?.some(
      (id) => id.toString() === userId.toString()
    ) || false;

    const isBlocked = currentUser.blockedUsers?.some(
      (id) => id.toString() === userId.toString()
    ) || false;

    // Calculate mutual connections
    const myConnSet = new Set((currentUser.connections || []).map((id) => id.toString()));
    const mutualIds = (targetUser.connections || [])
      .map((id) => id.toString())
      .filter((id) => myConnSet.has(id));

    const mutualUsers = await User.find({ _id: { $in: mutualIds.slice(0, 3) } })
      .select("name username profilePicture headline");

    res.status(200).json({
      success: true,
      data: {
        isSelf: false,
        connectionStatus,
        connectionId,
        isFollowing,
        isFollower,
        isBlocked,
        mutualCount: mutualIds.length,
        mutualUsers
      }
    });
  } catch (error) {
    console.error("Get Connection Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching relationship status"
    });
  }
};

// ==========================================
// GET INTELLIGENT CONNECTION SUGGESTIONS
// ==========================================

const getConnectionSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .select("connections followers following skills education experience headline blockedUsers");

    const existingConnections = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    });

    const excludedUserIds = new Set([
      req.user._id.toString(),
      ...existingConnections.map((c) =>
        c.sender.toString() === req.user._id.toString()
          ? c.receiver.toString()
          : c.sender.toString()
      ),
      ...(currentUser.blockedUsers || []).map((id) => id.toString())
    ]);

    // Fetch potential candidates
    const candidates = await User.find({
      _id: { $nin: Array.from(excludedUserIds) }
    })
      .select("name username profilePicture headline location skills education experience connections")
      .limit(60);

    const myConnSet = new Set((currentUser.connections || []).map((id) => id.toString()));
    const mySkillsSet = new Set((currentUser.skills || []).map((s) => s.toLowerCase().trim()));
    const myInstitutions = new Set(
      (currentUser.education || [])
        .map((e) => e.institution?.toLowerCase().trim())
        .filter(Boolean)
    );
    const myCompanies = new Set(
      (currentUser.experience || [])
        .map((e) => e.company?.toLowerCase().trim())
        .filter(Boolean)
    );

    const scoredCandidates = candidates.map((candidate) => {
      let score = 0;
      const reasons = [];

      // 1. Mutual connections
      const candidateConn = (candidate.connections || []).map((id) => id.toString());
      const mutuals = candidateConn.filter((id) => myConnSet.has(id));
      if (mutuals.length > 0) {
        score += mutuals.length * 8;
        reasons.push(`${mutuals.length} mutual connection${mutuals.length > 1 ? "s" : ""}`);
      }

      // 2. Matching skills
      const candSkills = (candidate.skills || []).map((s) => s.toLowerCase().trim());
      const sharedSkills = candSkills.filter((s) => mySkillsSet.has(s));
      if (sharedSkills.length > 0) {
        score += sharedSkills.length * 4;
        reasons.push(`Skills: ${sharedSkills.slice(0, 2).join(", ")}`);
      }

      // 3. Same Company
      const candCompanies = (candidate.experience || []).map((e) => e.company?.toLowerCase().trim());
      const sharedCompany = candCompanies.find((c) => c && myCompanies.has(c));
      if (sharedCompany) {
        score += 15;
        reasons.push(`Both worked at ${sharedCompany}`);
      }

      // 4. Same University/College
      const candInstitutions = (candidate.education || []).map((e) => e.institution?.toLowerCase().trim());
      const sharedEdu = candInstitutions.find((i) => i && myInstitutions.has(i));
      if (sharedEdu) {
        score += 10;
        reasons.push(`Studied at ${sharedEdu}`);
      }

      // 5. Similar headline keyword
      if (currentUser.headline && candidate.headline) {
        const myHeadWords = currentUser.headline.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
        const candHeadWords = new Set(candidate.headline.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
        const matchedWord = myHeadWords.find((w) => candHeadWords.has(w));
        if (matchedWord) {
          score += 5;
          if (reasons.length === 0) {
            reasons.push(`Similar role: ${candidate.headline}`);
          }
        }
      }

      const candObj = candidate.toObject();
      candObj.mutualCount = mutuals.length;
      candObj.matchScore = score;
      candObj.reason = reasons.length > 0 ? reasons.join(" • ") : "Member in your field";

      return candObj;
    });

    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

    const topSuggestions = scoredCandidates.slice(0, 15);

    res.status(200).json({
      success: true,
      data: {
        suggestions: topSuggestions,
        total: topSuggestions.length
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
  getSentRequests,
  cancelPendingRequest,
  respondToRequest,
  getMyConnections,
  removeConnection,
  getMutualConnections,
  getConnectionStatus,
  getConnectionSuggestions
};