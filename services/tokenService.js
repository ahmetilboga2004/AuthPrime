import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import crypto from "crypto";
import redisService from "./redisService.js";

class TokenService {
    constructor() {
        this.access_token_secret = process.env.ACCESS_TOKEN_SECRET;
        this.refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
    }

    createBindingKey(ip, device) {
        // Burada hash işlemi yapıyoruz.
        // aynı ip ve aynı device girilirse aynı sonucu döndürüyor.
        const hash = crypto.createHash("sha256");
        hash.update(`${ip}-${device}`);
        return hash.digest("hex");
    }

    generateAccessToken(userData, ip, device, expiresIn = "15m") {
        const jti = uuid();
        const bindingKey = this.createBindingKey(ip, device);
        try {
            return jwt.sign(
                { userData, jti, bindingKey },
                this.access_token_secret,
                {
                    expiresIn,
                }
            );
        } catch (error) {
            throw new Error("Token oluşturma hatası");
        }
    }

    generateRefreshToken(userData, ip, device, expiresIn = "7d") {
        const jti = uuid();
        const bindingKey = this.createBindingKey(ip, device);
        try {
            const token = jwt.sign(
                { userData, jti, bindingKey },
                this.refresh_token_secret,
                {
                    expiresIn,
                }
            );
            return { refreshToken: token, jti };
        } catch (error) {
            throw new Error("Token oluşturma hatası");
        }
    }

    verifyAccessToken(token, ip, device) {
        try {
            const bindingKey = this.createBindingKey(ip, device);
            const decoded = jwt.verify(token, this.access_token_secret);
            if (decoded.bindingKey === bindingKey) {
                return decoded;
            }
        } catch (error) {
            return null;
        }
    }

    async verifyRefreshToken(token, ip, device) {
        try {
            const bindingKey = this.createBindingKey(ip, device);
            const decoded = jwt.verify(token, this.refresh_token_secret);
            if (decoded.bindingKey !== bindingKey) {
                return null;
            }

            const session = await redisService.getSession(
                decoded.userData.id,
                decoded.jti
            );
            if (!session) {
                return null;
            }
            return decoded;
        } catch (error) {
            return null;
        }
    }

    decodeToken(token) {
        return jwt.decode(token);
    }
}

const tokenService = new TokenService();
export default tokenService;
