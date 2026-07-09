import { env } from "../config/env";
import {
  createMongoUserWithGoogleAccount,
  findMongoUserByGoogleId,
} from "./mongodb-user.model";
import {
  createPostgresUserWithGoogleAccount,
  findPostgresUserByGoogleId,
} from "./postgresql-user.model";
import { CreateGoogleUserInput, User } from "./user.types";

export const findUserByGoogleId = async (
  googleId: string,
): Promise<User | null> => {
  if (env.dbType === "mongodb") {
    return findMongoUserByGoogleId(googleId);
  }

  return findPostgresUserByGoogleId(googleId);
};

export const createUserWithGoogleAccount = async (
  data: CreateGoogleUserInput,
): Promise<User> => {
  if (env.dbType === "mongodb") {
    return createMongoUserWithGoogleAccount(data);
  }

  return createPostgresUserWithGoogleAccount(data);
};
