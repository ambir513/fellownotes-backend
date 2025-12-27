import express from "express";
import AsyncHandler from "../../../utils/async-handler.js";
import verifyCookies from "../../../utils/verify-cookies-m.js";
import { failureRes, successRes } from "../../../utils/response.js";
import Post from "../../../schema/posts.js";
import mongoose from "mongoose";
import Comment from "../../../schema/comments.js";

const commentsRouter = express.Router();

// reply/:postId
// reply-to/:postId/:toUserId

commentsRouter.post(
  "/reply/:postId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    if (!req.params.postId!) {
      return failureRes(res, "PostId not found", 404);
    }

    if (!req.body.comment) {
      return failureRes(res, "Comment is required", 400);
    }

    const isPostExists = await Post.find({
      userId: new mongoose.Types.ObjectId(req._id!),
    }).lean();

    if (isPostExists.length === 0) {
      return failureRes(res, "Post not found", 404);
    }

    const newComment = await Comment.create({
      userId: new mongoose.Types.ObjectId(req._id!),
      postId: new mongoose.Types.ObjectId(req.params.postId!),
      comment: req.body.comment!,
    });

    const post = await Post.findByIdAndUpdate(req.params.postId!, {
      $push: { comments: newComment._id },
    });

    return successRes(res, "Comment added successfully", 201);
  }),
);

commentsRouter.post(
  "/reply-to/:commentId/:toUserId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    if (!req.params.commentId!) {
      return failureRes(res, "CommentId not found", 404);
    }

    if (!req.params.toUserId!) {
      return failureRes(res, "toUserId not found", 404);
    }

    if (!req.body.comment) {
      return failureRes(res, "Comment is required", 400);
    }

    const isPostExists = await Post.find({
      userId: new mongoose.Types.ObjectId(req._id!),
    }).lean();

    if (isPostExists.length === 0) {
      return failureRes(res, "Post not found", 404);
    }

    const toUserExists = await Comment.findOneAndUpdate(
      {
        $and: [
          { _id: new mongoose.Types.ObjectId(req.params.commentId!) },
          { userId: new mongoose.Types.ObjectId(req.params.toUserId!) },
        ],
      },
      {
        $push: {
          replies: {
            userId: new mongoose.Types.ObjectId(req._id!),
            comment: req.body.comment!,
          },
        },
      },
    );

    if (!toUserExists) {
      return failureRes(res, "User to reply not found", 404);
    }

    return successRes(res, "Comment added successfully", 201);
  }),
);

commentsRouter.patch(
  "/reply/edit/:postId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    if (!req.params.postId!) {
      return failureRes(res, "PostId not found", 404);
    }

    if (!req.body.comment) {
      return failureRes(res, "Comment is required", 400);
    }

    const isCommentExist = await Comment.findOneAndUpdate(
      {
        $and: [
          { userId: new mongoose.Types.ObjectId(req._id!) },
          { postId: new mongoose.Types.ObjectId(req.params.postId!) },
        ],
      },
      { $set: { comment: req.body.comment! } },
      { new: true },
    ).lean();

    if (!isCommentExist) {
      return failureRes(res, "Post not found", 404);
    }

    return successRes(res, "Comment edited successfully", 200);
  }),
);

commentsRouter.patch(
  "/reply-to/edit/:commentId/:replyId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    if (!req.params.commentId! && !req.params.replyId!) {
      return failureRes(res, "CommentId and ReplyId not found", 404);
    }

    if (!req.body.comment) {
      return failureRes(res, "Comment is required", 400);
    }

    const isCommentExist = await Comment.findOneAndUpdate(
      {
        $and: [
          { _id: new mongoose.Types.ObjectId(req.params.commentId!) },
          { "replies._id": new mongoose.Types.ObjectId(req.params.replyId!) },
          { "replies.userId": new mongoose.Types.ObjectId(req._id!) },
        ],
      },
      {
        $set: { "replies.$.comment": req.body.comment! },
      },
      { new: true },
    ).lean();

    if (!isCommentExist) {
      return failureRes(res, "Comment not found", 404);
    }

    return successRes(res, "Comment edited successfully", 200, isCommentExist);
  }),
);

commentsRouter.delete(
  "/reply/:commentId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    if (!req.params.commentId!) {
      return failureRes(res, "CommentId not found", 404);
    }

    const isCommentExist = await Comment.findOneAndDelete({
      $and: [
        { userId: new mongoose.Types.ObjectId(req._id!) },
        { _id: new mongoose.Types.ObjectId(req.params.commentId!) },
      ],
    }).lean();

    if (!isCommentExist) {
      return failureRes(res, "Comment not found", 404);
    }
    return successRes(res, "Comment deleted successfully", 200);
  }),
);

commentsRouter.delete(
  "/reply-to/:commentId/:replyId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    if (!req.params.commentId! && !req.params.replyId!) {
      return failureRes(res, "CommentId and ReplyId not found", 404);
    }

    const isCommentExist = await Comment.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.commentId!),
        "replies._id": new mongoose.Types.ObjectId(req.params.replyId!),
        "replies.userId": new mongoose.Types.ObjectId(req._id!),
      },
      {
        $pull: {
          replies: { _id: new mongoose.Types.ObjectId(req.params.replyId!) },
        },
      },
      { new: true },
    ).lean();

    if (!isCommentExist) {
      return failureRes(res, "Comment not found", 404);
    }
    return successRes(res, "Comment deleted successfully", 200);
  }),
);

export default commentsRouter;
