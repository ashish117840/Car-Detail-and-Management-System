const multer = require('multer');
const path = require('path');

// Check if running on Vercel / Cloudinary enabled
const isVercel = process.env.VERCEL === '1';
const hasCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;

// Set up storage engine based on environment
let storage;

if (isVercel || hasCloudinary) {
  // Use memory storage when on serverless or when we'll upload to Cloudinary
  storage = multer.memoryStorage();
} else {
  // Use disk storage for local development
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/cars/');
    },
    filename: function (req, file, cb) {
      // Create unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
