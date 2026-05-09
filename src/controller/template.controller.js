const Template = require("../models/template.model");


// ---------------- CREATE TEMPLATE ----------------
const createTemplate = async (req, res) => {
    try {
        const { name, liveUrl, githubUrl, date, category } = req.body;

        const template = new Template({ name, liveUrl, githubUrl, date, category });
        await template.save();

        // Populate category before returning
        const populated = await template.populate("category");
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ---------------- GET ALL TEMPLATES ----------------
const getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.find()
            .populate("category")
            .sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ---------------- GET TEMPLATE BY ID ----------------
const getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id).populate("category");
        if (!template) return res.status(404).json({ message: "Template not found" });
        res.status(200).json(template);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ---------------- UPDATE TEMPLATE ----------------
const updateTemplate = async (req, res) => {
    try {
        const template = await Template.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate("category");

        if (!template) return res.status(404).json({ message: "Template not found" });
        res.status(200).json(template);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ---------------- DELETE TEMPLATE ----------------
const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findByIdAndDelete(req.params.id);
        if (!template) return res.status(404).json({ message: "Template not found" });
        res.status(200).json({ message: "Template deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
};
