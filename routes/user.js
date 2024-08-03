import e from "express";
const router = e.Router();

import * as user from "../controllers/user.js";
import { authorizeUser } from "../middlewares/authentication.js";

// Kullanıcının kendi profil bilgisini alacağı api
router.get("/me", user.myProfile);
router.get("/profile/:id", user.getUserProfile);
// Bundan sonraki tüm routerlar için yetki kontrolü yapılıyor
router.use(authorizeUser);
router.put("/update-profile/:id", user.updateProfile);
router.delete("/delete-account/:id", user.deleteAccount);

export default router;
