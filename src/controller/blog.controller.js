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
            date
        } = req.body;

        // 🔹 Basic validation
        if (!title || !desc || !authorName) {
            return res.status(400).json({
                message: "Title, description, and author name are required.",
            });
        }

        // 🔹 Generate slug from title
        const slug = slugify(title, { lower: true, strict: true });

        // 🔹 Check if blog with same slug exists
        const existingBlog = await Blog.findOne({ slug });
        if (existingBlog) {
            return res.status(400).json({ message: "A blog with this title already exists." });
        }

        // 🔹 Handle relatedBlogs (optional)
        if (relatedBlogs && relatedBlogs.length > 0) {
            if (typeof relatedBlogs === "string") {
                relatedBlogs = relatedBlogs.split(",").map(id => id.trim());
            } else if (Array.isArray(relatedBlogs)) {
                relatedBlogs = relatedBlogs.map(id => id.trim());
            }
        } else {
            relatedBlogs = [];
        }

        // 🔹 Handle tags (convert string → array)
        if (tags && typeof tags === "string") {
            tags = tags.split(",").map(tag => tag.trim());
        } else if (!tags) {
            tags = [];
        }

        // 🔹 Ensure category is always an array
        if (category && !Array.isArray(category)) {
            category = [category];
        }

        // 🔹 Validate category IDs (optional)
        if (category && category.length > 0) {
            const categoryChecks = await Promise.all(
                category.map(async (catId) => {
                    const cat = await BlogCategory.findById(catId);
                    return cat ? true : false;
                })
            );

            if (categoryChecks.includes(false)) {
                return res.status(400).json({ message: "One or more categories are invalid." });
            }
        }

        // 🔹 Create new blog
        const newBlog = new Blog({
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
            slug,
            isFeatured,
            thumbnailImg: req.file?.path,
            date
        });

        await newBlog.save();

        res.status(201).json({
            message: "Blog created successfully.",
            blog: newBlog,
        });

    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ message: "Failed to create blog.", error });
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

        // -------------------- EMPTY RESULT --------------------
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No blogs found",
            });
        }

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
        } = req.body;

        // 🔹 Check if blog exists
        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // 🔹 Validate required fields
        if (!title || !desc || !authorName) {
            return res.status(400).json({
                message: "Title, description, and author name are required.",
            });
        }

        // 🔹 Generate slug if title changed
        let slug = existingBlog.slug;
        if (title && title !== existingBlog.title) {
            slug = slugify(title, { lower: true, strict: true });
            const duplicateSlug = await Blog.findOne({ slug });
            if (duplicateSlug && duplicateSlug._id.toString() !== id) {
                return res.status(400).json({
                    message: "A blog with this title already exists.",
                });
            }
        }

        // 🔹 Handle relatedBlogs (convert string → array)
        if (relatedBlogs && relatedBlogs.length > 0) {
            if (typeof relatedBlogs === "string") {
                relatedBlogs = relatedBlogs.split(",").map((id) => id.trim());
            } else if (Array.isArray(relatedBlogs)) {
                relatedBlogs = relatedBlogs.map((id) => id.trim());
            }
        } else {
            relatedBlogs = [];
        }

        // 🔹 Handle tags (convert string → array)
        if (tags && typeof tags === "string") {
            tags = tags.split(",").map((tag) => tag.trim());
        } else if (!tags) {
            tags = [];
        }

        // 🔹 Ensure category is always an array
        if (category && !Array.isArray(category)) {
            category = [category];
        }

        // 🔹 Optional: Validate category IDs
        if (category && category.length > 0) {
            const categoryChecks = await Promise.all(
                category.map(async (catId) => {
                    const cat = await BlogCategory.findById(catId);
                    return !!cat;
                })
            );

            if (categoryChecks.includes(false)) {
                return res
                    .status(400)
                    .json({ message: "One or more categories are invalid." });
            }
        }

        // 🔹 Prepare update object
        const updateData = {
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
            slug,
        };

        // 🔹 If new thumbnail uploaded
        if (req.file) {
            updateData.thumbnailImg = req.file.path;
        }

        // 🔹 Update the blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Blog updated successfully.",
            blog: updatedBlog,
        });
    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json({
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
