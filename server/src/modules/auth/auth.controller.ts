import { Request, Response } from "express";
import { createGoogleLoginUrl, handleGoogleCallback } from "./auth.service";

export const googleLogin = (req: Request, res: Response) => {
    const { url, state } = createGoogleLoginUrl();

    res.cookie("google_oauth_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 10 * 60 * 1000,
    });

    res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;
        const savedState = req.cookies.google_oauth_state;

        if (!code || typeof code !== "string") {
            return res.status(400).json({
                message: "Missing authorization code",
            });
        }

        if (!state || state !== savedState) {
            return res.status(400).json({
                message: "Invalid OAuth state",
            });
        }

        const { user, token } = await handleGoogleCallback(code);

        res.clearCookie("google_oauth_state");

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
        return res.status(500).json({
            message: "Google login failed",
        });
    }
};