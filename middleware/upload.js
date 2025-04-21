const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "social-app",
    allowed_formats: ["jpg", "png", "mp4"],
  },
});

module.exports = multer({ storage });
