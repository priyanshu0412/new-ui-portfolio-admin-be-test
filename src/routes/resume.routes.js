const express = require("express");
const resumeUpload = require("../middleware/resumeUpload.middleware");
const authMiddleware = require("../middleware/auth.middleware");

const {
    uploadResume,
    getResume,
    getActiveResume,
    setActiveResume,
    deleteResume
} = require("../controller/resume.controller");

const router = express.Router();

router.post("/upload", authMiddleware, resumeUpload.single("resume"), uploadResume);
router.get("/", authMiddleware, getResume);
router.get("/active", getActiveResume);
router.put("/set-active/:id", authMiddleware, setActiveResume);
router.delete("/:id", authMiddleware, deleteResume);

module.exports = router;
