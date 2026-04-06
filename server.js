require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // local dev
  "http://localhost:3000", // optional
  "https://portfolio-frontend-ukut.vercel.app" // your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Not Allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (Keep this if you still have local files, 
// but Cloudinary replaces the need for this in production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log("📡 System Booting...");
console.log("📦 Mongo URI:", process.env.MONGO_URI ? "DETECTED" : "MISSING");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/auth', require('./routes/auth'));

app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.url} Not Found` });
});

// 2. UPDATED PORT: Render uses a dynamic port. 
// Adding '0.0.0.0' helps Render's network routing.
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Server running on port ${PORT}`);
});