const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder and format based on file type
    const isPdf = file.mimetype === 'application/pdf';
    
    return {
      folder: 'portfolio_assets',
      // Added 'pdf' and 'svg' to support Resume and modern Skill Icons
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'svg', 'webp'],
      // 'auto' is essential for handling mixed media (Images + PDF)
      resource_type: 'auto',
      // Ensures PDFs are handled as documents and images are optimized
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit to handle high-res project covers
});

module.exports = upload;