const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const blogUpload = require("../middleware/blogUpload.middleware");
const {
    createBlog,
    getAllBlogs,
    getSingleBlog,
    updateBlog,
    deleteBlog
} = require("../controller/blog.controller");


router.post("/", authMiddleware, blogUpload.single("thumbnailImg"), createBlog);
router.get("/", getAllBlogs);
router.get("/:idOrSlug", getSingleBlog);
router.put("/:id", authMiddleware, blogUpload.single("thumbnailImg"), updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);


module.exports = router;
