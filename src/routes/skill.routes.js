const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    createCategoryWithSkills,
    addSkillsToCategory,
    getAllCategoryWithSkills,
    getCategoryWithSkillById,
    updateCategoryName,
    updateSkillInCategory,
    deleteCategoryWithSkills,
    deleteSkillById,
} = require("../controller/skill.controller");


router.post("/create", authMiddleware, createCategoryWithSkills);
router.post("/createSkill/:categoryId", authMiddleware, addSkillsToCategory);
router.get("/", getAllCategoryWithSkills);
router.get("/:skillId", getCategoryWithSkillById);
router.patch("/category/:categoryId", authMiddleware, updateCategoryName);
router.patch("/:skillId", authMiddleware, updateSkillInCategory);
router.delete("/:categoryId", authMiddleware, deleteCategoryWithSkills);
router.delete("/deleteSkill/:skillId", authMiddleware, deleteSkillById);


module.exports = router;
