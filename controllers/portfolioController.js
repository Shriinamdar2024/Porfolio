const PDFParser = require("pdf2json");
const Profile = require('../models/Profile');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FUNCTION 1: AI Sync (Updated to force download flag)
exports.syncResume = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        // Force download by adding the attachment flag to the Cloudinary URL
        const resumeUrl = req.file.path.replace('/upload/', '/upload/fl_attachment/');

        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataReady", async () => {
            try {
                const pdfText = pdfParser.getRawTextContent();
                const prompt = `Extract data from this resume text into a strict JSON object. Identify "Software Developer Intern" at "INCRONIX" as experience. 
                Structure: { 
                    "fullName": "string", 
                    "email": "string", 
                    "bio": "string", 
                    "aboutMe": "string",
                    "socials": { "github": "", "linkedin": "", "twitter": "" },
                    "skills": [{ "name": "string", "iconUrl": "" }], 
                    "experience": [{ "role": "string", "company": "string", "duration": "string", "description": "string" }], 
                    "projects": [{ "title": "string", "description": "string", "githubLink": "", "liveLink": "" }],
                    "education": [{ "degree": "string", "college": "string", "year": "string", "status": "string", "grade": "string" }]
                } 
                Text: ${pdfText}`;

                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const jsonData = JSON.parse(response.text().replace(/```json|```/g, ""));
                
                const finalData = { ...jsonData, resumeUrl };

                const updatedProfile = await Profile.findOneAndUpdate({}, finalData, { upsert: true, new: true });
                res.status(200).json({ data: updatedProfile });
            } catch (err) {
                res.status(500).json({ message: "AI Parsing Failed", error: err.message });
            }
        });

        const buffer = req.file.buffer ? req.file.buffer : await require('fs').promises.readFile(req.file.path);
        pdfParser.parseBuffer(buffer);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// FUNCTION 2: Manual Update (Updated to force download flag)
exports.updatePortfolioManual = async (req, res) => {
    try {
        let experience = [];
        let projects = [];
        let skills = [];
        let education = [];
        let socials = { github: '', linkedin: '', twitter: '' };
        
        const existingProfile = await Profile.findOne({});
        let resumeUrl = req.body.resumeUrl || (existingProfile ? existingProfile.resumeUrl : "");

        try {
            experience = req.body.experience ? JSON.parse(req.body.experience) : [];
            projects = req.body.projects ? JSON.parse(req.body.projects) : [];
            skills = req.body.skills ? JSON.parse(req.body.skills) : [];
            education = req.body.education ? JSON.parse(req.body.education) : [];
            socials = req.body.socials ? JSON.parse(req.body.socials) : socials;
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return res.status(400).json({ message: "Invalid data format" });
        }

        if (req.files) {
            const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            
            filesArray.forEach((file) => {
                if (file.fieldname === 'resume') {
                    // Force download by adding the attachment flag to the Cloudinary URL
                    resumeUrl = file.path.replace('/upload/', '/upload/fl_attachment/');
                }
                
                if (file.fieldname.startsWith('logo-')) {
                    const index = parseInt(file.fieldname.split('-')[1]);
                    if (experience[index]) {
                        experience[index].companyLogo = file.path; 
                    }
                }
                
                if (file.fieldname.startsWith('projectCover-')) {
                    const index = parseInt(file.fieldname.split('-')[1]);
                    if (projects[index]) {
                        projects[index].coverImage = file.path;
                    }
                }
                
                if (file.fieldname.startsWith('skillIcon-')) {
                    const index = parseInt(file.fieldname.split('-')[1]);
                    if (skills[index]) {
                        skills[index].iconUrl = file.path;
                    }
                }
            });
        }

        const updatedProfile = await Profile.findOneAndUpdate(
            {}, 
            { 
                fullName: req.body.fullName || "",
                bio: req.body.bio || "",
                aboutMe: req.body.aboutMe || "",
                email: req.body.email || "",
                resumeUrl, 
                socials,
                skills,
                education, 
                experience, 
                projects,
                updatedAt: new Date() 
            }, 
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Update success", data: updatedProfile });
    } catch (error) {
        console.error("❌ BACKEND CRASH:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};