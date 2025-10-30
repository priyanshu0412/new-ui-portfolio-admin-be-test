const BlogCategory = require("../models/blogCategory.model")


// ---------------- CREATE CATEGORY ----------------
const createBlogCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existing = await BlogCategory.findOne({ name });
        if (existing) return res.status(400).json({ message: "Category already exists" });

        const category = new BlogCategory({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


// ---------------- GET ALL CATEGORIES ----------------
const getAllBlogCategory = async (req, res) => {
    try {
        const categories = await BlogCategory.find();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


// ---------------- GET CATEGORY BY ID ----------------
const getSpecificCategoryBlog = async (req, res) => {
    try {
        const category = await BlogCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


// ---------------- UPDATE CATEGORY ----------------
const updateBlogCategory = async (req, res) => {
    try {
        const category = await BlogCategory.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ---------------- DELETE CATEGORY ----------------
const deleteBlogCategory = async (req, res) => {
    try {
        const category = await BlogCategory.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


module.exports = {
    createBlogCategory,
    getAllBlogCategory,
    getSpecificCategoryBlog,
    updateBlogCategory,
    deleteBlogCategory
};
