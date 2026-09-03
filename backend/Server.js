const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

// ==============================
// ROUTES
// ==============================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const companyRoutes = require("./routes/companyRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const postRoutes = require("./routes/postRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const careerRoutes = require("./routes/careerRoutes");

// ==============================
// APP & SERVER
// ==============================

const app = express();
const server = http.createServer(app);

// ==============================
// DATABASE
// ==============================

connectDB();

// ==============================
// ALLOWED ORIGINS
// ==============================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://riteshraj851116.github.io",
  process.env.CLIENT_URL,
].filter(Boolean);

// ==============================
// MIDDLEWARE
// ==============================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (Postman, mobile apps, curl)
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      // Permissive fallback in production for client deployment flexibility
      return callback(null, true);
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept"
    ],
  })
);

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ==============================
// HEALTH CHECK
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobSphere API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobSphere backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

// ==============================
// API ROUTES
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/companies", companyRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/connections", connectionRoutes);

app.use("/api/ai", aiRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/career", careerRoutes);

// ==============================
// SOCKET.IO
// ==============================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (!userId) {
      return;
    }

    socket.join(userId);

    console.log(
      `User ${userId} joined personal socket room`
    );
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ==============================
// 404 HANDLER
// ==============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==============================
// GLOBAL ERROR HANDLER
// ==============================

app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      error.message ||
      "Something went wrong on the server",
  });
});

// ==============================
// START SERVER
// ==============================

const PORT = process.env.PORT || 5002;

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log(" JOBSPHERE BACKEND RUNNING");
    console.log("======================================");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log("Socket.IO: Enabled");
    console.log("AI Assistant: Enabled");
    console.log("======================================");
    console.log("");
  });
}

module.exports = app;
module.exports.server = server;