const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    createExperience,
    getExperienceById,
    getAllExperience,
    updateExperience,
    deleteExperience
} = require("../controller/exp.controller");


router.post("/create", authMiddleware, createExperience);
router.get("/", getAllExperience);
router.get("/:id", getExperienceById);
router.patch("/:id", authMiddleware, updateExperience);
router.delete("/:id", authMiddleware, deleteExperience);


module.exports = router;
