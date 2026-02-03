const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Missing_Token');
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userData = { admin: decodedToken.admin };
        next();
    } catch (error) {
        return res.status(401).json({ 
            message: "SECURITY_BREACH: Authentication token invalid" 
        });
    }
};