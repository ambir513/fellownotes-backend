import express from "express";
import AsyncHandler from "../../../utils/async-handler.js";
import verifyCookies from "../../../utils/verify-cookies-m.js";
import { failureRes, successRes } from "../../../utils/response.js";
import Post from "../../../schema/posts.js";
import verifyCreatePostFields from "./verify-create-post-fields-m.js";
import mongoose from "mongoose";
import { createRedisPost, getRedisPost } from "./redis.js";
import logger from "../../../utils/logger.js";

const postRouter = express.Router();

const UPDATE_POST_SELECT_FIELDS = "-__v ";

postRouter.get(
  "/",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const skip = (page - 1) * limit;

    const isPostExists = await Post.find({
      userId: new mongoose.Types.ObjectId(req._id!),
    }).lean();

    if (isPostExists.length === 0) {
      return failureRes(res, "Post not found", 404);
    }

    const cachedPost = await getRedisPost(req._id!, limit, skip);

    if (cachedPost?.length > 0) {
      logger("Post fetched from redis cache", "info");
      return successRes(res, "Post fetched successfully", 200, cachedPost);
    }

    const getPost = await Post.find({ userId: req._id })
      .populate("comments")
      .limit(limit)
      .skip(skip)
      .lean();

    await createRedisPost(req._id!, limit, skip, getPost);
    logger("Post fetched from database and cached in redis", "info");
    return successRes(res, "Post fetched successfully", 200, getPost);
  }),
);

postRouter.post(
  "/create",
  verifyCookies,
  verifyCreatePostFields,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    const newPost = await Post.create({
      userId: req._id,
      ...req.body,
    });

    return successRes(res, "Post created successfully", 201, newPost);
  }),
);
postRouter.patch(
  "/update/:postId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    if (!req.params.postId) {
      return failureRes(res, "postId not found", 404);
    }

    const isPostExists = await Post.find({
      $and: [
        { _id: new mongoose.Types.ObjectId(req.params.postId) },
        { userId: req._id },
      ],
    });

    if (isPostExists.length === 0) {
      return failureRes(res, "Post not found", 404);
    }
    const updatedPost = await Post.findOneAndUpdate(
      {
        _id: isPostExists[0]._id,
      },
      req.body,
      {
        returnDocument: "after",
      },
    ).select(UPDATE_POST_SELECT_FIELDS);

    return successRes(res, "Post updated successfully", 200, updatedPost);
  }),
);
postRouter.delete(
  "/delete/:postId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized logged in now", 401);
    }

    if (!req.params.postId) {
      return failureRes(res, "postId not found", 404);
    }
    const isPostExists = await Post.find({
      $and: [
        { _id: new mongoose.Types.ObjectId(req.params.postId) },
        { userId: req._id },
      ],
    });

    if (isPostExists.length === 0) {
      return failureRes(res, "Post not found", 404);
    }
    const deletedPost = await Post.findOneAndDelete({
      _id: isPostExists[0]._id,
    }).select(UPDATE_POST_SELECT_FIELDS);

    return successRes(res, "Post deleted successfully", 200, deletedPost);
  }),
);

export default postRouter;
