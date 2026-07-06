import { Request, Response } from "express";
import { createGoogleLoginUrl, handleGoogleCallback } from "./auth.service";

export const googleLogin = (req: Request, res: Response) => {
  console.log("[Auth Controller] GET /auth/google");

  const { url, state } = createGoogleLoginUrl();

  console.log("[Auth Controller] Saving OAuth state cookie");

  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 10 * 60 * 1000,
  });

  console.log("[Auth Controller] Redirecting browser to Google");

  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    console.log("[Auth Controller] GET /auth/google/callback");

    const { code, state } = req.query;
    const savedState = req.cookies.google_oauth_state;

    if (!code || typeof code !== "string") {
      console.log("[Auth Controller] Missing authorization code");

      return res.status(400).json({
        message: "Missing authorization code",
      });
    }

    if (!state || state !== savedState) {
      console.log("[Auth Controller] Invalid OAuth state", {
        hasState: Boolean(state),
        hasSavedState: Boolean(savedState),
      });

      return res.status(400).json({
        message: "Invalid OAuth state",
      });
    }

    console.log("[Auth Controller] OAuth state is valid");

    const { user, token } = await handleGoogleCallback(code);

    console.log("[Auth Controller] Clearing OAuth state cookie");

    res.clearCookie("google_oauth_state");

    console.log("[Auth Controller] Saving access token cookie");

    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Google login successful",
      user,
    });
  } catch (error) {
    console.error("[Auth Controller] Google login failed", error);

    return res.status(500).json({
      message: "Google login failed",
    });
  }
};
