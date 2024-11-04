import { registerAs } from "@nestjs/config";

export const SERVER_CONF_KEY = "server";
export type ServerConfigType = {
  port: number;
  prefix: string;
};

export default registerAs(SERVER_CONF_KEY, (): ServerConfigType => {
  const { SERVER_PORT, SERVER_PREFIX } = process.env;
  if (!SERVER_PREFIX) {
    throw new Error("Incorrect server prefix format");
  }

  const parsedPort = parseInt(SERVER_PORT ?? "");
  if (typeof parsedPort !== "number" || isNaN(parsedPort)) {
    throw new Error("Incorrect server port format");
  }

  return { port: parsedPort, prefix: SERVER_PREFIX };
});
