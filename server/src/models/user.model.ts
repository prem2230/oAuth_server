import { env } from "../config/env";
import {
  findMongoUserById,
  createMongoUserWithGoogleAccount,
  findMongoUserByGoogleId,
} from "./mongodb-user.model";
import {
  findPostgresUserById,
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

export const findUserById = async (userId: string): Promise<User | null> => {
  if (env.dbType === "mongodb") {
    return findMongoUserById(userId);
  }

  return findPostgresUserById(userId);
};

export const createUserWithGoogleAccount = async (
  data: CreateGoogleUserInput,
): Promise<User> => {
  if (env.dbType === "mongodb") {
    return createMongoUserWithGoogleAccount(data);
  }

  return createPostgresUserWithGoogleAccount(data);
};
