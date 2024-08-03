export const myProfile = (req, res, next) => {
    // Burda profil bilgileri alınacak
    return res.status(200).json({
        message: "Profil bilgileriniz başarılı bir şekilde alındı",
    });
};
export const getUserProfile = (req, res, next) => {
    // Burda profil bilgileri alınacak
    return res.status(200).json({
        message: "Profil bilgisi başarılı bir şekilde alındı",
    });
};

export const updateProfile = (req, res, next) => {
    // Burda profil güncelleme işlemleri yapılacak
    return res.status(200).json({
        message: "Profil bilgileriniz başarılı bir şekilde güncellendi",
    });
};

export const deleteAccount = (req, res, next) => {
    // Burda hesap silme işlemleri yapıalcak
    return res.status(200).json({
        message: "Hesabınız başarılı bir şekilde silindi",
    });
};
