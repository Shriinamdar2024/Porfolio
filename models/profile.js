const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    role: String,
    company: String,
    companyLogo: String, // ADDED: To store the uploaded logo URL from the UI
    duration: String, 
    description: String,
});

const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    coverImage: String,
    githubLink: String,
    liveLink: String,
    category: String 
});

const educationSchema = new mongoose.Schema({
    degree: String,
    college: String,
    year: String,
    status: String, 
    grade: String
});

const skillSchema = new mongoose.Schema({
    name: String,
    iconUrl: String
});

const profileSchema = new mongoose.Schema({
    fullName: String,
    bio: String,
    aboutMe: String, 
    email: String,
    resumeUrl: String,
    socials: {
        github: String,
        linkedin: String,
        twitter: String
    },
    skills: [skillSchema],
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);