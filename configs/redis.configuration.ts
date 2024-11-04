import { registerAs } from "@nestjs/config";

export const REDIS_CONF_KEY = "redis";

export type RedisConfigType = {
  port: number;
  host: string;
};

export default registerAs(REDIS_CONF_KEY, (): RedisConfigType => {
  const { REDIS_PORT, REDIS_HOST } = process.env;

  if (!REDIS_HOST) {
    throw new Error("The Redis host was not specified");
  }

  const parsedPort = parseInt(REDIS_PORT ?? "");
  if (typeof parsedPort !== "number" || isNaN(parsedPort)) {
    throw new Error("Incorrect redis port format");
  }

  return { port: parsedPort, host: REDIS_HOST };
});
