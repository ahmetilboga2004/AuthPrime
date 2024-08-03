import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    // 15 dakika süre belirltiyoprız
    windowMs: 15 * 60 * 1000,
    // Her IP 15 dakikada sadece 100 istke atabilecek
    max: 100,
});

export default limiter;
