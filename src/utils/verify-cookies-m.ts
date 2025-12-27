import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      email?: string | null;
      token?: string | null;
      _id?: string | null;
    }
  }
}


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
      _id: string;
      iat: number;
      exp: number;
    };
    if (decrypt.email) {
      req.email = decrypt.email;
      req.token = token;
      req._id = decrypt._id;

      return next();
    }
  }
  req.token = null;
  req._id = null;
  req.email = null;
  next();
}
