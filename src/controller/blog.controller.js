const mongoose = require("mongoose");
const Blog = require("../models/blog.model");
const BlogCategory = require("../models/blogCategory.model");
const slugify = require("slugify");


// ---------------- CREATE BLOG ----------------
const createBlog = async (req, res) => {
    try {
        let {
            title,
            desc,
            authorName,
            readTime,
            category,
            tags,
            shareLink,
            relatedBlogs,
            content,
            authorDesc,
            authorGithubLink,
            authorPortfolioLink,
            authorOtherProfileLink,
            isFeatured,
            date,
        } = req.body;

        // ---------------- REQUIRED VALIDATION ----------------
        if (!title || !desc || !authorName) {
            return res.status(400).json({
                message: "Title, description and author name are required.",
            });
        }

        // ---------------- SLUG ----------------
        const slug = slugify(title, { lower: true, strict: true });

        const existingBlog = await Blog.findOne({ slug });
        if (existingBlog) {
            return res.status(400).json({
                message: "A blog with this title already exists.",
            });
        }

        // ---------------- TAGS (JSON SAFE) ----------------
        let parsedTags = [];

        if (tags) {
            try {
                parsedTags = Array.isArray(tags)
                    ? tags
                    : JSON.parse(tags);
            } catch (err) {
                parsedTags = tags
                    .split(",")
                    .map(t => t.trim())
                    .filter(Boolean);
            }
        }

        // ---------------- RELATED BLOGS (OPTIONAL + SAFE) ----------------
        let parsedRelatedBlogs = [];

        if (relatedBlogs) {
            // FormData relatedBlogs[] → array
            if (Array.isArray(relatedBlogs)) {
                parsedRelatedBlogs = relatedBlogs;
            } else {
                parsedRelatedBlogs = [relatedBlogs];
            }
        }

        parsedRelatedBlogs = parsedRelatedBlogs
            .map(id => id?.toString().trim())
            .filter(id => mongoose.Types.ObjectId.isValid(id));

        // ---------------- CATEGORY ----------------
        if (category && !Array.isArray(category)) {
            category = [category];
        }

        if (category && category.length > 0) {
            const validCategories = await Promise.all(
                category.map(async (catId) => {
                    if (!mongoose.Types.ObjectId.isValid(catId)) return false;
                    const cat = await BlogCategory.findById(catId);
                    return !!cat;
                })
            );

            if (validCategories.includes(false)) {
                return res.status(400).json({
                    message: "One or more categories are invalid.",
                });
            }
        }

        // ---------------- CREATE BLOG ----------------
        const newBlog = new Blog({
            title,
            desc,
            authorName,
            readTime,
            category,
            tags: parsedTags,
            shareLink,
            relatedBlogs: parsedRelatedBlogs,
            content,
            authorDesc,
            authorGithubLink,
            authorPortfolioLink,
            authorOtherProfileLink,
            slug,
            isFeatured,
            thumbnailImg: req.file?.path,
            date,
        });

        await newBlog.save();

        return res.status(201).json({
            success: true,
            message: "Blog created successfully.",
            blog: newBlog,
        });

    } catch (error) {
        console.error("Create blog error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create blog.",
            error,
        });
    }
};


// ---------------- GET ALL BLOG ----------------
const getAllBlogs = async (req, res) => {
    try {
        // -------------------- QUERY PARAMETERS --------------------
        const {
            page = 1,
            limit = 10,
            category,
            isFeatured,
            sort = "desc",
            search, // added search
        } = req.query;

        // -------------------- FILTER BUILDING --------------------
        const filter = {};

        // ✅ If category name provided directly (filter by category)
        if (category) {
            const foundCategory = await BlogCategory.findOne({
                name: { $regex: new RegExp(`^${category}$`, "i") },
            });

            if (!foundCategory) {
                return res.status(404).json({
                    success: false,
                    message: `No category found with name "${category}"`,
                });
            }

            filter.category = foundCategory._id;
        }

        // ✅ Featured filter
        if (isFeatured !== undefined) {
            filter.isFeatured = isFeatured === "true";
        }

        // ✅ Search filter — searches in title, desc, authorName, tags, and category name
        if (search) {
            const searchRegex = new RegExp(search, "i");

            // Find categories whose name matches the search text
            const matchedCategories = await BlogCategory.find({
                name: searchRegex,
            }).select("_id");

            const matchedCategoryIds = matchedCategories.map((cat) => cat._id);

            filter.$or = [
                { title: searchRegex },
                { desc: searchRegex },
                { authorName: searchRegex },
                { tags: searchRegex },
                { category: { $in: matchedCategoryIds } }, // category name match
            ];
        }

        // -------------------- PAGINATION SETUP --------------------
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // -------------------- FETCH BLOGS --------------------
        const blogs = await Blog.find(filter)
            .populate("category")
            .populate("relatedBlogs")
            .sort({ date: sort === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalBlogs = await Blog.countDocuments(filter);

        // -------------------- SUCCESS RESPONSE --------------------
        res.status(200).json({
            success: true,
            count: blogs.length,
            totalBlogs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalBlogs / limit),
            data: blogs,
        });

    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching blogs",
            error: error.message,
        });
    }
};


// ---------------- GET SPECIFIC BLOG ----------------
const getSingleBlog = async (req, res) => {
    try {
        const { idOrSlug } = req.params;

        // 🔹 Try to find by slug first
        let blog = await Blog.findOne({ slug: idOrSlug })
            .populate("category")
            .populate({
                path: "relatedBlogs",
                populate: {
                    path: "category"
                },
            });


        if (!blog) {
            if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
                blog = await Blog.findById(idOrSlug)
                    .populate("category")
                    .populate({
                        path: "relatedBlogs",
                        populate: {
                            path: "category"
                        },
                    });
            }
        }


        // 🔹 If still not found
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // 🔹 Increment views count
        blog.views = (blog.views || 0) + 1;
        await blog.save();

        // 🔹 Success response
        res.status(200).json({
            success: true,
            data: blog,
        });

    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching blog",
            error: error.message,
        });
    }
};


// ---------------- UPDATE BLOG ----------------
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;

        let {
            title,
            desc,
            authorName,
            readTime,
            category,
            tags,
            shareLink,
            relatedBlogs,
            content,
            authorDesc,
            authorGithubLink,
            authorPortfolioLink,
            authorOtherProfileLink,
            isFeatured,
            date,
        } = req.body;

        // ---------------- BLOG EXIST CHECK ----------------
        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // ---------------- REQUIRED FIELDS ----------------
        if (!title || !desc || !authorName) {
            return res.status(400).json({
                message: "Title, description, and author name are required.",
            });
        }

        // ---------------- SLUG ----------------
        let slug = existingBlog.slug;
        if (title !== existingBlog.title) {
            slug = slugify(title, { lower: true, strict: true });

            const duplicate = await Blog.findOne({ slug });
            if (duplicate && duplicate._id.toString() !== id) {
                return res.status(400).json({
                    message: "A blog with this title already exists.",
                });
            }
        }

        // ---------------- TAGS (SAFE) ----------------
        let parsedTags = existingBlog.tags;

        if (tags) {
            try {
                parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
            } catch {
                parsedTags = tags
                    .split(",")
                    .map(t => t.trim())
                    .filter(Boolean);
            }
        }

        // ---------------- RELATED BLOGS (OPTIONAL + SAFE) ----------------
        let parsedRelatedBlogs = existingBlog.relatedBlogs;

        if (relatedBlogs) {
            if (Array.isArray(relatedBlogs)) {
                parsedRelatedBlogs = relatedBlogs;
            } else {
                parsedRelatedBlogs = [relatedBlogs];
            }

            parsedRelatedBlogs = parsedRelatedBlogs
                .map(id => id?.toString().trim())
                .filter(id => mongoose.Types.ObjectId.isValid(id));
        }

        // ---------------- CATEGORY ----------------
        if (category && !Array.isArray(category)) {
            category = [category];
        }

        if (category && category.length > 0) {
            const validCategories = await Promise.all(
                category.map(async (catId) => {
                    if (!mongoose.Types.ObjectId.isValid(catId)) return false;
                    const cat = await BlogCategory.findById(catId);
                    return !!cat;
                })
            );

            if (validCategories.includes(false)) {
                return res.status(400).json({
                    message: "One or more categories are invalid.",
                });
            }
        }

        // ---------------- UPDATE OBJECT ----------------
        const updateData = {
            title,
            desc,
            authorName,
            readTime,
            category,
            tags: parsedTags,
            shareLink,
            relatedBlogs: parsedRelatedBlogs,
            content,
            authorDesc,
            authorGithubLink,
            authorPortfolioLink,
            authorOtherProfileLink,
            isFeatured,
            slug,
            date,
        };

        // ---------------- THUMBNAIL ----------------
        if (req.file) {
            updateData.thumbnailImg = req.file.path;
        }

        // ---------------- UPDATE ----------------
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully.",
            blog: updatedBlog,
        });

    } catch (error) {
        console.error("Update blog error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update blog.",
            error: error.message,
        });
    }
};



// ---------------- DELETE BLOG ----------------
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found.",
            });
        }

        await Blog.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully.",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while deleting blog.",
            error: error.message,
        });
    }
};



module.exports = {
    createBlog,
    getAllBlogs,
    getSingleBlog,
    updateBlog,
    deleteBlog
};
