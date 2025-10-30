const mongoose = require("mongoose");

const blogCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);

module.exports = BlogCategory;
