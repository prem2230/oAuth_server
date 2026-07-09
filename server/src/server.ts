import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(requestLogger);

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);

const startServer = async () => {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    console.log(`Database type: ${env.dbType}`);
    console.log(`Google login URL: http://localhost:${env.port}/auth/google`);
  });
};

startServer().catch((error) => {
  console.error("[Server] Failed to start", error);
  process.exit(1);
});
