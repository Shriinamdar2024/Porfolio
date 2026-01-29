const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    // 1. Get the password from the frontend request
    const { password } = req.body;
    console.log("Password from .env:", process.env.ADMIN_PASSWORD);
  console.log("Password entered by you:", password);
    // 2. Compare it with the .env variable
    // Check if process.env.ADMIN_PASSWORD is being read correctly
    if (password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
            { admin: true }, 
            process.env.JWT_SECRET, 
            { expiresIn: '12h' }
        );
        return res.json({ token });
    }

    // 3. If it fails, send 401 (This is what you are seeing)
    res.status(401).json({ message: "Invalid Admin Credentials" });
};