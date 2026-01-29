const pdf = require('pdf-parse');
const Profile = require('../models/profile');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // 1. Parse the PDF Buffer
    const data = await pdf(req.file.buffer);
    const rawText = data.text;

    // 2. Logic to extract info (Simplified example)
    // In a real scenario, you'd use RegEx or an AI API to clean this up
    const extractedSkills = rawText.match(/(JavaScript|React|Node|MongoDB|Express|Tailwind)/gi);
    
    // 3. Update the Portfolio Data in MongoDB
    const updatedProfile = await Profile.findOneAndUpdate(
      {}, // Finds the first profile (yours)
      { 
        skills: [...new Set(extractedSkills)], // Remove duplicates
        resumeUrl: "path/to/uploaded/file.pdf", // Usually a Cloudinary link
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Portfolio synced with resume!", data: updatedProfile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};