const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    countBlog,
    countProject,
    countSubscriber,
    countSkills
} = require("../controller/dashboard.controller");


router.get("/blogs", authMiddleware, countBlog);
router.get("/projects", authMiddleware, countProject);
router.get("/subscribers", authMiddleware, countSubscriber);
router.get("/skills", authMiddleware, countSkills);


module.exports = router;
