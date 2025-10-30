const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        },
        authorName: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        readTime: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: true,
        },
        category: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "BlogCategory",
            },
        ],
        tags: [
            {
                type: String,
            },
        ],
        shareLink: {
            type: String,
        },
        thumbnailImg: {
            type: String,
        },
        relatedBlogs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Blog",
            },
        ],
        content: {
            type: String,
        },
        authorDesc: {
            type: String,
        },
        authorGithubLink: {
            type: String,
        },
        authorPortfolioLink: {
            type: String,
        },
        authorOtherProfileLink: {
            type: String,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    },
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
