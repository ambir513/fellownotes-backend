import { NextFunction, Request, Response } from "express";
import verifyInputs from "../../../utils/verify-inputs.js";
import { failureRes } from "../../../utils/response.js";
import logger from "../../../utils/logger.js";
import { createPostInputSchema } from "./type.js";

export default function verifyCreatePostFields(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const data = verifyInputs(createPostInputSchema, req.body);
  if (data) {
    logger(data, "info");
    return failureRes(res, data, 400);
  }
  next();
}
