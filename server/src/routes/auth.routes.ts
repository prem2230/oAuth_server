import { Router } from "express";
import {
  getMe,
  googleCallback,
  googleLogin,
  logout,
} from "../controllers/auth.controller";

const router = Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/me", getMe);
router.post("/logout", logout);

export default router;
