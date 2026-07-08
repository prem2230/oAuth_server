import { OAuth2Client } from "google-auth-library";
import { GoogleUser } from "../users/user.types";

const createGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !callbackUrl) {
    throw new Error(
      "Missing Google OAuth env values. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.",
    );
  }

  return new OAuth2Client(clientId, clientSecret, callbackUrl);
};

export const getGoogleAuthUrl = (state: string): string => {
  console.log("[Google OAuth] Creating Google authorization URL");

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
  console.log("[Google OAuth] Exchanging authorization code for tokens");

  const googleClient = createGoogleClient();

  const { tokens } = await googleClient.getToken(code);

  if (!tokens.id_token) {
    throw new Error("No id_token received from Google");
  }

  console.log("[Google OAuth] Verifying Google ID token");

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token");
  }

  console.log("[Google OAuth] Google user verified", {
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
