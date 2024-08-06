import { Router } from "express";
const router = Router();

import * as auth from "../controllers/auth.js";
import { requireAuth, questOnly } from "../middlewares/authentication.js";
import { body, param } from "express-validator";

router.post(
    "/register",
    questOnly,
    body("firstName").notEmpty().isAlpha("tr-TR").isLength({ min: 2, max: 50 }),
    body("lastName").notEmpty().isAlpha("tr-TR").isLength({ min: 2, max: 50 }),
    body("username")
        .notEmpty()
        .isAlphanumeric("tr-TR")
        .isLength({ min: 6, max: 30 }),
    body("password").notEmpty().isAlphanumeric().isLength({ min: 6, max: 30 }),
    auth.register
);
router.post(
    "/login",
    questOnly,
    body("username")
        .notEmpty()
        .isAlphanumeric("tr-TR")
        .isLength({ min: 6, max: 30 }),
    body("password").notEmpty().isAlphanumeric().isLength({ min: 6, max: 30 }),
    auth.login
),
    router.get("/logout", requireAuth, auth.logout);
router.get("/close-sessions", requireAuth, auth.closeAllSession);
router.get(
    "/close-sessions/:id",
    requireAuth,
    param("id").notEmpty().isNumeric(),
    auth.closeSession
);

export default router;
