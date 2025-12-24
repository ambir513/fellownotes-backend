import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;
