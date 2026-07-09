import { Router } from "express";
import { googleCallback, googleLogin } from "../controllers/auth.controller";

const router = Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

export default router;
