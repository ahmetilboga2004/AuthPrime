import { Router } from "express";
const router = Router();

import { register, login, logout } from "../../controllers/auth.js";
import { requireAuth, questOnly } from "../../middlewares/authentication.js";

router.post("/register", questOnly, register);
router.post("/login", questOnly, login);
router.delete("/logout", requireAuth, logout);

export default router;
