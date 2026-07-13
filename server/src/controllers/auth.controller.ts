import { Request, Response } from "express";
import {
  createGoogleLoginUrl,
  getCurrentUserFromToken,
  handleGoogleCallback,
} from "../services/auth.service";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const googleLogin = (req: Request, res: Response) => {
  logger.info("[Auth Controller] GET /auth/google");

  const { url, state } = createGoogleLoginUrl();

  logger.info("[Auth Controller] Saving OAuth state cookie");

  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 10 * 60 * 1000,
  });

  logger.info("[Auth Controller] Redirecting browser to Google");

  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    logger.info("[Auth Controller] GET /auth/google/callback");

    const { code, state } = req.query;
    const savedState = req.cookies.google_oauth_state;

    if (!code || typeof code !== "string") {
      logger.info("[Auth Controller] Missing authorization code");

      return res.status(400).json({
        message: "Missing authorization code",
      });
    }

    if (!state || state !== savedState) {
      logger.info("[Auth Controller] Invalid OAuth state", {
        hasState: Boolean(state),
        hasSavedState: Boolean(savedState),
      });

      return res.status(400).json({
        message: "Invalid OAuth state",
      });
    }

    logger.info("[Auth Controller] OAuth state is valid");

    const { user, token } = await handleGoogleCallback(code);

    logger.info("[Auth Controller] Clearing OAuth state cookie");

    res.clearCookie("google_oauth_state");

    logger.info("[Auth Controller] Saving access token cookie");

    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info("[Auth Controller] Redirecting browser to frontend", {
      userId: user.id,
    });

    return res.redirect(`${env.frontendUrl}/auth/success`);
  } catch (error) {
    logger.error("[Auth Controller] Google login failed", error);

    const message = encodeURIComponent("Google login failed");

    return res.redirect(`${env.frontendUrl}/auth/error?message=${message}`);
  }
};

export const getMe = async (req: Request, res: Response) => {
  logger.info("[Auth Controller] GET /auth/me");

  const user = await getCurrentUserFromToken(req.cookies.access_token);

  if (!user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  return res.status(200).json({ user });
};

export const logout = (req: Request, res: Response) => {
  logger.info("[Auth Controller] POST /auth/logout");

  res.clearCookie("access_token");

  return res.status(200).json({
    message: "Logged out",
  });
};
