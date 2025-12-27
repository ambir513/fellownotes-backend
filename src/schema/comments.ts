import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      minlength: [1, "Comment must be at least 1 character long"],
      maxlength: [500, "Comment can be maximum 500 characters long"],
    },
  },
  { timestamps: true },
);

const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      minlength: [1, "Comment must be at least 1 character long"],
      maxlength: [500, "Comment can be maximum 500 characters long"],
    },
    replies: {
      type: [ReplySchema],
      default: [],
    },
  },
  { timestamps: true },
);

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
