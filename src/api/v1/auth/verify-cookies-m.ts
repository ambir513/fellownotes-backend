import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { failureRes, successRes } from "../../../utils/response.js";

declare global {
  namespace Express {
    interface Request {
      email?: string | null;
      token?: string | null;
    }
  }
}

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY!;

export default function verifyCookies(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.token!;

  if (token) {
    const decrypt = jwt.verify(token, SECRET_KEY) as {
      email: string;
      iat: number;
      exp: number;
    };
    if (decrypt.email) {
      req.email = decrypt.email;
      req.token = token;

      return next();
    }
  }
  req.token = null;
  req.email = null;
  next();
}
