import { redisClient } from "../../../libs/redis.js";

const DEFAULT_EXPIRATION = 3600; // 1 hours

export async function getLoginSession(email: string) {
  const cachedToken = await redisClient.get(`user?session=${email}`);

  if (cachedToken) {
    return true;
  }

  return false;
}

export async function createLoginSession(email: any) {
  const session = await redisClient.set(
    `user?session=${email}`,
    JSON.stringify(email),
    {
      EX: DEFAULT_EXPIRATION,
    },
  );
  return true;
}

export async function clearLoginSession(email: string) {
  const isDeleteEmail = await redisClient.del(`user?session=${email}`);
  return true;
}
