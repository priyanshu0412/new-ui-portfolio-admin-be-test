const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    createBlogCategory,
    getAllBlogCategory,
    getSpecificCategoryBlog,
    updateBlogCategory,
    deleteBlogCategory,
} = require("../controller/blogCategory.controller");


router.post("/", authMiddleware, createBlogCategory);
router.get("/", getAllBlogCategory);
router.get("/:id", getSpecificCategoryBlog);
router.patch("/:id", authMiddleware, updateBlogCategory);
router.delete("/:id", authMiddleware, deleteBlogCategory);


module.exports = router;
