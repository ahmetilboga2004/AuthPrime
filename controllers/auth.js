import User from "../models/user.js";
import ApiError from "../utils/apiError.js";
import sendResponse from "../utils/sendResponse.js";
import bcrypt from "bcrypt";
import tokenService from "../services/tokenService.js";
import validateBody from "../utils/validateBody.js";
import redisService from "../services/redisService.js";

export const register = async (req, res, next) => {
    try {
        const { firstName, lastName, username, password, role } = req.body;
        const userRole = role || "user";

        validateBody(userRole, firstName, lastName, username, password);

        const user = await User.create({
            firstName,
            lastName,
            username,
            password,
            role: userRole,
        });
        // Şifre alanını manuel olarak sil
        const userWithoutPassword = user.toJSON();
        delete userWithoutPassword.password;
        sendResponse(res, 201, "Kullanıcı kaydı başarılı", userWithoutPassword);
    } catch (error) {
        return next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, password, role } = req.body;

        const userRole = role || "user";
        validateBody(userRole, username, password);

        const user = await User.findOne({
            where: {
                username,
                role: userRole,
            },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new ApiError("Geçersiz kullanıcı adı veya şifre", 401);
        }

        const userData = {
            id: user.id,
            username: user.username,
            role: user.role,
        };

        const accessToken = tokenService.generateAccessToken(
            userData,
            req.ip,
            req.ua
        );
        const { refreshToken, jti } = tokenService.generateRefreshToken(
            userData,
            req.ip,
            req.ua
        );
        await redisService.setSession(user.id, jti, refreshToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development" ? false : true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.setHeader("x-new-token", accessToken);
        sendResponse(res, 200, "Giriş başarılı", {});
    } catch (error) {
        return next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        const refreshToken = cookies.refreshToken;

        if (!refreshToken) {
            throw new ApiError("Oturum bulunamadı", 404);
        }
        // burda güvenlik amaçlı gelen refreshToeknin ip ve device bilgisini kontrol etmemiz lazım önceden.
        const decodedToken = await tokenService.verifyRefreshToken(
            refreshToken,
            req.ip,
            req.ua
        );
        if (!decodedToken) {
            throw new ApiError("Geçersiz Token", 400);
        }
        await redisService.delSession(
            decodedToken.userData.id,
            decodedToken.jti
        );

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "None",
            secure: false,
        });
        sendResponse(res, 200, "Başarılı bir şekilde çıkış yapıldı");
    } catch (error) {
        return next(error);
    }
};

export const closeSession = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const userId = req.user.id;
        await redisService.delSession(userId, sessionId);
        sendResponse(res, 200, "Başarılı bir şekilde çıkış yapıldı");
    } catch (error) {
        return next(error);
    }
};

export const closeAllSession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await redisService.delAllSessions(userId);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "None",
            secure: false,
        });
        sendResponse(res, 200, "Tüm cihazlardan çıkış yapıldı");
    } catch (error) {
        return next(error);
    }
};
