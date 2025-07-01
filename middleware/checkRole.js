module.exports = (allowedRoles = []) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.Role))
            return res.status(403).json({message:'.ليس لديك صلاحية'});
        next();
    }
}