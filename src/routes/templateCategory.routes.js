const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    createTemplateCategory,
    getAllTemplateCategory,
    getTemplateCategoryById,
    updateTemplateCategory,
    deleteTemplateCategory,
} = require("../controller/templateCategory.controller");


router.post("/", authMiddleware, createTemplateCategory);
router.get("/", getAllTemplateCategory);
router.get("/:id", getTemplateCategoryById);
router.patch("/:id", authMiddleware, updateTemplateCategory);
router.delete("/:id", authMiddleware, deleteTemplateCategory);


module.exports = router;
