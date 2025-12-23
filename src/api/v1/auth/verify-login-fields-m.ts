import { NextFunction, Request, Response } from "express";
import { loginInputSchema } from "./types.js";
import { failureRes } from "../../../utils/response.js";
import parseZodError from "../../../utils/zod-error.js";
import logger from "../../../utils/logger.js";

export default function loginFieldValidate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const data = parseZodError(loginInputSchema, req.body);
  if (data) {
    logger(data, "info");
    return failureRes(res, data, 401);
  }
  next();
}
