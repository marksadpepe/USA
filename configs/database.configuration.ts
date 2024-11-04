import { registerAs } from "@nestjs/config";

export const DB_CONF_KEY = "database";
export type DBConfigType = {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
};

export const parseDbUrl = (): DBConfigType => {
  const { DB_URL } = process.env;
  if (!DB_URL) {
    throw new Error("The database URL was not specified");
  }

  const { username, password, hostname, port, pathname } = new URL(DB_URL);
  if (!username || !password || !hostname) {
    throw new Error("Incorrect database URL format");
  }

  const parsedPort = parseInt(port ?? "");
  if (typeof parsedPort !== "number" || isNaN(parsedPort)) {
    throw new Error("Incorrect database port format");
  }

  const database = pathname[0] === "/" ? pathname.slice(1) : pathname;
  if (!database) {
    throw new Error("Incorrect database name format");
  }

  return { username, password, database, host: hostname, port: parsedPort };
};

export default registerAs(DB_CONF_KEY, (): DBConfigType => {
  return parseDbUrl();
});
