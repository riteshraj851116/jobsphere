const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const postRoutes = require("./routes/postRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();

const app = express();

const allowedOrigins = [
 "http://localhost:5173",
 "http://localhost:5174"
];

const server = http.createServer(app);

// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ],
    credentials: true
  }
});

global.io = io;

const PORT =
  process.env.PORT || 5000;


// ==========================================
// DATABASE
// ==========================================

connectDB();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true
  })
);


// ==========================================
// SOCKET CONNECTION
// ==========================================

io.on("connection", (socket) => {

  console.log(
    "🔌 Socket connected:",
    socket.id
  );


  // ================================
  // JOIN USER ROOM
  // ================================

  socket.on(
    "join-user",
    (userId) => {

      if (!userId) {
        return;
      }

      socket.join(
        `user:${userId}`
      );

      console.log(
        `👤 User ${userId} joined`
      );
    }
  );


  // ================================
  // JOIN CONVERSATION
  // ================================

  socket.on(
    "join-conversation",
    (conversationId) => {

      if (!conversationId) {
        return;
      }

      socket.join(
        `conversation:${conversationId}`
      );

      console.log(
        `💬 Joined conversation ${conversationId}`
      );
    }
  );


  // ================================
  // LEAVE CONVERSATION
  // ================================

  socket.on(
    "leave-conversation",
    (conversationId) => {

      if (!conversationId) {
        return;
      }

      socket.leave(
        `conversation:${conversationId}`
      );

      console.log(
        `👋 Left conversation ${conversationId}`
      );
    }
  );


  // ================================
  // DISCONNECT
  // ================================

  socket.on(
    "disconnect",
    () => {

      console.log(
        "❌ Socket disconnected:",
        socket.id
      );

    }
  );

});


// ==========================================
// BASIC ROUTES
// ==========================================

app.get(
  "/",
  (req, res) => {

    res.status(200).json({
      success: true,
      message:
        "JobSphere API is running",
      version: "1.0.0"
    });

  }
);


app.get(
  "/api/test",
  (req, res) => {

    res.status(200).json({
      success: true,
      message:
        "JobSphere backend is working"
    });

  }
);


// ==========================================
// API ROUTES
// ==========================================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/companies",
  companyRoutes
);

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/connections",
  connectionRoutes
);

app.use(
  "/api/posts",
  postRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);


// ==========================================
// 404 HANDLER
// ==========================================

app.use(
  (req, res) => {

    res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`
    });

  }
);


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (err, req, res, next) => {

    console.error(
      "Server Error:",
      err
    );

    res.status(
      err.statusCode || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error"
    });

  }
);


// ==========================================
// START SERVER
// ==========================================

server.listen(
  PORT,
  () => {

    console.log(
      `🚀 JobSphere server running on http://localhost:${PORT}`
    );

    console.log(
      "🔌 Socket.IO enabled"
    );

  }
);