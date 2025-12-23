import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { failureRes } from "./utils/response.js";
import connectDB from "./libs/mongodb.js";
import authRouter from "./api/v1/auth/index.js";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import checkRoute from "./utils/check-route-m.js";
import { redisClientConnect } from "./libs/redis.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT! || 5001;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/v1/auth", checkRoute, authRouter);

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  return failureRes(res, err.message, 500);
});

connectDB().then(() => {
  redisClientConnect().then(() => {
    app.listen(PORT, () => {
      logger(`Server is running on port http://localhost:${PORT}`, "success");
    });
  });
});
