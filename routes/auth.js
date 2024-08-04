import { Router } from "express";
const router = Router();

import * as auth from "../controllers/auth.js";
import { requireAuth, questOnly } from "../middlewares/authentication.js";

router.post("/register", questOnly, auth.register);
router.post("/login", questOnly, auth.login);
router.get("/logout", requireAuth, auth.logout);
router.get("/close-sessions", requireAuth, auth.closeAllSession);
router.get("/close-sessions/:id", requireAuth, auth.closeSession);

export default router;
