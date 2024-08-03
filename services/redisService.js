import redisClient from "../config/redis.js";
import tokenService from "./tokenService.js";

class RedisService {
    calculateTTL(decodedToken) {
        if (
            !decodedToken ||
            typeof decodedToken !== "object" ||
            !decodedToken.exp
        ) {
            // Eğer token geçersizse veya exp özelliği yoksa, varsayılan bir TTL döndürebiliriz
            return 3600; // Örneğin, 1 saat
        }
        const { exp } = decodedToken;
        return Math.max(Math.floor(exp - Date.now() / 1000), 0);
    }

    generateTokenKey(userId = "*", jti = "*") {
        return `session:${userId}:${jti}`;
    }

    async setSession(userId, jti, token) {
        const key = this.generateTokenKey(userId, jti);
        const decodedToken = tokenService.decodeToken(token);
        if (!decodedToken) {
            throw new Error("Geçersiz token");
        }
        const ttl = this.calculateTTL(decodedToken);
        await redisClient.setex(key, ttl, token);
    }

    async delSession(userId, jti) {
        const key = this.generateTokenKey(userId, jti);
        await redisClient.del(key);
    }

    async delAllSessions(userId) {
        if (!userId) {
            throw new Error("Lütfen kullanıcı id girin");
        }
        const pattern = this.generateTokenKey(userId);
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        return keys.length;
    }

    async getSession(userId, jti) {
        const key = this.generateTokenKey(userId, jti);
        const token = await redisClient.get(key);
        if (!token) {
            return null;
        }
        const decodedToken = tokenService.decodeToken(token);

        return { token, decodedToken };
    }

    async getAllSessionsByUser(userId) {
        if (!userId) {
            throw new Error("Lütfen kullanıcı id girin");
        }
        const pattern = this.generateTokenKey(userId);
        const keys = await redisClient.keys(pattern);
        const sessions = [];
        for (const key of keys) {
            const data = await redisClient.get(key);
            sessions.push({ key, data });
        }
        return sessions;
    }

    async getAllSessions() {
        const pattern = this.generateTokenKey();
        const keys = await redisClient.keys(pattern);
        const sessions = [];
        for (const key of keys) {
            const data = await redisClient.get(key);
            sessions.push({ key, data });
        }
        return sessions;
    }
}
const redisService = new RedisService();

export default redisService;
