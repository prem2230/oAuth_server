import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getGoogleAuthUrl, getGoogleUserFromCode } from "./google-oauth.service";
import {
    createUserWithGoogleAccount,
    findUserByGoogleId,
} from "../users/user.repository";

export const createGoogleLoginUrl = () => {
    const state = crypto.randomBytes(32).toString("hex");
    const url = getGoogleAuthUrl(state);

    return { url, state };
};

export const handleGoogleCallback = async (code: string) => {
    const googleUser = await getGoogleUserFromCode(code);

    if (!googleUser.email) {
        throw new Error("Google account does not have an email");
    }

    let user = await findUserByGoogleId(googleUser.googleId);

    if (!user) {
        user = await createUserWithGoogleAccount({
            googleId: googleUser.googleId,
            email: googleUser.email,
            name: googleUser.name,
            avatarUrl: googleUser.avatarUrl,
            emailVerified: googleUser.emailVerified,
        });
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "7d",
        }
    );

    return { user, token };
};