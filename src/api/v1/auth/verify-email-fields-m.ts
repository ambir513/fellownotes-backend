import { NextFunction, Request, Response } from "express";
import { verifyEmailQuerySchema } from "./types.js";
import { failureRes } from "../../../utils/response.js";
import verifyInputs from "../../../utils/verify-inputs.js";
import logger from "../../../utils/logger.js";

export default function verifyEmailQueryFieldValidate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const data = verifyInputs(verifyEmailQuerySchema, req.query);
  if (data) {
    logger(data, "error");
    return failureRes(res, data, 401);
  }
  next();
}
