const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "project_thumbnails",
        allowed_formats: ["jpg", "png", "jpeg", "webp"]
    },
});

const projectUpload = multer({ storage });

module.exports = projectUpload;
