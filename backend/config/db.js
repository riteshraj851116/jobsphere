const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://CarRentalDB:raj123@cluster0.vpfltmb.mongodb.net/JobSphere?retryWrites=true&w=majority";

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
    if (!process.env.VERCEL && process.env.NODE_ENV === "development" && require.main === module) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;