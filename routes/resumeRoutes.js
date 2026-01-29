const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadResume } = require('../controllers/resumeController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST endpoint to sync resume
router.post('/sync', upload.single('resume'), uploadResume);

module.exports = router;