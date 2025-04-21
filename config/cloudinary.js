const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Corrected environment variable
  api_key: process.env.CLOUDINARY_API_KEY,       // Corrected environment variable
  api_secret: process.env.CLOUDINARY_API_SECRET  // Corrected environment variable
});

module.exports = cloudinary;
