const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
} = require("../controller/template.controller");


router.post("/", authMiddleware, createTemplate);
router.get("/", getAllTemplates);
router.get("/:id", getTemplateById);
router.patch("/:id", authMiddleware, updateTemplate);
router.delete("/:id", authMiddleware, deleteTemplate);


module.exports = router;
