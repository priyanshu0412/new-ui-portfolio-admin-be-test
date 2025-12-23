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


// ------------------------------ UPDATE WHOLE CATEGORY WITH SKILLS ------------------------------
const updateWholeCategoryAndSkill = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { category, skills } = req.body;

        const existingCategory = await SkillCategory.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        // CATEGORY NAME CHECK
        if (category && category !== existingCategory.category) {
            const categoryExists = await SkillCategory.findOne({ category });
            if (categoryExists) {
                return res.status(400).json({ message: "Category name already exists" });
            }
        }

        // VALIDATE
        if (!Array.isArray(skills)) {
            return res.status(400).json({ message: "Skills should be an array" });
        }

        let finalSkillIds = [];

        // MAIN LOOP (UPDATE + CREATE)
        for (let skillData of skills) {
            const { _id, name, level, icon } = skillData;

            // -----------------------------
            // CASE 1: NEW SKILL (no _id)
            // -----------------------------
            if (!_id) {
                // name unique check
                const exists = await Skill.findOne({ name });
                if (exists) {
                    return res.status(400).json({
                        message: `Skill name already exists: ${name}`,
                    });
                }

                const newSkill = await Skill.create({
                    name,
                    level,
                    icon,
                    category: categoryId,
                });

                finalSkillIds.push(newSkill._id);

                await SkillCategory.findByIdAndUpdate(categoryId, {
                    $addToSet: { skills: newSkill._id },
                });

                continue; // move to next skill
            }

            // -----------------------------
            // CASE 2: UPDATE EXISTING SKILL
            // -----------------------------
            const skill = await Skill.findById(_id);
            if (!skill) {
                return res.status(400).json({
                    message: `Skill not found: ${_id}`,
                });
            }

            // NAME DUPLICATE CHECK
            if (name && name !== skill.name) {
                const nameExists = await Skill.findOne({ name });
                if (nameExists) {
                    return res.status(400).json({
                        message: `Skill name already exists: ${name}`,
                    });
                }
            }

            // UPDATE FIELDS
            skill.name = name;
            skill.level = level;
            skill.icon = icon;

            // CATEGORY FIX
            if (String(skill.category) !== categoryId) {
                await SkillCategory.findByIdAndUpdate(skill.category, {
                    $pull: { skills: skill._id },
                });

                await SkillCategory.findByIdAndUpdate(categoryId, {
                    $addToSet: { skills: skill._id },
                });

                skill.category = categoryId;
            }

            await skill.save();
            finalSkillIds.push(skill._id);
        }

        // UPDATE CATEGORY
        existingCategory.category = category || existingCategory.category;
        existingCategory.skills = finalSkillIds;
        const updatedCategory = await existingCategory.save();

        return res.json({
            message: "Category + Skills updated successfully",
            data: updatedCategory,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
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


module.exports = {
    createCategoryWithSkills,
    getAllCategoryWithSkills,
    getCategoryWithSkillById,
    deleteCategoryWithSkills,
    updateWholeCategoryAndSkill
};
