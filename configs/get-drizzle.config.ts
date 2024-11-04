import { config } from "dotenv";
config();

import { join } from "path";
import { defineConfig } from "drizzle-kit";
import { parseDbUrl } from "./database.configuration";

const dbConfig = parseDbUrl();

const schemaPath = join(__dirname, "..", "src", "drizzle", "schema.ts");
const migrationsPath = join(__dirname, "..", "src", "migrations");

export default defineConfig({
  schema: schemaPath,
  dialect: "postgresql",
  out: migrationsPath,
  dbCredentials: {
    user: dbConfig.username,
    password: dbConfig.password,
    port: dbConfig.port,
    host: dbConfig.host,
    database: dbConfig.database,
    ssl: false,
  },
});
