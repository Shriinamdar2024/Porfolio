const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Looking for "Bearer <token>"
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { admin: decodedToken.admin };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Auth failed: Token invalid or missing" });
    }
};