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
    status: {
      type: String,
      validate: {
        validator: function (v: string) {
          return ["pending", "accepted", "rejected"].includes(v);
        },
        message: (props: any) => `${props.value} is not a valid content type`,
      },
    },
  },
  { timestamps: true },
);

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;
