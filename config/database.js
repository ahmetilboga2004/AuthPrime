import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import logger from "./winston.js";
dotenv.config();

// Veritabanını tanımlıyoruz
const sequelize = new Sequelize(
    // Veritabanı adı
    process.env["DB_NAME"],
    // Veritabanı kullanıcısı
    process.env["DB_USER"],
    // Kullanıcı şifresi
    process.env["DB_PASSWORD"],
    {
        host: process.env["DB_HOST"],
        dialect: "postgres",
    }
);

// Veritabanı senkronizasyonu ve testi
export async function connectDb() {
    await sequelize.sync({
        alter: process.env.NODE_ENV === "development",
        logging: false,
    });
    // Bağlantıyı test etmek için authenticate() kullanabilirsiniz
    await sequelize.authenticate();
    logger.info("Veritabanı bağlantısı başarıyla kuruldu.");
}

export default sequelize;
