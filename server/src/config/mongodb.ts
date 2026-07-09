import mongoose from "mongoose";
import { env } from "./env";

export const connectMongoDB = async () => {
  await mongoose.connect(env.mongoUri);
};
