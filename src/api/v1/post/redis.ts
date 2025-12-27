import { redisClient } from "../../../libs/redis.js";

const POSTS_CACHE_TTL = 0.5 * 60 * 60; // 30 minutes

export async function createRedisPost(
  userId: string,
  limit: number,
  skip: number,
  data: any,
) {
  const redisKey = `user:${userId}:posts`;
  const field = `limit:${limit}|skip:${skip}`;

  await redisClient.hSet(redisKey, field, JSON.stringify(data));
  await redisClient.expire(redisKey, POSTS_CACHE_TTL);

  return true;
}

export async function getRedisPost(
  userId: string,
  limit: number,
  skip: number,
) {
  const redisKey = `user:${userId}:posts`;
  const field = `limit:${limit}|skip:${skip}`;

  const cached = await redisClient.hGet(redisKey, field);

  if (!cached) return null;

  return JSON.parse(cached);
}
