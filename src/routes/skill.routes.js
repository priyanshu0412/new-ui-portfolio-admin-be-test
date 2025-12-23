const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    createCategoryWithSkills,
    getAllCategoryWithSkills,
    getCategoryWithSkillById,
    deleteCategoryWithSkills,
    updateWholeCategoryAndSkill,
} = require("../controller/skill.controller");


router.post("/create", authMiddleware, createCategoryWithSkills);
router.get("/", getAllCategoryWithSkills);
router.get("/:skillId", getCategoryWithSkillById);
router.put("/:id", authMiddleware, updateWholeCategoryAndSkill);
router.delete("/:categoryId", authMiddleware, deleteCategoryWithSkills);


module.exports = router;
