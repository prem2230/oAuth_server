import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import {
  createUserWithGoogleAccount,
  findUserById,
  findUserByGoogleId,
} from "../models/user.model";
import { logger } from "../utils/logger";
import { getGoogleAuthUrl, getGoogleUserFromCode } from "./google-oauth.service";

export const createGoogleLoginUrl = () => {
  logger.info("[Auth Service] Creating OAuth state");

  const state = crypto.randomBytes(32).toString("hex");
  const url = getGoogleAuthUrl(state);

  logger.info("[Auth Service] Google login URL created");

  return { url, state };
};

export const handleGoogleCallback = async (code: string) => {
  logger.info("[Auth Service] Handling Google callback");

  const googleUser = await getGoogleUserFromCode(code);

  if (!googleUser.email) {
    throw new Error("Google account does not have an email");
  }

  logger.info("[Auth Service] Searching user by Google ID");

  let user = await findUserByGoogleId(googleUser.googleId);

  if (!user) {
    logger.info("[Auth Service] User not found. Creating user");

    user = await createUserWithGoogleAccount({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.avatarUrl,
      emailVerified: googleUser.emailVerified,
    });
  } else {
    logger.info("[Auth Service] Existing user found", {
      userId: user.id,
      email: user.email,
    });
  }

  logger.info("[Auth Service] Creating application JWT");

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.jwtSecret,
    {
      expiresIn: "7d",
    },
  );

  logger.info("[Auth Service] Login completed", {
    userId: user.id,
    email: user.email,
  });

  return { user, token };
};

interface AuthTokenPayload {
  userId: string;
  email: string;
}

export const getCurrentUserFromToken = async (token?: string) => {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;

    if (!payload.userId) {
      return null;
    }

    return findUserById(payload.userId);
  } catch (error) {
    logger.info("[Auth Service] Invalid access token", error);
    return null;
  }
};
