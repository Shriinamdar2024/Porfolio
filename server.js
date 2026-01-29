require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (for uploaded resumes/images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debugging Logs
console.log("📡 System Booting...");
console.log("📦 Mongo URI:", process.env.MONGO_URI ? "DETECTED" : "MISSING");

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Route Mounting
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/auth', require('./routes/auth'));

// 404 Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.url} Not Found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API Server running on port ${PORT}`));   