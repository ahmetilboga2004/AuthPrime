import ApiError from "./apiError.js";
import checkRole from "./checkRole.js";

function validateBody(userRole, ...user) {
    if (!user.every((value) => !!value)) {
        throw new ApiError("Gerekli alanları doldurun", 400);
    }

    if (!checkRole(userRole)) {
        throw new ApiError("Geçersiz bir rol girdiniz", 400);
    }
}

export default validateBody;
