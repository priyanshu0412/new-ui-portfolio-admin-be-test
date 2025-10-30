const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "blogs_thumbnails",
        allowed_formats: ["jpg", "png", "jpeg", "webp"]
    },
});

const blogUpload = multer({ storage });

module.exports = blogUpload;
