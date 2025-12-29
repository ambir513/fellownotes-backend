import express from "express";
import AsyncHandler from "../../../utils/async-handler.js";
import createPresignedUrlWithClient from "../../../libs/aws-s3.js";
import { failureRes, successRes } from "../../../utils/response.js";
import { v4 as uuidv4 } from "uuid";
import verifyCookies from "../../../utils/verify-cookies-m.js";
import logger from "../../../utils/logger.js";
import updateAccountDetailsSchema from "./verify-updateAccount-fields-m.js";
import User from "../../../schema/users.js";

const accountRouter = express.Router();

const UPDATE_ACCOUNT_SELECT_FIELD =
  "createdAt avatar name username email bio age location course plan";

accountRouter.patch(
  "/edit",
  verifyCookies,
  updateAccountDetailsSchema,
  AsyncHandler(async (req, res) => {
    const _id = req._id!;

    if (!_id) {
      return failureRes(res, "Unauthorized, logged in now", 401);
    }

    const isUsernameTaken = await User.find({
      username: req.body.username,
      _id: { $ne: _id },
    });

    if (isUsernameTaken.length > 0) {
      return failureRes(res, "Username is already taken", 400);
    }

    const updateAccount = await User.findByIdAndUpdate(_id, req.body, {
      returnDocument: "after",
    })
      .select(UPDATE_ACCOUNT_SELECT_FIELD)
      .lean();

    return successRes(res, "Account edited successfully", 200, {
      ...updateAccount,
    });
  }),
);

accountRouter.post(
  "/get-presigned-url",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (
      !process.env.AWS_SECRET_ACCESS_KEY &&
      !process.env.AWS_ACCESS_KEY_ID &&
      !process.env.AWS_REGION &&
      !process.env.AWS_BUCKET_NAME
    ) {
      return failureRes(res, "AWS S3 details is not configured", 500);
    }

    if (!req._id!) {
      return failureRes(res, "Unauthorized, logged in now", 401);
    }

    if (!req.body.mime) {
      return failureRes(res, "Meme key is required", 400);
    }

    const filename = uuidv4() + "." + req.body?.mime;
    const url = await createPresignedUrlWithClient({ key: filename });
    logger("Alert AWS S3 - presigned url get", "warning");
    return successRes(res, "Presigned URL generated", 200, { url, filename });
  }),
);
accountRouter.get("/:username", (req, res) => {});

export default accountRouter;
