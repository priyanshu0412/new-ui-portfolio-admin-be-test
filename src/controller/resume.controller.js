const cloudinary = require("../config/cloudinary");
const Resume = require("../models/resume.model");

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const resume = await Resume.create({
            name: req.file.originalname,     // <-- resume name
            url: req.file.path,              // cloudinary URL
            publicId: req.file.filename      // cloudinary public_id
        });

        res.json({ success: true, resume });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Upload error" });
    }
};

const getResume = async (req, res) => {
    try {
        const resumes = await Resume.find().sort({ createdAt: -1 });
        return res.json(resumes);
    } catch {
        return res.status(500).json({ message: "Error loading resumes" });
    }
};

const getActiveResume = async (req, res) => {
    try {
        const active = await Resume.findOne({ isActive: true });

        if (!active) {
            return res.status(404).json({ message: "No active resume found" });
        }

        return res.json(active);
    } catch {
        return res.status(500).json({ message: "Error fetching active resume" });
    }
};

const setActiveResume = async (req, res) => {
    try {
        await Resume.updateMany({}, { isActive: false });
        await Resume.findByIdAndUpdate(req.params.id, { isActive: true });

        return res.json({ success: true, message: "Active resume updated" });
    } catch {
        return res.status(500).json({ message: "Error setting active resume" });
    }
};

const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) return res.status(404).json({ message: "Not found" });

        await cloudinary.uploader.destroy(resume.publicId, {
            resource_type: "raw",
        });

        await Resume.findByIdAndDelete(req.params.id);

        return res.json({ success: true, message: "Resume deleted" });
    } catch {
        return res.status(500).json({ message: "Delete failed" });
    }
};

module.exports = {
    uploadResume,
    getResume,
    getActiveResume,
    setActiveResume,
    deleteResume
};
