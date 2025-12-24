import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY!;

export default function createJwtToken(
  { email, _id }: { email: string; _id: string },
  expire: any,
) {
  return jwt.sign({ email, _id }, SECRET_KEY, { expiresIn: expire });
}
