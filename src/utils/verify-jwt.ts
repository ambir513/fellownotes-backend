import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY!;

export default function verifyJwtToken(
  token: string,
): { email: string; _id: string; iat: number; exp: number } | null {
  return jwt.verify(token, SECRET_KEY) as {
    email: string;
    _id: string;
    iat: number;
    exp: number;
  };
}
