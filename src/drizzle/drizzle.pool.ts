import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DBConfigType } from "../../configs";

export const getDrizzlePool = (dbConfig: DBConfigType): NodePgDatabase => {
  return drizzle({
    client: new Pool({
      user: dbConfig.username,
      password: dbConfig.password,
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port,
    }),
    casing: "snake_case",
  });
};
