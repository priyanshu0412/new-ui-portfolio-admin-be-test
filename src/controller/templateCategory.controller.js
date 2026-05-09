const TemplateCategory = require("../models/templateCategory.model");


// ---------------- CREATE TEMPLATE CATEGORY ----------------
const createTemplateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if category already exists
        const existing = await TemplateCategory.findOne({ name });
        if (existing) return res.status(400).json({ message: "Template Category already exists" });

        const category = new TemplateCategory({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ---------------- GET ALL TEMPLATE CATEGORIES ----------------
const getAllTemplateCategory = async (req, res) => {
    try {
        const categories = await TemplateCategory.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ---------------- GET TEMPLATE CATEGORY BY ID ----------------
const getTemplateCategoryById = async (req, res) => {
    try {
        const category = await TemplateCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Template Category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ---------------- UPDATE TEMPLATE CATEGORY ----------------
const updateTemplateCategory = async (req, res) => {
    try {
        const category = await TemplateCategory.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!category) return res.status(404).json({ message: "Template Category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ---------------- DELETE TEMPLATE CATEGORY ----------------
const deleteTemplateCategory = async (req, res) => {
    try {
        const category = await TemplateCategory.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: "Template Category not found" });
        res.status(200).json({ message: "Template Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    createTemplateCategory,
    getAllTemplateCategory,
    getTemplateCategoryById,
    updateTemplateCategory,
    deleteTemplateCategory,
};
