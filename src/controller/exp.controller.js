const Experience = require("../models/exp.model")


// ---------------- CREATE EXPERIENCE ----------------
const createExperience = async (req, res) => {
    try {
        const { designation, company, desc, startYear, endYear, keyAchievement, learn } = req.body;

        // ------------------ Validation ------------------
        if (!designation || !company || !desc || !startYear) {
            return res.status(400).json({
                message: "Missing required fields: designation, company, desc, startYear are mandatory",
            });
        }

        // Optional: check if arrays are proper
        if (keyAchievement && !Array.isArray(keyAchievement)) {
            return res.status(400).json({ message: "keyAchievement must be an array" });
        }
        if (learn && !Array.isArray(learn)) {
            return res.status(400).json({ message: "learn must be an array" });
        }

        // ------------------ Set default endYear ------------------
        const finalEndYear = endYear || "Present";

        // ------------------ Create Experience ------------------
        const exp = new Experience({
            designation,
            company,
            desc,
            startYear,
            endYear: finalEndYear,
            keyAchievement: keyAchievement || [],
            learn: learn || [],
        });

        await exp.save();

        res.status(201).json({ message: "Experience added successfully", experience: exp });
    } catch (error) {
        console.error("Create Experience Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ---------------- GET ALL EXPERIENCE ----------------
const getAllExperience = async (req, res) => {
    try {
        const exps = await Experience.find();

        const sortedExps = exps.sort((a, b) => {
            const aEnd = a.endYear === "Present" ? Number.MAX_SAFE_INTEGER : parseInt(a.endYear);
            const bEnd = b.endYear === "Present" ? Number.MAX_SAFE_INTEGER : parseInt(b.endYear);
            return bEnd - aEnd;
        });

        res.status(200).json(sortedExps);
    } catch (error) {
        console.error("Get All Experience Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ---------------- GET SINGLE EXPERIENCE ----------------
const getExperienceById = async (req, res) => {
    try {
        const exp = await Experience.findById(req.params.id);
        if (!exp) return res.status(404).json({ message: "Experience not found" });
        res.status(200).json(exp);
    } catch (error) {
        console.error("Get Experience Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ---------------- UPDATE EXPERIENCE ----------------
const updateExperience = async (req, res) => {
    try {
        const updatedExp = await Experience.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedExp) {
            return res.status(404).json({ message: "Experience not found" });
        }

        res.status(200).json({
            message: "Experience updated successfully",
            experience: updatedExp,
        });
    } catch (error) {
        console.error("Update Experience Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ---------------- DELETE EXPERIENCE ----------------
const deleteExperience = async (req, res) => {
    try {
        const deletedExp = await Experience.findByIdAndDelete(req.params.id);
        if (!deletedExp) return res.status(404).json({ message: "Experience not found" });
        res.status(200).json({ message: "Experience deleted successfully" });
    } catch (error) {
        console.error("Delete Experience Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    createExperience,
    getAllExperience,
    getExperienceById,
    updateExperience,
    deleteExperience,
};
