import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  getGoogleAuthUrl,
  getGoogleUserFromCode,
} from "./google-oauth.service";
import {
  createUserWithGoogleAccount,
  findUserByGoogleId,
} from "../users/user.repository";

export const createGoogleLoginUrl = () => {
  console.log("[Auth Service] Creating OAuth state");

  const state = crypto.randomBytes(32).toString("hex");
  const url = getGoogleAuthUrl(state);

  console.log("[Auth Service] Google login URL created");

  return { url, state };
};

export const handleGoogleCallback = async (code: string) => {
  console.log("[Auth Service] Handling Google callback");

  const googleUser = await getGoogleUserFromCode(code);

  if (!googleUser.email) {
    throw new Error("Google account does not have an email");
  }

  console.log("[Auth Service] Searching user by Google ID");

  let user = await findUserByGoogleId(googleUser.googleId);

  if (!user) {
    console.log("[Auth Service] User not found. Creating user");

    user = await createUserWithGoogleAccount({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.avatarUrl,
      emailVerified: googleUser.emailVerified,
    });
  } else {
    console.log("[Auth Service] Existing user found", {
      userId: user.id,
      email: user.email,
    });
  }

  console.log("[Auth Service] Creating application JWT");

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  console.log("[Auth Service] Login completed", {
    userId: user.id,
    email: user.email,
  });

  return { user, token };
};
