import express from "express";
import AsyncHandler from "../../../utils/async-handler.js";
import verifyCookies from "../../../utils/verify-cookies-m.js";
import { failureRes, successRes } from "../../../utils/response.js";
import User from "../../../schema/users.js";
import Connection from "../../../schema/connections.js";
import mongoose from "mongoose";
import { $ZodNever } from "zod/v4/core";

const connectionRouter = express.Router();

connectionRouter.get(
  "/",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized, logged in now", 401);
    }

    const userId = new mongoose.Types.ObjectId(req._id);

    const following = await Connection.aggregate([
      {
        $match: {
          $or: [{ fromUserId: userId }, { toUserId: userId }],
        },
      },
      {
        $group: {
          _id: null,
          followingCount: {
            $sum: {
              $cond: [{ $eq: ["$fromUserId", userId] }, 1, 0],
            },
          },

          followerCount: {
            $sum: {
              $cond: [{ $eq: ["$toUserId", userId] }, 1, 0],
            },
          },
          followingDetails: {
            $push: {
              $cond: [
                { $eq: ["$fromUserId", userId] },
                "$fromUserId",
                "$$REMOVE",
              ],
            },
          },
          followerDetails: {
            $push: {
              $cond: [{ $eq: ["$toUserId", userId] }, "$toUserId", "$$REMOVE"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          followingCount: 1,
          followerCount: 1,
          followingDetails: 1,
          followerDetails: 1,
        },
      },
    ]);
    return successRes(res, "Connections fetched successfully", 200, {
      following: following[0]?.followingDetails || [],
      followers: following[0]?.followerDetails || [],
      followingCount: following[0]?.followingCount || 0,
      followerCount: following[0]?.followerCount || 0,
    });
  }),
);

connectionRouter.get(
  "/:userId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized, logged in now", 401);
    }
    const { userId } = req.params;

    if (!userId) {
      return failureRes(res, "User ID is required", 400);
    }

    if (userId === req._id) {
      return failureRes(res, "You cannot follow yourself", 400);
    }

    const isUserExist = await User.findById(userId).lean();

    if (!isUserExist) {
      return failureRes(res, "User not found", 404);
    }
    const newConnection = Connection.create({
      fromUserId: req._id,
      toUserId: isUserExist._id,
    });

    return successRes(res, "User followed successfully", 200);
  }),
);

connectionRouter.delete(
  "/:userId",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized, logged in now", 401);
    }
    const { userId } = req.params;

    if (!userId) {
      return failureRes(res, "User ID is required", 400);
    }

    const isUserExist = await User.findById({ _id: userId })
      .select("_id")
      .lean();

    if (!isUserExist) {
      return failureRes(res, "User not found", 404);
    }

    const isFollowing = await Connection.findOne({ toUserId: userId }).lean();

    if (!isFollowing) {
      return failureRes(res, "You are not following this user", 400);
    }

    const deleteConnection = await Connection.findOneAndDelete({
      fromUserId: req._id,
      toUserId: userId,
    }).lean();

    return successRes(res, "User unfollowed successfully", 200);
  }),
);

export default connectionRouter;
