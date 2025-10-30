const Skill = require("../models/skills.model");
const SkillCategory = require("../models/skillsCategory.model");


// ------------------------------ CREATE CATEGORY WITH SKILL ------------------------------
const createCategoryWithSkills = async (req, res) => {
    try {
        const { category, skills } = req.body;

        // ---------- Validation ----------
        if (!category || !skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                message: "Category and skills (array) are required",
            });
        }

        // ---------- Check duplicate category ----------
        const existingCategory = await SkillCategory.findOne({ category });
        if (existingCategory) {
            return res.status(400).json({
                message: `Category "${category}" already exists`,
            });
        }

        // ---------- Check for duplicate skill names ----------
        const skillNames = skills.map((s) => s.name.toLowerCase().trim());
        const uniqueNames = new Set(skillNames);
        if (uniqueNames.size !== skillNames.length) {
            return res.status(400).json({
                message: "Duplicate skill names found within the same category",
            });
        }

        // ---------- Validate all skills ----------
        for (const s of skills) {
            if (!s.name || !s.level || !s.icon) {
                return res.status(400).json({
                    message: "Each skill must have name, level, and icon",
                });
            }
        }

        // ---------- Create category ----------
        const newCategory = new SkillCategory({ category, skills: [] });
        await newCategory.save();

        // ---------- Create and link each skill ----------
        const skillDocs = [];
        for (const s of skills) {
            const newSkill = new Skill({
                name: s.name,
                level: s.level,
                icon: s.icon,
                category: newCategory._id,
            });
            await newSkill.save();
            skillDocs.push(newSkill._id);
        }

        // ---------- Update category with skill IDs ----------
        newCategory.skills = skillDocs;
        await newCategory.save();

        // ---------- Populate response ----------
        const populatedCategory = await SkillCategory.findById(newCategory._id).populate("skills");

        res.status(201).json({
            message: "Category and skills created successfully",
            category: populatedCategory,
        });
    } catch (error) {
        console.error("Create Category Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ------------------------------ CREATE SPECIFIC SKILL ------------------------------
const addSkillsToCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { skills } = req.body;

        const category = await SkillCategory.findById(categoryId).populate("skills");
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // 🧠 Check for duplicate skills (within same category)
        const existingSkillNames = category.skills.map((s) =>
            s.name.toLowerCase().trim()
        );
        const newSkillNames = skills.map((s) => s.name.toLowerCase().trim());

        for (const name of newSkillNames) {
            if (existingSkillNames.includes(name)) {
                return res.status(400).json({
                    message: `Skill "${name}" already exists in this category`,
                });
            }
        }

        // ✅ Create and link new skills
        const newSkillDocs = [];
        for (const s of skills) {
            if (!s.name || !s.level || !s.icon) {
                return res
                    .status(400)
                    .json({ message: "Each skill must have name, level, and icon" });
            }

            const newSkill = await Skill.create({
                name: s.name.trim(),
                level: s.level.trim(),
                icon: s.icon.trim(),
                category: categoryId,
            });

            newSkillDocs.push(newSkill._id);
        }

        category.skills.push(...newSkillDocs);
        await category.save();

        const updatedCategory = await SkillCategory.findById(categoryId).populate(
            "skills"
        );

        res.status(200).json({
            message: "New skills added successfully",
            category: updatedCategory,
        });
    } catch (error) {
        console.error("Add Skills Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ------------------------------ GET ALL CATEGORY WITH SKILLS ------------------------------
const getAllCategoryWithSkills = async (req, res) => {
    try {
        const skills = await SkillCategory.find()
            .populate("skills")
            .sort({ createdAt: 1 });

        res.status(200).json(skills);
    } catch (error) {
        console.error("Get All Skills Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ------------------------------ GET SINGLE CATEGORY WITH SKILLS ------------------------------
const getCategoryWithSkillById = async (req, res) => {
    try {
        const category = await SkillCategory.findById(req.params.skillId)
            .populate("skills");

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error("Get Category By ID Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ------------------------------ UPDATE CATEGORY  ------------------------------
const updateCategoryName = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { category } = req.body;

        if (!category) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const skillDoc = await SkillCategory.findById(categoryId).populate("skills");
        if (!skillDoc) {
            return res.status(404).json({ message: "Skill category not found" });
        }

        // Check duplicate category
        const existingCategory = await SkillCategory.findOne({
            category,
            _id: { $ne: categoryId },
        });
        if (existingCategory) {
            return res
                .status(400)
                .json({ message: "Category name already exists" });
        }

        skillDoc.category = category;
        await skillDoc.save();

        res.status(200).json({
            message: "Category name updated successfully",
            updatedCategory: skillDoc,
        });
    } catch (error) {
        console.error("Update Category Name Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------------------ UPDATE SKILL  ------------------------------
const updateSkillInCategory = async (req, res) => {
    try {
        const { skillId } = req.params;
        const { name, level, icon } = req.body;

        const skill = await Skill.findById(skillId);
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        // 🧠 Prevent duplicate skill name inside the same category
        if (name) {
            const duplicate = await Skill.findOne({
                name: { $regex: new RegExp(`^${name}$`, "i") },
                category: skill.category,
                _id: { $ne: skillId },
            });

            if (duplicate) {
                return res
                    .status(400)
                    .json({ message: `Skill "${name}" already exists in this category` });
            }

            skill.name = name.trim();
        }

        if (level) skill.level = level.trim();
        if (icon) skill.icon = icon.trim();

        await skill.save();

        const updatedSkill = await Skill.findById(skillId);

        res.status(200).json({
            message: "Skill updated successfully",
            skill: updatedSkill,
        });
    } catch (error) {
        console.error("Update Skill Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ------------------------------ DELETE WHOLE CATEGORY WITH SKILLS  ------------------------------
const deleteCategoryWithSkills = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await SkillCategory.findById(categoryId);
        if (!category) return res.status(404).json({ message: "Category not found" });

        // Delete all skills linked to this category
        await Skill.deleteMany({ category: categoryId });

        // Delete category itself
        await category.deleteOne();

        res.status(200).json({ message: "Category and all its skills deleted successfully" });
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ------------------------------ DELETE SKILL BY ID  ------------------------------
const deleteSkillById = async (req, res) => {
    try {
        const { skillId } = req.params;

        // Find the skill
        const skill = await Skill.findById(skillId);
        if (!skill) return res.status(404).json({ message: "Skill not found" });

        // Remove skill reference from category
        const category = await SkillCategory.findById(skill.category);
        if (category) {
            category.skills = category.skills.filter(
                (id) => id.toString() !== skillId
            );
            await category.save();
        }

        // Delete the skill
        await Skill.findByIdAndDelete(skillId);

        res.status(200).json({ message: "Skill deleted successfully" });
    } catch (error) {
        console.error("Delete Skill Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    createCategoryWithSkills,
    addSkillsToCategory,
    getAllCategoryWithSkills,
    getCategoryWithSkillById,
    updateCategoryName,
    updateSkillInCategory,
    deleteCategoryWithSkills,
    deleteSkillById,
};
