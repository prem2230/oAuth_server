import { env } from "./env";
import { connectMongoDB } from "./mongodb";
import { postgresPool } from "./postgres";

export const connectDatabase = async () => {
  if (env.dbType === "mongodb") {
    console.log("[Database] Connecting to MongoDB");
    await connectMongoDB();
    console.log("[Database] MongoDB connected");
    return;
  }

  console.log("[Database] Connecting to PostgreSQL");
  await postgresPool.query("SELECT 1");
  console.log("[Database] PostgreSQL connected");
};
