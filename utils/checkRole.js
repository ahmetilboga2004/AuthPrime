function checkRole(role) {
    const roles = ["admin", "user"];
    if (!roles.includes(role)) {
        return false;
    }
    return true;
}

export default checkRole;
