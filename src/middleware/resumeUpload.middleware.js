const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "resumes",
        resource_type: "raw",
        allowed_formats: ["pdf"],
        public_id: (req, file) => {
            return Date.now() + "-" + file.originalname.replace(/\s/g, "");
        }
    }
});

const resumeUpload = multer({ storage });

module.exports = resumeUpload;
