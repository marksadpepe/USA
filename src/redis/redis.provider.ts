import { Redis } from "ioredis";
import { RedisConfigType } from "../../configs";

export const getRedisConnection = (redisConfig: RedisConfigType): Redis => {
  const { port, host } = redisConfig;

  return new Redis(port, host);
};
