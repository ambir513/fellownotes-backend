import { NextFunction, Request, Response } from "express";
import throwError from "./throw-error.js";
import logger from "./logger.js";

const allowedRoutes = [
  "/api/v1/auth/login",
  "/api/v1/auth/verify-email",
  "/api/v1/auth/login/",
  "/api/v1/auth/verify-email/",
  "/api/v1/auth/logout",
  "/api/v1/auth/logout/",
];

export default async function checkRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger(req.originalUrl, "info");

  const isAllowedRoutes = allowedRoutes.includes(req.originalUrl.split("?")[0]);

  if (!isAllowedRoutes) {
    return throwError(`This ${req.originalUrl} route is not allowed`);
  }
  next();
}
