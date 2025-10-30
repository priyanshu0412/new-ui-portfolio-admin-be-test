const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const projectUpload = require("../middleware/projectUpload.middleware")
const {
    crateProject,
    getAllProject,
    getSpecificProject,
    deleteProject,
    updateProject
} = require("../controller/project.controller")


router.post("/", authMiddleware, projectUpload.single("thumbnailImg"), crateProject)
router.get("/", getAllProject)
router.get("/:id", getSpecificProject)
router.patch("/:id", authMiddleware, projectUpload.single("thumbnailImg"), updateProject)
router.delete("/:id", authMiddleware, deleteProject)


module.exports = router