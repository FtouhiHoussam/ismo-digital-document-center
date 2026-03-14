import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb:

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
