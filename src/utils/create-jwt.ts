import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY!;

export default function createJwtToken(email: string, expire: any) {
  return jwt.sign({ email }, SECRET_KEY, { expiresIn: expire });
}
