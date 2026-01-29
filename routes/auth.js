const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const { password } = req.body;

    // Debugging logs to see what's happening in the terminal
    console.log("Password from .env:", process.env.ADMIN_PASSWORD);
    console.log("Password entered by user:", password);

    if (password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
            { admin: true }, 
            process.env.JWT_SECRET, 
            { expiresIn: '12h' }
        );
        console.log("✅ Login Successful! Token generated.");
        return res.json({ token });
    }

    console.log("❌ Login Failed: Incorrect password.");
    res.status(401).json({ message: "Invalid credentials" });
});

module.exports = router;