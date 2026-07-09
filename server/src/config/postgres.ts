import { Pool } from "pg";
import { env } from "./env";

export const postgresPool = new Pool({
  connectionString: env.databaseUrl,
});
