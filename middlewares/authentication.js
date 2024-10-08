import redisService from "../services/redisService.js";
import tokenService from "../services/tokenService.js";
import ApiError from "../utils/apiError.js";

export const authentication = (req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization || req.headers["authorization"];

        if (!authHeader) {
            return handleRefreshToken(req, res, next);
        }

        const accessToken = authHeader.split(" ")[1];

        if (!accessToken) {
            return handleRefreshToken(req, res, next);
        }

        const decodedAccessToken = tokenService.verifyAccessToken(
            accessToken,
            req.ip,
            req.ua
        );
        if (!decodedAccessToken) {
            return handleRefreshToken(req, res, next);
        }

        req.user = decodedAccessToken.userData;
        return next();
    } catch (error) {
        return next(error);
    }
};

const handleRefreshToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;

        if (token) {
            const decodedRefreshToken = await tokenService.verifyRefreshToken(
                token,
                req.ip,
                req.ua
            );

            if (decodedRefreshToken) {
                const newAccessToken = tokenService.generateAccessToken(
                    decodedRefreshToken.userData,
                    req.ip,
                    req.ua
                );

                if (newAccessToken) {
                    res.setHeader("x-new-token", newAccessToken);
                    req.user = decodedRefreshToken.userData;
                }
            }
        }
        return next();
    } catch (error) {
        return next(error);
    }
};

export const requireAuth = (req, res, next) => {
    try {
        if (!req.user) throw new ApiError("Lütfen giriş yapın", 401);
        return next();
    } catch (error) {
        return next(error);
    }
};

export const questOnly = (req, res, next) => {
    try {
        if (req.user) throw new ApiError("Zaten oturum açık", 403);
        return next();
    } catch (error) {
        return next(error);
    }
};

export const authRole = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            return next();
        } else {
            return next(new ApiError("Yetkisiz eylem", 403));
        }
    };
};

export const authorizeUser = (req, res, next) => {
    if (req.user.id !== req.params.id) {
        return next(new ApiError("Yetkisiz eylem", 403));
    }
    return next();
};
