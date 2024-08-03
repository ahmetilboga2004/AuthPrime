import Redis from "ioredis";
import logger from "./winston.js";

const redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
});

redisClient.on("error", (err) => {
    logger.error("Redis error:", err);
});

redisClient.on("connect", () => {
    logger.info("Connected to Redis");
});

export default redisClient;
