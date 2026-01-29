const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/auth'); 
const Profile = require('../models/Profile'); // Updated to lowercase 'profile' to match your file explorer
const upload = require('../config/cloudinary'); 

// 1. PUBLIC ROUTE: Guaranteed JSON structure for the Professional UI
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.findOne();
        
        // Return a complete structure to support the new UI containers
        if (!profile) {
            return res.json({
                fullName: "Portfolio User",
                bio: "Full-stack Developer",
                aboutMe: "",
                email: "",
                resumeUrl: "",
                socials: { github: '', linkedin: '', twitter: '' },
                skills: [],
                experience: [],
                projects: [],
                education: []
            });
        }

        // Deep merge/defaults to ensure UI doesn't break on missing sub-fields
        const safeData = {
            ...profile.toObject(),
            socials: profile.socials || { github: '', linkedin: '', twitter: '' },
            skills: profile.skills || [],
            experience: profile.experience || [],
            projects: profile.projects || [],
            education: profile.education || []
        };

        res.json(safeData);
    } catch (err) {
        console.error("Route Error:", err);
        res.status(500).json({ 
            message: "Error fetching profile",
            socials: { github: '', linkedin: '', twitter: '' },
            experience: [], 
            projects: [], 
            skills: [], 
            education: [] 
        });
    }
});

// 2. PROTECTED ROUTE: Sync via Resume
router.post('/sync', auth, upload.single('resume'), portfolioController.syncResume);

// 3. PROTECTED ROUTE: Manual Update (Developer Console)
// Explicitly defining fields to ensure Resume, Skill Icons, and Project Covers are captured
router.post('/manual-update', auth, upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'logo-0' }, { name: 'logo-1' }, { name: 'logo-2' }, { name: 'logo-3' }, { name: 'logo-4' },
    { name: 'projectCover-0' }, { name: 'projectCover-1' }, { name: 'projectCover-2' }, { name: 'projectCover-3' },
    { name: 'skillIcon-0' }, { name: 'skillIcon-1' }, { name: 'skillIcon-2' }, { name: 'skillIcon-3' }, 
    { name: 'skillIcon-4' }, { name: 'skillIcon-5' }, { name: 'skillIcon-6' }, { name: 'skillIcon-7' },
    { name: 'skillIcon-8' }, { name: 'skillIcon-9' }, { name: 'skillIcon-10' } // Added extra slots to prevent Multer "Unexpected field" errors
]), portfolioController.updatePortfolioManual);

module.exports = router;