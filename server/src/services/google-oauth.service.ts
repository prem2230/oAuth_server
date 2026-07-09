import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { GoogleUser } from "../models/user.types";
import { logger } from "../utils/logger";

const createGoogleClient = () => {
  return new OAuth2Client(
    env.googleClientId,
    env.googleClientSecret,
    env.googleCallbackUrl,
  );
};

export const getGoogleAuthUrl = (state: string): string => {
  logger.info("[Google OAuth] Creating Google authorization URL");

  const googleClient = createGoogleClient();

  return googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    state,
    prompt: "consent",
  });
};

export const getGoogleUserFromCode = async (
  code: string,
): Promise<GoogleUser> => {
  logger.info("[Google OAuth] Exchanging authorization code for tokens");

  const googleClient = createGoogleClient();
  const { tokens } = await googleClient.getToken(code);

  if (!tokens.id_token) {
    throw new Error("No id_token received from Google");
  }

  logger.info("[Google OAuth] Verifying Google ID token");

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token");
  }

  logger.info("[Google OAuth] Google user verified", {
    googleId: payload.sub,
    email: payload.email,
  });

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatarUrl: payload.picture,
    emailVerified: payload.email_verified,
  };
};
