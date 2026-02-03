const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    // The password received here is now the SHA-512 hash from the frontend
    const { password } = req.body;

    // SECURE: Strict comparison with the hashed value in .env
    if (password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
            { admin: true }, 
            process.env.JWT_SECRET, 
            { expiresIn: '12h' }
        );
        return res.json({ token });
    }

    // Generic error to prevent brute-force discovery
    res.status(401).json({ message: "SEC_ERROR: ACCESS_DENIED" });
};