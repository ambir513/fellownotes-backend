import { createClient } from "redis";
import logger from "../utils/logger.js";

export const redisClient = createClient();

export async function redisClientConnect() {
  try {
    redisClient.on("error", (err) => {
      logger("Redis Client Error", "error");
      process.exit(1);
    });
    await redisClient.connect();
    logger("Redis Client Connected", "success");
  } catch (error) {
    logger(`Redis Connection Failed: ${(error as Error).message}`, "error");
    process.exit(1);
  }
}
