import dotenv from "dotenv";

dotenv.config();

export type DatabaseType = "postgresql" | "mongodb";

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const dbType = (process.env.DB_TYPE || "postgresql").toLowerCase();

if (dbType !== "postgresql" && dbType !== "mongodb") {
  throw new Error("DB_TYPE must be either 'postgresql' or 'mongodb'");
}

export const env = {
  port: process.env.PORT || "4000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  dbType: dbType as DatabaseType,
  databaseUrl:
    dbType === "postgresql" ? getRequiredEnv("DATABASE_URL") : "",
  mongoUri: dbType === "mongodb" ? getRequiredEnv("MONGO_URI") : "",
  googleClientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
  googleCallbackUrl: getRequiredEnv("GOOGLE_CALLBACK_URL"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
};
