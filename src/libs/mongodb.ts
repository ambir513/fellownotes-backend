import mongoose from "mongoose";
import logger from "../utils/logger.js";

export default async function connectDB() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    await mongoose.connect(process.env.DATABASE_URL!);
    logger("MongoDB connected successfully", "success");
  } catch (error) {
    logger("Error connecting to MongoDB:", "error");
    process.exit(1);
  }
}
