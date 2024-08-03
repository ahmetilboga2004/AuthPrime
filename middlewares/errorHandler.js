import sendResponse from "../utils/sendResponse.js";
import {
    ValidationError,
    UniqueConstraintError,
    ForeignKeyConstraintError,
    DatabaseError,
} from "sequelize";
import ApiError from "../utils/apiError.js";
import logger from "../config/winston.js";

const errorHandler = (err, req, res, next) => {
    logger.error(err);

    if (err instanceof ValidationError) {
        // Sequlelize validasyon hataları
        const validationErrors = err.errors.map((error) => ({
            field: error.path,
            message: error.message,
        }));
        return sendResponse(
            res,
            400,
            "Girilen bilgilerde hata var. Lütfen eksik veya yanlış alanları kontrol edin.",
            { validationErrors }
        );
    } else if (err instanceof UniqueConstraintError) {
        // Sequelize unique alanlar için oluşan hatalar
        return sendResponse(
            res,
            409,
            "Bu bilgilerle zaten bir kayıt mevcut. Lütfen başka bilgiler deneyin.",
            null
        );
    } else if (err instanceof ForeignKeyConstraintError) {
        // Burası da sequelize ilişkisel kodlardaki hatalar
        return sendResponse(
            res,
            400,
            "İlişkili veri bulunamadı. Lütfen girdiğiniz bilgileri kontrol edin.",
            null
        );
    } else if (err instanceof DatabaseError) {
        // genel sequeize hataları
        return sendResponse(
            res,
            500,
            "İşleminiz şu anda gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.",
            null
        );
    }

    // Özel API hatalarımızı burda yakalıyoruz. ApiError ile oluşturduğumuz hatalar buerya düşeck
    if (err instanceof ApiError) {
        return sendResponse(res, err.statusCode, err.message, null);
    }

    const statusCode = err.statusCode || 500;
    const message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
    sendResponse(
        res,
        statusCode,
        message,
        process.env.NODE_ENV === "development" ? err : null
    );
};

export default errorHandler;
