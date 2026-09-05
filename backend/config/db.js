const mongoose = require("mongoose");

let isConnected = false;
let connectingPromise = null;

const normalizeMongoURI = (rawUri) => {
  const fallback =
    "mongodb+srv://CarRentalDB:raj123@cluster0.vpfltmb.mongodb.net/JobSphere?retryWrites=true&w=majority";
  let uri = (rawUri || fallback).trim();

  // If URI ends with a slash or has no database name specified before query string
  if (/^mongodb(\+srv)?:\/\/[^/]+\/?(\?.*)?$/.test(uri)) {
    uri = uri.replace(/\/?(\?.*)?$/, "/JobSphere$1");
  } else if (!uri.includes("/JobSphere")) {
    uri = uri.replace(/\/([^/?]+)(\?.*)?$/, "/JobSphere$2");
  }

  return uri;
};

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  const mongoURI = normalizeMongoURI(process.env.MONGODB_URI);

  connectingPromise = mongoose
    .connect(mongoURI, {
      bufferCommands: true,
      family: 4,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      maxPoolSize: 10,
    })
    .then((connection) => {
      isConnected = true;
      connectingPromise = null;
      console.log(`✅ MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
      return connection;
    })
    .catch((error) => {
      isConnected = false;
      connectingPromise = null;
      console.error("❌ MongoDB connection error:", error.message);
      if (!process.env.VERCEL && process.env.NODE_ENV === "development" && require.main === module) {
        process.exit(1);
      }
      throw error;
    });

  return connectingPromise;
};

module.exports = connectDB;