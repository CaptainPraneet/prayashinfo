import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("❌ [MongoDB Error]: MONGODB_URI is not defined in environment variables!");
    return;
  }

  const uri = process.env.MONGODB_URI.endsWith('/appointy')
    ? process.env.MONGODB_URI
    : `${process.env.MONGODB_URI}/appointy`;

  try {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log("✅ [MongoDB] Connected successfully to MongoDB.");
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      console.error("❌ [MongoDB Runtime Error]:", err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn("⚠️ [MongoDB] Disconnected. Reconnection will be attempted automatically.");
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.error("❌ [MongoDB Initial Connection Failed]:", error.message);
    console.warn("⚠️ [MongoDB Tip]: If using MongoDB Atlas, make sure Network Access IP Whitelist includes '0.0.0.0/0' or your current server IP: https://cloud.mongodb.com/");
  }
};

export const getDBStatus = () => isConnected;
export default connectDB;
