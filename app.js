import e from "express";
// import cors from "cors";
// import { Redis } from "ioredis";
import morgan from "morgan";
import dotenv from "dotenv";
import parser from "ua-parser-js";
import cookieParser from "cookie-parser";
import logger from "./config/winston.js";
// Veritabanı bağlantısı modülünü import ediyoruz
import { connectDb } from "./config/database.js";
import { authentication } from "./middlewares/authentication.js";
import routes from "./routes/index.js";
import limiter from "./middlewares/limiter.js";
// Hata yakalama middleware
import errorHandler from "./middlewares/errorHandler.js";
const app = e();
dotenv.config();

// x-powered-by başlığını kaldırdık
app.disable("x-powered-by");
// json formatında verileri kabul ediyoruz.
app.use(e.json());
app.use(e.urlencoded({ extended: false }));
app.use(cookieParser());
// Rate Limiter
app.use(limiter);
// Loglama yapıyoruz
app.use(morgan("dev"));
// Her istekte gelen cihaz bilgisini alıyoruz
app.use((req, res, next) => {
    const ua = parser.UAParser(req.headers["user-agent"]);
    req.ua = ua;
    next();
});

app.use(authentication);
app.use("/api", routes);
app.use(errorHandler);

const port = process.env.PORT || 4000;
// Veritabanı bağlantısı başarılı ise sunucuyu başlatıyoruz
async function startServer() {
    try {
        await connectDb();
        app.listen(port, () => {
            logger.info("Sunucu http://localhost:${port} adresinde başlatıldı");
        });
    } catch (error) {
        logger.error(`Hata oluştu: ${error}`);
        process.exit(1);
    }
}

startServer();
