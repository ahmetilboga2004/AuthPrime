const sendResponse = (res, status, message = null, data = null) => {
    const response = {
        status: status >= 200 && status < 300,
        message: message || defaultMessage(status),
        data: data || null,
    };
    return res.status(status).json(response);
};

const defaultMessage = (status) => {
    const messages = {
        200: "İşlem başarılı",
        201: "Kayıt başarıyla oluşturuldu",
        204: "İçerik yok",
        400: "Geçersiz istek",
        401: "Yetkisiz erişim",
        403: "Erişim reddedildi",
        404: "Bulunamadı",
        500: "Sunucu hatası",
    };
    return messages[status] || "Bilinmeyen Durum";
};

export default sendResponse;
