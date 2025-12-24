import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
      minLength: [1, "Content must be at least 1 character"],
      maxLength: [1000, "Content cannot be more than 1000 characters"],
    },
    image: {
      type: String,
      maxLength: [500, "Image URL cannot be more than 500 characters"],
    },
    like: {
      type: Number,
      default: 0,
    },
    comments: {
      type: [mongoose.Types.ObjectId],
      ref: "Comment",
      default: [],
    },
  },
  { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);
export default Post;
