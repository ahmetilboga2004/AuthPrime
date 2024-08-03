import winston from "winston";
import path from "path";

const { combine, timestamp, printf, errors, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
    const stackTrace = stack ? stack.split("\n")[1].trim() : "";
    return `${timestamp} [${level}]: ${message} ${stackTrace}`;
});

const logger = winston.createLogger({
    level: "info",
    format: combine(errors({ stack: true }), timestamp(), customFormat),
    transports: [
        new winston.transports.File({
            filename: "error.log",
            level: "error",
        }),
        new winston.transports.File({
            filename: "combined.log",
            level: "info",
        }),
    ],
});

// Sadece development ortamında terminale log basmak için
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: combine(colorize(), timestamp(), customFormat),
        })
    );
}

export default logger;
