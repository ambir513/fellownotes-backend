import { NextFunction, Request, Response } from "express";
import verifyInputs from "../../../utils/verify-inputs.js";
import { updateAccountDetailsSchema } from "./type.js";
import { failureRes } from "../../../utils/response.js";
import logger from "../../../utils/logger.js";

export default function verifyUserFields(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const data = verifyInputs(updateAccountDetailsSchema, req.body);
  if (data) {
    logger(data, "info");
    return failureRes(res, data, 400);
  }
  next();
}
