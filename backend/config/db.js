const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error("❌ MONGODB_URI is not defined in environment variables");
      return;
    }

    const connection = await mongoose.connect(mongoURI, {
      bufferCommands: false,
    });

    isConnected = true;
    console.log(
      `✅ MongoDB connected: ${connection.connection.host}`
    );
    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;